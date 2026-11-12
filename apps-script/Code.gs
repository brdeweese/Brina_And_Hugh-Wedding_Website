/**
 * Brina & Hugh wedding website - Google Sheets backend.
 *
 * Paste this whole file into Extensions > Apps Script on the wedding
 * spreadsheet, then follow SETUP.md. Run setupSheet() once to build the tabs.
 *
 * Two tabs are used:
 *   Guests  - one row per invitation. Guests unlock the RSVP by typing the
 *             name in `name` (or `partner`, for a couple) on the website.
 *   Replies - one row per invitation that has replied. A reply sent again
 *             overwrites the row, and the previous answers are kept in
 *             `history_json`.
 *
 * Script properties (Project Settings > Script Properties):
 *   ADMIN_TOKEN   required. The passcode that opens the guest list on the site.
 *   NOTIFY_EMAIL  optional. You get an email every time somebody replies.
 *
 * Adding a guest also files their invitation in a Drive folder called
 * "Wedding Website Invites". That needs permission to see and create files in
 * your Drive, which Apps Script will ask for the first time you deploy this
 * version. The script only ever makes that one folder and writes invitations
 * into it.
 */

var TAB_GUESTS = 'Guests';

// The Drive folder the invitations are filed in. It is made the first time one
// is saved, in the root of the same Google account the script runs as.
var INVITE_FOLDER = 'Wedding Website Invites';
var TAB_REPLIES = 'Replies';

var GUEST_HEADERS = ['id', 'name', 'type', 'partner', 'added_at', 'invite_url'];
var REPLY_HEADERS = [
  'invite_id',
  'invited_as',
  'summary',
  'attending_count',
  'songs',
  'comments',
  'created_at',
  'updated_at',
  'revisions',
  'people_json',
  'history_json',
];

var TYPES = ['single', 'plus_one', 'couple'];
var DIETS = ['No dietary requirements', 'Vegetarian', 'Vegan', 'Pescatarian', 'Gluten-free', 'Dairy-free', 'Nut allergy', 'Other'];

// Replies can be sent and changed until the end of 1 June 2027, Irish time.
var DEADLINE = new Date('2027-06-02T00:00:00+01:00');

// ---------------------------------------------------------------------------
// Web app entry points
// ---------------------------------------------------------------------------

function doGet() {
  return json({ ok: true, data: 'Brina & Hugh RSVP backend is running.' });
}

function doPost(e) {
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var action = body.action;

    if (action === 'findGuest') return json({ ok: true, data: findGuest(body.name) });
    if (action === 'submitRsvp') return json({ ok: true, data: submitRsvp(body) });

    if (action === 'adminList') {
      requireAdmin(body.token);
      return json({ ok: true, data: adminList() });
    }
    if (action === 'adminAddGuest') {
      requireAdmin(body.token);
      return json({ ok: true, data: adminAddGuest(body) });
    }
    if (action === 'adminRemoveGuest') {
      requireAdmin(body.token);
      return json({ ok: true, data: adminRemoveGuest(body.id) });
    }
    if (action === 'adminSaveInvite') {
      requireAdmin(body.token);
      return json({ ok: true, data: adminSaveInvite(body) });
    }

    return json({ ok: false, error: 'Unknown action.' });
  } catch (err) {
    return json({ ok: false, error: err && err.userMessage ? err.userMessage : 'Something went wrong. Please try again.', code: err && err.code });
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function fail(message, code) {
  var e = new Error(message);
  e.userMessage = message;
  e.code = code || 'error';
  throw e;
}

// ---------------------------------------------------------------------------
// Sheet helpers
// ---------------------------------------------------------------------------

function sheet(name) {
  var s = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!s) fail('The guest list is not set up yet.', 'not_setup');
  return s;
}

/** Reads a tab into { headers, rows } where each row has its 1-based sheet row number in `_row`. */
function readTab(name) {
  var s = sheet(name);
  var values = s.getDataRange().getValues();
  var headers = values[0].map(function (h) { return String(h).trim(); });
  var rows = [];
  for (var i = 1; i < values.length; i++) {
    var raw = values[i];
    if (!raw.some(function (v) { return v !== '' && v !== null; })) continue;
    var o = { _row: i + 1 };
    headers.forEach(function (h, j) { o[h] = raw[j] instanceof Date ? raw[j].toISOString() : raw[j]; });
    rows.push(o);
  }
  return { sheet: s, headers: headers, rows: rows };
}

function writeRow(tab, rowNumber, record) {
  var line = tab.headers.map(function (h) { return record[h] === undefined ? '' : record[h]; });
  if (rowNumber) tab.sheet.getRange(rowNumber, 1, 1, line.length).setValues([line]);
  else tab.sheet.appendRow(line);
}

function clean(v, max) {
  return String(v === undefined || v === null ? '' : v).trim().slice(0, max || 200);
}

/** Same matching rule as the website: accents, case and punctuation are ignored. */
function norm(s) {
  return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function parseJson(s, fallback) {
  try { return s ? JSON.parse(s) : fallback; } catch (e) { return fallback; }
}

function guestOut(r) {
  return { id: String(r.id), name: String(r.name), type: String(r.type || 'single'), partner: String(r.partner || '') };
}

function replyOut(r) {
  return {
    inviteId: String(r.invite_id),
    invitedAs: String(r.invited_as),
    people: parseJson(r.people_json, []),
    songs: String(r.songs || ''),
    comments: String(r.comments || ''),
    createdAt: String(r.created_at || ''),
    updatedAt: String(r.updated_at || ''),
    revisions: Number(r.revisions) || 0,
  };
}

function matchGuest(rows, name) {
  var k = norm(name);
  if (!k) return null;
  for (var i = 0; i < rows.length; i++) {
    var g = rows[i];
    if (norm(g.name) === k) return { row: g, typedPartner: false };
    if (String(g.type) === 'couple' && norm(g.partner) === k) return { row: g, typedPartner: true };
  }
  return null;
}

function requireAdmin(token) {
  var real = PropertiesService.getScriptProperties().getProperty('ADMIN_TOKEN');
  if (!real) fail('Set ADMIN_TOKEN in the Apps Script project settings first.', 'no_token');
  if (String(token || '') !== real) fail('That passcode isn\u2019t right.', 'bad_token');
}

// ---------------------------------------------------------------------------
// Guest actions
// ---------------------------------------------------------------------------

/** A guest types their name. Returns their invitation and any earlier reply, or a not_found error. */
function findGuest(name) {
  var hit = matchGuest(readTab(TAB_GUESTS).rows, name);
  if (!hit) fail('We couldn\u2019t find that name on the guest list. Please type it as it appears on your invitation.', 'not_found');
  var g = guestOut(hit.row);
  var reply = null;
  readTab(TAB_REPLIES).rows.forEach(function (r) { if (String(r.invite_id) === g.id) reply = replyOut(r); });
  return { invite: g, typedPartner: hit.typedPartner, reply: reply };
}

/** Save or update a reply. The guest's typed name must still match the invitation. */
function submitRsvp(body) {
  if (Date.now() >= DEADLINE.getTime()) fail('Replies closed on 1 June 2027. Please contact Brina & Hugh directly.', 'closed');

  var hit = matchGuest(readTab(TAB_GUESTS).rows, body.name);
  if (!hit || String(hit.row.id) !== String(body.inviteId)) fail('We couldn\u2019t match this reply to an invitation. Please type your name again.', 'not_found');
  var g = guestOut(hit.row);

  var seats = g.type === 'single' ? 1 : 2;
  var people = (Array.isArray(body.people) ? body.people : []).slice(0, seats).map(function (p, i) {
    var fixedName = i === 0 ? (hit.typedPartner ? g.partner : g.name) : (g.type === 'couple' ? (hit.typedPartner ? g.name : g.partner) : null);
    var dietary = (Array.isArray(p.dietary) ? p.dietary : []).filter(function (d) { return DIETS.indexOf(d) >= 0; });
    return {
      name: fixedName || clean(p.name, 80) || ('Guest of ' + (hit.typedPartner ? g.partner : g.name)),
      attending: p.attending === true,
      dietary: dietary,
      dietaryOther: dietary.indexOf('Other') >= 0 ? clean(p.dietaryOther, 200) : '',
    };
  });
  if (!people.length) fail('Please answer for everyone on the invitation.', 'bad_request');

  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var tab = readTab(TAB_REPLIES);
    var prev = null;
    tab.rows.forEach(function (r) { if (String(r.invite_id) === g.id) prev = r; });
    var now = new Date().toISOString();
    var history = prev ? parseJson(prev.history_json, []).slice(-4) : [];
    if (prev) history.push({ people: parseJson(prev.people_json, []), songs: prev.songs, comments: prev.comments, savedAt: prev.updated_at });

    var record = {
      invite_id: g.id,
      invited_as: g.name,
      summary: people.map(summaryLine).join('\n'),
      attending_count: people.filter(function (p) { return p.attending; }).length,
      songs: clean(body.songs, 2000),
      comments: clean(body.comments, 2000),
      created_at: prev ? prev.created_at : now,
      updated_at: now,
      revisions: prev ? (Number(prev.revisions) || 0) + 1 : 0,
      people_json: JSON.stringify(people),
      history_json: JSON.stringify(history),
    };
    writeRow(tab, prev ? prev._row : null, record);
    notify(record, !!prev);
    return replyOut(record);
  } finally {
    lock.releaseLock();
  }
}

function summaryLine(p) {
  if (!p.attending) return p.name + ': declines';
  var d = p.dietary.filter(function (x) { return x !== 'Other'; });
  if (p.dietaryOther) d.push(p.dietaryOther);
  return p.name + ': attending' + (d.length ? ' (' + d.join(', ') + ')' : '');
}

function notify(record, changed) {
  var to = PropertiesService.getScriptProperties().getProperty('NOTIFY_EMAIL');
  if (!to) return;
  try {
    MailApp.sendEmail({
      to: to,
      subject: (changed ? 'RSVP changed: ' : 'New RSVP: ') + record.invited_as,
      body: record.summary +
        (record.songs ? '\n\nSongs:\n' + record.songs : '') +
        (record.comments ? '\n\nNote:\n' + record.comments : ''),
    });
  } catch (e) {
    // a failed email must never lose the reply itself
  }
}

// ---------------------------------------------------------------------------
// Admin actions (need ADMIN_TOKEN)
// ---------------------------------------------------------------------------

function adminList() {
  return {
    guests: readTab(TAB_GUESTS).rows.map(guestOut),
    replies: readTab(TAB_REPLIES).rows.map(replyOut),
  };
}

function adminAddGuest(body) {
  var name = clean(body.name, 80);
  var type = TYPES.indexOf(body.type) >= 0 ? body.type : 'single';
  var partner = type === 'couple' ? clean(body.partner, 80) : '';
  if (!name) fail('Enter the guest\u2019s full name.', 'bad_request');
  if (type === 'couple' && !partner) fail('Enter the partner\u2019s full name for a couple\u2019s invitation.', 'bad_request');

  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var tab = readTab(TAB_GUESTS);
    if (matchGuest(tab.rows, name) || (partner && matchGuest(tab.rows, partner))) fail('That name is already on the guest list.', 'duplicate');
    var record = { id: Utilities.getUuid().replace(/-/g, '').slice(0, 12), name: name, type: type, partner: partner, added_at: new Date().toISOString() };
    writeRow(tab, null, record);
    return guestOut(record);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Files an invitation in Drive. The picture is drawn in the browser, where the
 * fonts and the stationery already are, and arrives here as base64.
 */
function adminSaveInvite(body) {
  var id = clean(body.id, 40);
  var filename = clean(body.filename, 120) || 'Invitation.jpg';
  var b64 = String(body.image || '');
  if (!id) fail('Missing the invitation this belongs to.', 'bad_request');
  if (!b64) fail('No invitation was sent.', 'bad_request');

  var folder = inviteFolder();
  // One file per invitation. Saving again replaces the old one rather than
  // leaving two copies with the same name.
  var old = folder.getFilesByName(filename);
  while (old.hasNext()) old.next().setTrashed(true);

  var blob = Utilities.newBlob(Utilities.base64Decode(b64), 'image/jpeg', filename);
  var file = folder.createFile(blob);
  var url = file.getUrl();

  // Keep the link on the guest's row, if the sheet has a column for it. An
  // older sheet without one still works; it just has nowhere to note it.
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var tab = readTab(TAB_GUESTS);
    if (tab.headers.indexOf('invite_url') >= 0) {
      tab.rows.forEach(function (r) {
        if (String(r.id) !== id) return;
        r.invite_url = url;
        writeRow(tab, r._row, r);
      });
    }
  } finally {
    lock.releaseLock();
  }

  return { url: url, folder: folder.getUrl() };
}

function inviteFolder() {
  var it = DriveApp.getFoldersByName(INVITE_FOLDER);
  return it.hasNext() ? it.next() : DriveApp.createFolder(INVITE_FOLDER);
}

function adminRemoveGuest(id) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var tab = readTab(TAB_GUESTS);
    var row = null;
    tab.rows.forEach(function (r) { if (String(r.id) === String(id)) row = r; });
    if (!row) fail('That guest is no longer on the list.', 'not_found');
    tab.sheet.deleteRow(row._row);
    return { removed: String(id) };
  } finally {
    lock.releaseLock();
  }
}

// ---------------------------------------------------------------------------
// One-off setup: run this from the Apps Script editor
// ---------------------------------------------------------------------------

function setupSheet() {
  var book = SpreadsheetApp.getActiveSpreadsheet();
  [[TAB_GUESTS, GUEST_HEADERS], [TAB_REPLIES, REPLY_HEADERS]].forEach(function (t) {
    var s = book.getSheetByName(t[0]) || book.insertSheet(t[0]);
    var lastCol = s.getLastColumn();
    var have = lastCol ? s.getRange(1, 1, 1, lastCol).getValues()[0].map(function (h) { return String(h).trim(); }) : [];
    var missing = t[1].filter(function (h) { return have.indexOf(h) < 0; });
    if (missing.length) s.getRange(1, have.filter(String).length + 1, 1, missing.length).setValues([missing]);
    s.setFrozenRows(1);
    s.getRange(1, 1, 1, s.getLastColumn()).setFontWeight('bold');
  });
  var blank = book.getSheetByName('Sheet1');
  if (blank && blank.getLastRow() === 0 && book.getSheets().length > 2) book.deleteSheet(blank);
  Logger.log('Guests and Replies tabs are ready.');
}
