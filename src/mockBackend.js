/**
 * A fake guest list that lives in memory, for trying the RSVP and dashboard
 * pages before the Google Sheet is connected.
 *
 * Only active with `npm run dev` and only when the URL carries ?mock=1, which
 * is then remembered for the tab. It is never included in a production build.
 * Passcode is "demo".
 */

const MOCK_TOKEN = 'demo'

let parties = [
  {
    code: 'KQ4M7B',
    party_name: 'Aoife and Cian Murphy',
    invite_type: 'couple',
    email: 'aoife@example.com',
    phone: '+353871234567',
    preferred_contact: 'whatsapp',
    allow_plus_one: false,
    invite_sent_at: '2026-09-01',
    status: 'attending',
    responded_at: '2026-09-03T19:04:00+01:00',
    message: 'Cannot wait. Please play something we can actually dance to.',
    notes: '',
    people: [
      { person_id: 'p1', name: 'Aoife Murphy', is_plus_one: false, attending: 'yes', meal: 'Fish', dietary: 'Gluten free', dietary_notes: '' },
      { person_id: 'p2', name: 'Cian Murphy', is_plus_one: false, attending: 'yes', meal: 'Beef', dietary: '', dietary_notes: '' },
    ],
  },
  {
    code: 'TR9XP2',
    party_name: 'Niamh Byrne',
    invite_type: 'single_plus_one',
    email: '',
    phone: '+353861112223',
    preferred_contact: 'sms',
    allow_plus_one: true,
    invite_sent_at: '2026-09-01',
    status: 'pending',
    responded_at: '',
    message: '',
    notes: 'Works with Brina.',
    people: [
      { person_id: 'p1', name: 'Niamh Byrne', is_plus_one: false, attending: '', meal: '', dietary: '', dietary_notes: '' },
      { person_id: 'p2', name: '', is_plus_one: true, attending: '', meal: '', dietary: '', dietary_notes: '' },
    ],
  },
  {
    code: 'HD5W8N',
    party_name: 'Tom Kelly',
    invite_type: 'single',
    email: 'tom@example.com',
    phone: '',
    preferred_contact: 'email',
    allow_plus_one: false,
    invite_sent_at: '2026-09-02',
    status: 'declined',
    responded_at: '2026-09-05T09:12:00+01:00',
    message: 'Away that whole week, gutted. Have a wonderful day.',
    notes: '',
    people: [
      { person_id: 'p1', name: 'Tom Kelly', is_plus_one: false, attending: 'no', meal: '', dietary: '', dietary_notes: '' },
    ],
  },
  {
    code: 'GB3JV6',
    party_name: 'The Walsh family',
    invite_type: 'family',
    email: 'walsh@example.com',
    phone: '+353851234999',
    preferred_contact: 'whatsapp',
    allow_plus_one: false,
    invite_sent_at: '',
    status: 'pending',
    responded_at: '',
    message: '',
    notes: 'Hugh’s aunt and uncle.',
    people: [
      { person_id: 'p1', name: 'Mary Walsh', is_plus_one: false, attending: '', meal: '', dietary: '', dietary_notes: '' },
      { person_id: 'p2', name: 'Seamus Walsh', is_plus_one: false, attending: '', meal: '', dietary: '', dietary_notes: '' },
      { person_id: 'p3', name: 'Ella Walsh', is_plus_one: false, attending: '', meal: '', dietary: '', dietary_notes: '' },
    ],
  },
]

const find = (code) =>
  parties.find((p) => p.code.toUpperCase() === String(code || '').trim().toUpperCase())

const clone = (v) => JSON.parse(JSON.stringify(v))

const publicView = (p) => {
  const { email, phone, notes, preferred_contact, invite_sent_at, ...rest } = clone(p)
  return rest
}

function requireAdmin(token) {
  if (String(token).trim() !== MOCK_TOKEN) throw new Error('Wrong passcode. In mock mode it is "demo".')
}

export async function mockCall(action, payload) {
  // A short pause so loading states are actually visible while testing.
  await new Promise((r) => setTimeout(r, 320))

  if (action === 'getParty') {
    const p = find(payload.code)
    if (!p) throw new Error('We could not find that invitation code. Try KQ4M7B, TR9XP2, HD5W8N or GB3JV6.')
    return publicView(p)
  }

  if (action === 'submitRsvp') {
    const p = find(payload.code)
    if (!p) throw new Error('We could not find that invitation code.')
    let attending = 0
    p.people.forEach((seat) => {
      const sub = (payload.people || []).find((s) => s.person_id === seat.person_id) || { attending: 'no' }
      seat.attending = sub.attending === 'yes' ? 'yes' : 'no'
      if (seat.attending === 'yes') attending++
      seat.meal = seat.attending === 'yes' ? sub.meal || '' : ''
      seat.dietary = seat.attending === 'yes' ? sub.dietary || '' : ''
      seat.dietary_notes = seat.attending === 'yes' ? sub.dietary_notes || '' : ''
      if (seat.is_plus_one) seat.name = sub.name || ''
    })
    p.status = attending === 0 ? 'declined' : attending === p.people.length ? 'attending' : 'partial'
    p.responded_at = new Date().toISOString()
    p.message = payload.message || ''
    return { status: p.status, attending, seats: p.people.length, responded_at: p.responded_at }
  }

  if (action === 'adminList') {
    requireAdmin(payload.token)
    return { parties: clone(parties), generated_at: new Date().toISOString() }
  }

  if (action === 'adminUpdateParty') {
    requireAdmin(payload.token)
    const p = find(payload.code)
    if (!p) throw new Error('No such party.')
    Object.assign(p, payload.fields)
    return { code: p.code, updated: Object.keys(payload.fields) }
  }

  if (action === 'adminAddParty') {
    requireAdmin(payload.token)
    const party = payload.party || {}
    const names = (party.names || []).map((n) => String(n).trim()).filter(Boolean)
    if (!names.length) throw new Error('Add at least one guest name.')
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = ''
    for (let i = 0; i < 6; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)]
    const people = names.map((n, i) => ({
      person_id: `p${i + 1}`, name: n, is_plus_one: false, attending: '', meal: '', dietary: '', dietary_notes: '',
    }))
    if (party.allow_plus_one) {
      people.push({ person_id: `p${names.length + 1}`, name: '', is_plus_one: true, attending: '', meal: '', dietary: '', dietary_notes: '' })
    }
    parties.push({
      code,
      party_name: party.party_name || names.join(' and '),
      invite_type: party.allow_plus_one ? 'single_plus_one' : names.length > 1 ? 'couple' : 'single',
      email: party.email || '',
      phone: party.phone || '',
      preferred_contact: party.preferred_contact || '',
      allow_plus_one: !!party.allow_plus_one,
      invite_sent_at: '',
      status: 'pending',
      responded_at: '',
      message: '',
      notes: party.notes || '',
      people,
    })
    return { code, seats: people.length }
  }

  throw new Error('Unknown action.')
}
