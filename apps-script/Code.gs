/**
 * Brina & Hugh wedding website - Google Sheets backend.
 *
 * Paste this whole file into Extensions > Apps Script on the wedding
 * spreadsheet, then follow SETUP.md. Run setupSheet() once to build the tabs.
 *
 * Two tabs are used:
 *   Parties - one row per invitation (a single person, a couple, a family).
 *   People  - one row per individual seat, linked to a party by its code.
 */

var TAB_PARTIES = 'Parties';
var TAB_PEOPLE = 'People';

var PARTY_HEADERS = [
  'code',
  'party_name',
  'invite_type',
  'email',
  'phone',
  'preferred_contact',
  'allow_plus_one',
  'invite_sent_at',
  'status',
  'responded_at',
  'songs',
  'message',
  'notes',
];

var PEOPLE_HEADERS = [
  'code',
  'person_id',
  'name',
  'is_plus_one',
  'attending',
  'meal',
  'dietary',
  'dietary_notes',
];

// ---------------------------------------------------------------------------
// Web app entry points
// ---------------------------------------------------------------------------

function doGet(e) {
  // A plain browser visit lands here. Useful for checking the deployment works.
  return json({ ok: true, data: { service: 'brina-and-hugh-rsvp', ready: true } });
}

function doPost(e) {
  try {
    var body = {};
    if (e && e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    }
    var action = body.action;

    if (action === 'getParty') return json({ ok: true, data: getParty(body.code) });
    if (action === 'submitRsvp') return json({ ok: true, data: submitRsvp(body) });

    // Everything below is admin only.
    if (action === 'adminList') {
      requireAdmin(body.token);
      return json({ ok: true, data: adminList() });
    }
    if (action === 'adminUpdateParty') {
      requireAdmin(body.token);
      return json({ ok: true, data: adminUpdateParty(body.code, body.fields || {}) });
    }
    if (action === 'adminAddParty') {
      requireAdmin(body.token);
      return json({ ok: true, data: adminAddParty(body.party || {}) });
    }

    return json({ ok: false, error: 'Unknown action.' });
  } catch (err) {
    return json({ ok: false, error: String((err && err.message) || err) });
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

// ---------------------------------------------------------------------------
// Sheet helpers
// ---------------------------------------------------------------------------

function ss() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function sheet(name) {
  var s = ss().getSheetByName(name);
  if (!s) throw new Error('Missing tab "' + name + '". Run setupSheet() once.');
  return s;
}

/** Reads a whole tab into {headers, rows:[{col:value}], index:{col:n}}. */
function readTab(name) {
  var s = sheet(name);
  var values = s.getDataRange().getValues();
  if (!values.length) return { headers: [], rows: [], index: {}, sheet: s };

  var headers = values[0].map(function (h) {
    return String(h).trim();
  });
  var index = {};
  headers.forEach(function (h, i) {
    index[h] = i;
  });

  var rows = [];
  for (var r = 1; r < values.length; r++) {
    var raw = values[r];
    // Skip fully blank rows so stray whitespace in the sheet is harmless.
    var hasValue = raw.some(function (v) {
      return String(v).trim() !== '';
    });
    if (!hasValue) continue;

    var obj = { _rowNumber: r + 1 };
    headers.forEach(function (h, i) {
      obj[h] = raw[i];
    });
    rows.push(obj);
  }
  return { headers: headers, rows: rows, index: index, sheet: s };
}

function truthy(v) {
  var s = String(v).trim().toLowerCase();
  return s === 'true' || s === 'yes' || s === 'y' || s === '1';
}

function isoNow() {
  return Utilities.formatDate(new Date(), 'Europe/Dublin', "yyyy-MM-dd'T'HH:mm:ssXXX");
}

function clean(v) {
  return String(v == null ? '' : v).trim();
}

/** Dates come back from the sheet as Date objects; send strings to the browser. */
function serialize(v) {
  if (v instanceof Date) {
    return Utilities.formatDate(v, 'Europe/Dublin', "yyyy-MM-dd'T'HH:mm:ssXXX");
  }
  return clean(v);
}

function requireAdmin(token) {
  var expected = PropertiesService.getScriptProperties().getProperty('ADMIN_TOKEN');
  if (!expected) throw new Error('No ADMIN_TOKEN set on the script. See SETUP.md.');
  if (clean(token) !== expected) throw new Error('Wrong passcode.');
}

function findPartyRow(parties, code) {
  var wanted = clean(code).toUpperCase();
  for (var i = 0; i < parties.rows.length; i++) {
    if (clean(parties.rows[i].code).toUpperCase() === wanted) return parties.rows[i];
  }
  return null;
}

function setPartyCells(parties, rowNumber, fields) {
  Object.keys(fields).forEach(function (col) {
    if (col in parties.index) {
      parties.sheet.getRange(rowNumber, parties.index[col] + 1).setValue(fields[col]);
    }
  });
}

// ---------------------------------------------------------------------------
// Public actions
// ---------------------------------------------------------------------------

function getParty(code) {
  var wanted = clean(code).toUpperCase();
  if (!wanted) throw new Error('Please enter your invitation code.');

  var parties = readTab(TAB_PARTIES);
  var match = findPartyRow(parties, wanted);
  if (!match) {
    throw new Error(
      'We could not find that invitation code. Check it against your message, or get in touch and we will sort it out.'
    );
  }

  var people = readTab(TAB_PEOPLE)
    .rows.filter(function (p) {
      return clean(p.code).toUpperCase() === wanted;
    })
    .map(function (p) {
      return {
        person_id: clean(p.person_id),
        name: clean(p.name),
        is_plus_one: truthy(p.is_plus_one),
        attending: clean(p.attending).toLowerCase(),
        meal: clean(p.meal),
        dietary: clean(p.dietary),
        dietary_notes: clean(p.dietary_notes),
      };
    });

  // Deliberately does not return email, phone or the private notes column.
  return {
    code: clean(match.code).toUpperCase(),
    party_name: clean(match.party_name),
    invite_type: clean(match.invite_type),
    allow_plus_one: truthy(match.allow_plus_one),
    status: clean(match.status).toLowerCase() || 'pending',
    responded_at: serialize(match.responded_at),
    songs: clean(match.songs),
    message: clean(match.message),
    people: people,
  };
}

function submitRsvp(body) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var wanted = clean(body.code).toUpperCase();
    if (!wanted) throw new Error('Missing invitation code.');

    var parties = readTab(TAB_PARTIES);
    var partyRow = findPartyRow(parties, wanted);
    if (!partyRow) throw new Error('We could not find that invitation code.');

    var peopleTab = readTab(TAB_PEOPLE);
    var seats = peopleTab.rows.filter(function (p) {
      return clean(p.code).toUpperCase() === wanted;
    });

    var submitted = body.people || [];
    var attendingCount = 0;

    seats.forEach(function (target) {
      var pid = clean(target.person_id);
      var sub = null;
      for (var i = 0; i < submitted.length; i++) {
        if (clean(submitted[i].person_id) === pid) {
          sub = submitted[i];
          break;
        }
      }
      // A seat the guest did not answer for counts as a no rather than being
      // left ambiguous. Iterating over the sheet's seats, not the request's,
      // means a guest cannot invent extra seats by editing the payload.
      if (!sub) sub = { attending: 'no' };

      var attending = clean(sub.attending).toLowerCase() === 'yes' ? 'yes' : 'no';
      if (attending === 'yes') attendingCount++;

      var values = {
        attending: attending,
        meal: attending === 'yes' ? clean(sub.meal) : '',
        dietary: attending === 'yes' ? clean(sub.dietary) : '',
        dietary_notes: attending === 'yes' ? clean(sub.dietary_notes) : '',
      };
      // A plus one supplies their own name; a named guest cannot rename themselves.
      if (truthy(target.is_plus_one)) {
        values.name = clean(sub.name);
      }

      Object.keys(values).forEach(function (col) {
        if (col in peopleTab.index) {
          peopleTab.sheet.getRange(target._rowNumber, peopleTab.index[col] + 1).setValue(values[col]);
        }
      });
    });

    var status =
      attendingCount === 0 ? 'declined' : attendingCount === seats.length ? 'attending' : 'partial';
    var stamp = isoNow();

    setPartyCells(parties, partyRow._rowNumber, {
      status: status,
      responded_at: stamp,
      songs: clean(body.songs),
      message: clean(body.message),
    });

    notifyCouple(wanted, clean(partyRow.party_name), status, attendingCount, {
      message: clean(body.message),
      songs: clean(body.songs),
    });

    return { status: status, attending: attendingCount, seats: seats.length, responded_at: stamp };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Optional. Set a NOTIFY_EMAIL script property to get a note whenever someone
 * responds. A failure here must never break a guest's RSVP, hence the catch.
 */
function notifyCouple(code, partyName, status, attendingCount, extras) {
  try {
    var to = PropertiesService.getScriptProperties().getProperty('NOTIFY_EMAIL');
    if (!to) return;
    var verb = status === 'declined' ? 'sent their apologies' : 'responded';
    var lines = [
      partyName + ' (' + code + ') ' + verb + '.',
      'Status: ' + status,
      'Attending: ' + attendingCount,
    ];
    if (extras && extras.songs) lines.push('', 'Songs to dance to:', extras.songs);
    if (extras && extras.message) lines.push('', 'Their message:', extras.message);
    MailApp.sendEmail(to, 'RSVP: ' + partyName + ' - ' + status, lines.join('\n'));
  } catch (err) {
    // Ignored on purpose.
  }
}

// ---------------------------------------------------------------------------
// Admin actions
// ---------------------------------------------------------------------------

function adminList() {
  var parties = readTab(TAB_PARTIES);
  var peopleRows = readTab(TAB_PEOPLE).rows;

  var byCode = {};
  peopleRows.forEach(function (p) {
    var c = clean(p.code).toUpperCase();
    if (!byCode[c]) byCode[c] = [];
    byCode[c].push({
      person_id: clean(p.person_id),
      name: clean(p.name),
      is_plus_one: truthy(p.is_plus_one),
      attending: clean(p.attending).toLowerCase(),
      meal: clean(p.meal),
      dietary: clean(p.dietary),
      dietary_notes: clean(p.dietary_notes),
    });
  });

  var out = parties.rows.map(function (r) {
    var c = clean(r.code).toUpperCase();
    return {
      code: c,
      party_name: clean(r.party_name),
      invite_type: clean(r.invite_type),
      email: clean(r.email),
      phone: clean(r.phone),
      preferred_contact: clean(r.preferred_contact).toLowerCase(),
      allow_plus_one: truthy(r.allow_plus_one),
      invite_sent_at: serialize(r.invite_sent_at),
      status: clean(r.status).toLowerCase() || 'pending',
      responded_at: serialize(r.responded_at),
      songs: clean(r.songs),
      message: clean(r.message),
      notes: clean(r.notes),
      people: byCode[c] || [],
    };
  });

  return { parties: out, generated_at: isoNow() };
}

function adminUpdateParty(code, fields) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var parties = readTab(TAB_PARTIES);
    var row = findPartyRow(parties, code);
    if (!row) throw new Error('No party with code ' + clean(code).toUpperCase() + '.');

    var allowed = ['invite_sent_at', 'notes', 'email', 'phone', 'preferred_contact', 'party_name'];
    var patch = {};
    allowed.forEach(function (k) {
      if (k in fields) patch[k] = clean(fields[k]);
    });
    setPartyCells(parties, row._rowNumber, patch);
    return { code: clean(row.code).toUpperCase(), updated: Object.keys(patch) };
  } finally {
    lock.releaseLock();
  }
}

function adminAddParty(party) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var parties = readTab(TAB_PARTIES);
    var peopleTab = readTab(TAB_PEOPLE);

    var taken = {};
    parties.rows.forEach(function (r) {
      taken[clean(r.code).toUpperCase()] = true;
    });

    var code = clean(party.code).toUpperCase() || newCode(taken);
    if (taken[code]) throw new Error('The code ' + code + ' is already in use.');

    var names = (party.names || []).map(clean).filter(function (n) {
      return n !== '';
    });
    var allowPlusOne = !!party.allow_plus_one;
    if (!names.length) throw new Error('Add at least one guest name.');

    var partyName = clean(party.party_name) || names.join(' and ');
    var inviteType =
      clean(party.invite_type) ||
      (allowPlusOne ? 'single_plus_one' : names.length > 1 ? 'couple' : 'single');

    var partyRecord = {
      code: code,
      party_name: partyName,
      invite_type: inviteType,
      email: clean(party.email),
      phone: clean(party.phone),
      preferred_contact: clean(party.preferred_contact).toLowerCase(),
      allow_plus_one: allowPlusOne ? 'TRUE' : 'FALSE',
      invite_sent_at: '',
      status: 'pending',
      responded_at: '',
      songs: '',
      message: '',
      notes: clean(party.notes),
    };
    parties.sheet.appendRow(
      parties.headers.map(function (h) {
        return h in partyRecord ? partyRecord[h] : '';
      })
    );

    var peopleRecords = names.map(function (n, i) {
      return { code: code, person_id: 'p' + (i + 1), name: n, is_plus_one: 'FALSE' };
    });
    if (allowPlusOne) {
      peopleRecords.push({
        code: code,
        person_id: 'p' + (names.length + 1),
        name: '',
        is_plus_one: 'TRUE',
      });
    }
    peopleRecords.forEach(function (rec) {
      peopleTab.sheet.appendRow(
        peopleTab.headers.map(function (h) {
          return h in rec ? rec[h] : '';
        })
      );
    });

    return { code: code, seats: peopleRecords.length };
  } finally {
    lock.releaseLock();
  }
}

/** Six characters, no 0/O/1/I so codes survive being read aloud or retyped. */
function newCode(taken) {
  var alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  for (var attempt = 0; attempt < 200; attempt++) {
    var code = '';
    for (var i = 0; i < 6; i++) {
      code += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }
    if (!taken[code]) return code;
  }
  throw new Error('Could not generate a free invite code.');
}

// ---------------------------------------------------------------------------
// One-off setup. Run this from the Apps Script editor, once.
// ---------------------------------------------------------------------------

/**
 * Safe to run again at any time. It creates whatever is missing and leaves
 * everything else alone, so if a new column is ever added to this script you
 * just re-run this rather than rebuilding the sheet.
 */
function setupSheet() {
  var book = ss();
  var added = [];

  var parties = book.getSheetByName(TAB_PARTIES) || book.insertSheet(TAB_PARTIES);
  if (parties.getLastRow() === 0) {
    parties.appendRow(PARTY_HEADERS);
    parties.appendRow([
      'DEMO01',
      'Aoife and Cian Murphy',
      'couple',
      'example@example.com',
      '+353871234567',
      'whatsapp',
      'FALSE',
      '',
      'pending',
      '',
      '',
      '',
      'Example row. Delete it once you are happy everything works.',
    ]);
  } else {
    added = added.concat(ensureHeaders(parties, PARTY_HEADERS, TAB_PARTIES));
  }
  parties.getRange(1, 1, 1, parties.getLastColumn()).setFontWeight('bold');
  parties.setFrozenRows(1);

  var people = book.getSheetByName(TAB_PEOPLE) || book.insertSheet(TAB_PEOPLE);
  if (people.getLastRow() === 0) {
    people.appendRow(PEOPLE_HEADERS);
    people.appendRow(['DEMO01', 'p1', 'Aoife Murphy', 'FALSE', '', '', '', '']);
    people.appendRow(['DEMO01', 'p2', 'Cian Murphy', 'FALSE', '', '', '', '']);
  } else {
    added = added.concat(ensureHeaders(people, PEOPLE_HEADERS, TAB_PEOPLE));
  }
  people.getRange(1, 1, 1, people.getLastColumn()).setFontWeight('bold');
  people.setFrozenRows(1);

  SpreadsheetApp.getUi().alert(
    added.length
      ? 'Added missing columns: ' + added.join(', ') + '.\n\nYour existing rows are untouched.'
      : 'Tabs are ready.\n\nNext: Project Settings, Script Properties, add ADMIN_TOKEN with a passcode of your choosing. Optionally add NOTIFY_EMAIL to get an email on every RSVP.'
  );
}

/** Appends any expected header this tab does not already have. */
function ensureHeaders(s, expected, tabName) {
  var have = s.getRange(1, 1, 1, s.getLastColumn()).getValues()[0].map(function (h) {
    return String(h).trim();
  });
  var missing = expected.filter(function (h) {
    return have.indexOf(h) === -1;
  });
  missing.forEach(function (h, i) {
    s.getRange(1, have.length + i + 1).setValue(h);
  });
  return missing.map(function (h) {
    return tabName + '.' + h;
  });
}
