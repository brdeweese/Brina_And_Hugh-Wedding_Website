import { useEffect, useMemo, useState } from 'react'
import { WEDDING } from '../config.js'
import { adminList, adminUpdateParty, adminAddParty } from '../api.js'
import {
  DEFAULT_TEMPLATE,
  fillTemplate,
  inviteLink,
  whatsappHref,
  smsHref,
  mailtoHref,
  summarise,
  mealTotals,
  dietaryList,
  downloadCsv,
  guestCsv,
  cateringCsv,
} from '../adminHelpers.js'

const TOKEN_KEY = 'bh_admin_token'
const TEMPLATE_KEY = 'bh_invite_template'

const FILTERS = [
  { key: 'all', label: 'Everyone' },
  { key: 'notsent', label: 'Not sent' },
  { key: 'awaiting', label: 'Awaiting reply' },
  { key: 'attending', label: 'Coming' },
  { key: 'declined', label: 'Declined' },
]

const STATUS_LABEL = {
  attending: 'Coming',
  declined: 'Declined',
  partial: 'Some coming',
  pending: 'No reply',
}

/* -------------------------------------------------------------------------- */

function Gate({ onUnlock }) {
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await adminList(value.trim())
      localStorage.setItem(TOKEN_KEY, value.trim())
      onUnlock(value.trim())
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <form className="gate" onSubmit={submit}>
      <h1 className="admin__title">Guest list</h1>
      <p className="admin__sub" style={{ marginBottom: '1.5rem' }}>
        {WEDDING.brideName} &amp; {WEDDING.groomName}
      </p>
      {error && <div className="error-box">{error}</div>}
      <label className="field">
        <span className="label">Passcode</span>
        <input
          className="input"
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
        />
      </label>
      <button className="btn" type="submit" disabled={busy || !value.trim()} style={{ width: '100%' }}>
        {busy ? 'Checking...' : 'Unlock'}
      </button>
    </form>
  )
}

/* -------------------------------------------------------------------------- */

function PeopleTable({ people }) {
  return (
    <table className="people-table">
      <thead>
        <tr>
          <th>Guest</th>
          <th>Reply</th>
          <th>Meal</th>
          <th>Dietary</th>
        </tr>
      </thead>
      <tbody>
        {people.map((x) => (
          <tr key={x.person_id}>
            <td>
              {x.name || <span className="waiting">plus one, not named yet</span>}
              {x.is_plus_one && x.name ? ' (plus one)' : ''}
            </td>
            <td>
              {x.attending === 'yes' ? (
                <span className="yes">Coming</span>
              ) : x.attending === 'no' ? (
                <span className="no">Not coming</span>
              ) : (
                <span className="waiting">No reply</span>
              )}
            </td>
            <td>{x.meal || '—'}</td>
            <td>{[x.dietary, x.dietary_notes].filter(Boolean).join(' · ') || '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function PartyRow({ party, template, token, onChanged, toast }) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  const message = fillTemplate(template, party)
  const link = inviteLink(party.code)
  const sent = Boolean(party.invite_sent_at)

  async function toggleSent() {
    setBusy(true)
    try {
      const stamp = sent ? '' : new Date().toISOString().slice(0, 10)
      await adminUpdateParty(token, party.code, { invite_sent_at: stamp })
      onChanged()
      toast(sent ? 'Marked as not sent' : 'Marked as sent')
    } catch (err) {
      toast(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function copy(text, what) {
    try {
      await navigator.clipboard.writeText(text)
      toast(`${what} copied`)
    } catch {
      toast('Could not copy. Select the text below instead.')
      setOpen(true)
    }
  }

  const wa = whatsappHref(party.phone, message)
  const sms = smsHref(party.phone, message)
  const mail = mailtoHref(party.email, message)

  return (
    <div className="row">
      <div className="row__main">
        <div>
          <button className="row__name" onClick={() => setOpen(!open)} aria-expanded={open}>
            {party.party_name}
            <span className="row__code">{party.code}</span>
          </button>
          <p className="row__meta">
            {party.people.length} {party.people.length === 1 ? 'seat' : 'seats'}
            {party.allow_plus_one ? ' · plus one' : ''}
            {party.phone ? ` · ${party.phone}` : ''}
            {party.email ? ` · ${party.email}` : ''}
          </p>
        </div>

        <div>
          <span className={`badge badge--${sent ? 'sent' : 'notsent'}`}>
            {sent ? `Sent ${party.invite_sent_at}` : 'Not sent'}
          </span>
        </div>

        <div>
          <span className={`badge badge--${party.status}`}>
            {STATUS_LABEL[party.status] || party.status}
          </span>
        </div>

        <div className="row__send">
          <button className="icon-btn" onClick={() => copy(link, 'Link')}>
            Copy link
          </button>
          <button className="icon-btn" onClick={() => copy(message, 'Message')}>
            Copy message
          </button>
          <a
            className="icon-btn"
            href={wa || undefined}
            aria-disabled={!wa}
            target="_blank"
            rel="noreferrer"
            title={wa ? 'Open WhatsApp' : 'No phone number on file'}
          >
            WhatsApp
          </a>
          <a
            className="icon-btn"
            href={sms || undefined}
            aria-disabled={!sms}
            title={sms ? 'Open Messages' : 'No phone number on file'}
          >
            Text
          </a>
          <a
            className="icon-btn"
            href={mail || undefined}
            aria-disabled={!mail}
            title={mail ? 'Open email' : 'No email address on file'}
          >
            Email
          </a>
          <button
            className={`icon-btn ${sent ? 'icon-btn--done' : ''}`}
            onClick={toggleSent}
            disabled={busy}
          >
            {sent ? '✓ Sent' : 'Mark sent'}
          </button>
        </div>
      </div>

      {open && (
        <div className="row__detail">
          <div>
            <PeopleTable people={party.people} />
            <div className="link-line">{link}</div>
          </div>
          <div style={{ display: 'grid', gap: '0.6rem', alignContent: 'start' }}>
            {party.message && (
              <div className="note-box">
                <h4>Their message</h4>
                <p>{party.message}</p>
              </div>
            )}
            {party.notes && (
              <div className="note-box">
                <h4>Your notes</h4>
                <p>{party.notes}</p>
              </div>
            )}
            <div className="note-box">
              <h4>Message that will be sent</h4>
              <p style={{ whiteSpace: 'pre-wrap' }}>{message}</p>
            </div>
            {party.responded_at && (
              <p className="row__meta">Replied {String(party.responded_at).slice(0, 10)}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */

function AddPartyModal({ token, onClose, onAdded, toast }) {
  const [names, setNames] = useState([''])
  const [form, setForm] = useState({
    party_name: '',
    email: '',
    phone: '',
    preferred_contact: 'whatsapp',
    notes: '',
  })
  const [plusOne, setPlusOne] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const res = await adminAddParty(token, {
        ...form,
        names: names.map((n) => n.trim()).filter(Boolean),
        allow_plus_one: plusOne,
      })
      toast(`Added with code ${res.code}`)
      onAdded()
      onClose()
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <div className="modal-scrim" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal" onSubmit={submit}>
        <h2>Add an invitation</h2>
        {error && <div className="error-box">{error}</div>}

        <div className="field">
          <span className="label">Who is invited</span>
          {names.map((n, i) => (
            <div className="name-row" key={i}>
              <input
                className="input"
                value={n}
                onChange={(e) =>
                  setNames(names.map((v, idx) => (idx === i ? e.target.value : v)))
                }
                placeholder={i === 0 ? 'First and last name' : 'Another name'}
              />
              {names.length > 1 && (
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => setNames(names.filter((_, idx) => idx !== i))}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button type="button" className="icon-btn" onClick={() => setNames([...names, ''])}>
            + Add another name
          </button>
          <p className="hint">
            One line per named guest. A couple gets two lines, a family gets one per person.
          </p>
        </div>

        <label className="pill" style={{ display: 'inline-block', marginBottom: '1.25rem' }}>
          <input
            type="checkbox"
            aria-label="Give them a plus one"
            checked={plusOne}
            onChange={(e) => setPlusOne(e.target.checked)}
          />
          <span>{plusOne ? '✓ Includes a plus one' : 'Give them a plus one'}</span>
        </label>

        <label className="field">
          <span className="label">How the invitation should be addressed</span>
          <input
            className="input"
            value={form.party_name}
            onChange={set('party_name')}
            placeholder="Optional. Defaults to the names above joined with 'and'."
          />
        </label>

        <label className="field">
          <span className="label">Phone (with country code, for WhatsApp and texts)</span>
          <input
            className="input"
            value={form.phone}
            onChange={set('phone')}
            placeholder="+353871234567"
          />
        </label>

        <label className="field">
          <span className="label">Email</span>
          <input className="input" type="email" value={form.email} onChange={set('email')} />
        </label>

        <label className="field">
          <span className="label">Send by</span>
          <select className="select" value={form.preferred_contact} onChange={set('preferred_contact')}>
            <option value="whatsapp">WhatsApp</option>
            <option value="sms">Text</option>
            <option value="email">Email</option>
            <option value="post">Post or in person</option>
          </select>
        </label>

        <label className="field">
          <span className="label">Private notes</span>
          <input className="input" value={form.notes} onChange={set('notes')} />
        </label>

        <div className="modal__foot">
          <button type="button" className="btn btn--quiet" onClick={onClose}>
            Cancel
          </button>
          <button className="btn" type="submit" disabled={busy}>
            {busy ? 'Adding...' : 'Add invitation'}
          </button>
        </div>
      </form>
    </div>
  )
}

function TemplateModal({ template, onSave, onClose }) {
  const [text, setText] = useState(template)
  return (
    <div className="modal-scrim" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2>Invitation message</h2>
        <p className="hint" style={{ marginTop: 0 }}>
          Available placeholders: {'{names}'} {'{code}'} {'{link}'} {'{bride}'} {'{groom}'}{' '}
          {'{date}'} {'{venue}'} {'{area}'} {'{city}'} {'{rsvpBy}'}
        </p>
        <textarea
          className="textarea"
          style={{ minHeight: '260px' }}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="modal__foot">
          <button className="btn btn--quiet" onClick={() => setText(DEFAULT_TEMPLATE)}>
            Reset
          </button>
          <button className="btn btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn"
            onClick={() => {
              onSave(text)
              onClose()
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */

export default function AdminPage() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '')
  const [parties, setParties] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [showTemplate, setShowTemplate] = useState(false)
  const [message, setMessage] = useState('')
  const [template, setTemplate] = useState(
    () => localStorage.getItem(TEMPLATE_KEY) || DEFAULT_TEMPLATE
  )

  const toast = (text) => {
    setMessage(text)
    setTimeout(() => setMessage(''), 2600)
  }

  async function load(t = token) {
    if (!t) return
    setLoading(true)
    setError('')
    try {
      const data = await adminList(t)
      setParties(data.parties)
    } catch (err) {
      setError(err.message)
      if (/passcode/i.test(err.message)) {
        localStorage.removeItem(TOKEN_KEY)
        setToken('')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) load(token)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const stats = useMemo(() => (parties ? summarise(parties) : null), [parties])
  const meals = useMemo(() => (parties ? mealTotals(parties) : []), [parties])
  const diets = useMemo(() => (parties ? dietaryList(parties) : []), [parties])

  const visible = useMemo(() => {
    if (!parties) return []
    const q = query.trim().toLowerCase()
    return parties.filter((p) => {
      if (filter === 'notsent' && p.invite_sent_at) return false
      if (filter === 'awaiting' && !(p.invite_sent_at && p.status === 'pending')) return false
      if (filter === 'attending' && !['attending', 'partial'].includes(p.status)) return false
      if (filter === 'declined' && p.status !== 'declined') return false
      if (!q) return true
      const hay = [p.party_name, p.code, p.email, p.phone, ...p.people.map((x) => x.name)]
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [parties, filter, query])

  if (!token) return <main className="admin"><Gate onUnlock={setToken} /></main>

  return (
    <main className="admin">
      <div className="admin__wrap">
        <div className="admin__head">
          <div>
            <h1 className="admin__title">
              {WEDDING.brideName} &amp; {WEDDING.groomName}
            </h1>
            <p className="admin__sub">Guest list · {WEDDING.dateLong}</p>
          </div>
          <div className="admin__actions">
            <button className="btn btn--quiet btn--sm" onClick={() => setShowTemplate(true)}>
              Message
            </button>
            <button
              className="btn btn--quiet btn--sm"
              onClick={() => downloadCsv('guest-list.csv', guestCsv(parties || []))}
              disabled={!parties}
            >
              Export all
            </button>
            <button
              className="btn btn--quiet btn--sm"
              onClick={() => downloadCsv('catering-list.csv', cateringCsv(parties || []))}
              disabled={!parties}
            >
              Catering list
            </button>
            <button className="btn btn--quiet btn--sm" onClick={() => load()} disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            <button className="btn btn--sm" onClick={() => setShowAdd(true)}>
              Add invitation
            </button>
          </div>
        </div>

        {error && <div className="error-box">{error}</div>}

        {stats && (
          <>
            <div className="stats">
              <div className="stat">
                <div className="stat__n">{stats.parties}</div>
                <div className="stat__l">Invitations</div>
              </div>
              <div className="stat">
                <div className="stat__n">{stats.seats}</div>
                <div className="stat__l">People invited</div>
              </div>
              <div className="stat">
                <div className="stat__n">{stats.sent}</div>
                <div className="stat__l">Invites sent</div>
              </div>
              <div className="stat stat--warn">
                <div className="stat__n">{stats.awaiting}</div>
                <div className="stat__l">Awaiting reply</div>
              </div>
              <div className="stat stat--good">
                <div className="stat__n">{stats.attendingPeople}</div>
                <div className="stat__l">Coming</div>
              </div>
              <div className="stat stat--off">
                <div className="stat__n">{stats.declined}</div>
                <div className="stat__l">Declined</div>
              </div>
            </div>

            {meals.length > 0 && (
              <div className="meal-totals">
                {meals.map(([label, n]) => (
                  <span className="meal-total" key={label}>
                    <b>{n}</b> {label}
                  </span>
                ))}
                {diets.length > 0 && (
                  <span className="meal-total">
                    <b>{diets.length}</b> with dietary notes
                  </span>
                )}
              </div>
            )}
          </>
        )}

        <div className="toolbar">
          <input
            className="input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a name, code, number or email"
          />
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className="chip"
              aria-pressed={filter === f.key}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {!parties && loading && (
          <div className="loading-state">
            <div className="spinner" />
          </div>
        )}

        <div className="rows">
          {visible.map((p) => (
            <PartyRow
              key={p.code}
              party={p}
              template={template}
              token={token}
              onChanged={() => load()}
              toast={toast}
            />
          ))}
        </div>

        {parties && !visible.length && (
          <p className="hint center" style={{ marginTop: '2rem' }}>
            Nothing matches that. Try a different filter.
          </p>
        )}
      </div>

      {showAdd && (
        <AddPartyModal
          token={token}
          onClose={() => setShowAdd(false)}
          onAdded={() => load()}
          toast={toast}
        />
      )}
      {showTemplate && (
        <TemplateModal
          template={template}
          onClose={() => setShowTemplate(false)}
          onSave={(t) => {
            setTemplate(t)
            localStorage.setItem(TEMPLATE_KEY, t)
            toast('Message saved')
          }}
        />
      )}
      {message && <div className="toast">{message}</div>}
    </main>
  )
}
