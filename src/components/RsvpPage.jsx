import { useEffect, useState } from 'react'
import { WEDDING, MEAL_OPTIONS, DIETARY_OPTIONS, SONG_REQUEST } from '../config.js'
import { lookupParty, submitRsvp } from '../api.js'
import { rememberCode } from '../inviteCode.js'
import Monogram from './Monogram.jsx'
import OrdinalDate from './OrdinalDate.jsx'

const homeHref = import.meta.env.BASE_URL
const detailsHref = `${import.meta.env.BASE_URL}details.html`

/** Dietary picks live in the sheet as one comma separated string. */
const splitDietary = (s) =>
  String(s || '')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)

function buildAnswers(people) {
  return people.map((p) => ({
    person_id: p.person_id,
    name: p.name,
    is_plus_one: p.is_plus_one,
    // Blank rather than a default yes, so nobody is counted in by accident.
    attending: p.attending === 'yes' ? 'yes' : p.attending === 'no' ? 'no' : '',
    meal: p.meal || '',
    dietary: splitDietary(p.dietary),
    dietary_notes: p.dietary_notes || '',
  }))
}

/** Laid out to echo the save the date: title, names stacked, date, place, seal. */
function Header() {
  return (
    <header className="card__head">
      <p className="card__kicker">Kindly reply</p>
      <p className="card__for">to the wedding of</p>

      <h1 className="card__names">
        <span className="card__name">{WEDDING.brideName}</span>
        <span className="card__amp">and</span>
        <span className="card__name">{WEDDING.groomName}</span>
      </h1>

      <p className="card__date">
        <OrdinalDate>{WEDDING.dateLong}</OrdinalDate>
      </p>
      <p className="card__place">
        {WEDDING.venueName},
        <br />
        {WEDDING.venueArea}, {WEDDING.venueCity}
      </p>

      <Monogram className="card__seal" />
    </header>
  )
}

/* -------------------------------------------------------------------------- */
/* Step 1: find the invitation                                                */
/* -------------------------------------------------------------------------- */

function CodeForm({ onFound }) {
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      onFound(await lookupParty(code))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="panel" onSubmit={onSubmit}>
      <h2 className="panel__title">Find your invitation</h2>
      <p className="panel__sub">
        Enter the code from the message we sent you. It is six characters long.
      </p>
      {error && <div className="error-box">{error}</div>}
      <label className="field">
        <span className="label">Invitation code</span>
        <input
          className="input code-input"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          maxLength={10}
          autoFocus
          autoComplete="off"
          spellCheck="false"
          placeholder="ABC123"
          required
        />
      </label>
      <button className="btn" type="submit" disabled={busy || !code.trim()} style={{ width: '100%' }}>
        {busy ? 'Looking...' : 'Continue'}
      </button>
      <p className="hint center" style={{ marginTop: '1.25rem' }}>
        Cannot find your code? Send us a message and we will look it up for you.
      </p>
    </form>
  )
}

/* -------------------------------------------------------------------------- */
/* Step 2: answer for each seat                                               */
/* -------------------------------------------------------------------------- */

function GuestBlock({ answer, index, onChange, hideName }) {
  const set = (patch) => onChange(index, { ...answer, ...patch })

  const toggleDietary = (item) => {
    const has = answer.dietary.includes(item)
    set({
      dietary: has ? answer.dietary.filter((d) => d !== item) : [...answer.dietary, item],
    })
  }

  const heading = answer.is_plus_one ? 'Your guest' : answer.name || 'Guest'

  return (
    <div className="guest" data-answer={answer.attending || 'none'}>
      {answer.is_plus_one && <span className="guest__tag">Plus one</span>}
      {/* Skipped when the invitation is addressed to this one person, where the
          heading above already carries their name and repeating it looks like a
          mistake on a card this spare. */}
      {hideName ? (
        <h3 className="sr-only">{heading}</h3>
      ) : (
        <h3 className="guest__name">{heading}</h3>
      )}

      {answer.is_plus_one && (
        <p className="hint" style={{ margin: '0 0 1rem' }}>
          You are welcome to bring someone. Tell us their name below, or say no thank you
          if you would rather come on your own.
        </p>
      )}

      <div className="choice" role="radiogroup" aria-label={`Will ${heading} be attending?`}>
        <label className="choice__opt">
          <input
            type="radio"
            name={`att-${answer.person_id}`}
            aria-label={`${heading} joyfully accepts`}
            checked={answer.attending === 'yes'}
            onChange={() => set({ attending: 'yes' })}
          />
          <span>Joyfully accepts</span>
        </label>
        <label className="choice__opt">
          <input
            type="radio"
            name={`att-${answer.person_id}`}
            aria-label={`${heading} regretfully declines`}
            checked={answer.attending === 'no'}
            onChange={() => set({ attending: 'no', meal: '', dietary: [], dietary_notes: '' })}
          />
          <span>Regretfully declines</span>
        </label>
      </div>

      {answer.attending === 'yes' && (
        <div className="guest__details">
          {answer.is_plus_one && (
            <label className="field">
              <span className="label">Your guest's name</span>
              <input
                className="input"
                value={answer.name}
                onChange={(e) => set({ name: e.target.value })}
                placeholder="First and last name"
                required
              />
            </label>
          )}

          <label className="field">
            <span className="label">Meal preference</span>
            <select
              className="select"
              value={answer.meal}
              onChange={(e) => set({ meal: e.target.value })}
              required
            >
              <option value="">Please choose</option>
              {MEAL_OPTIONS.map((m) => (
                <option key={m.value} value={m.label}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>

          <div className="field">
            <span className="label">Anything we should know?</span>
            <div className="pills">
              {DIETARY_OPTIONS.map((d) => (
                <label className="pill" key={d}>
                  <input
                    type="checkbox"
                    aria-label={`${heading}: ${d}`}
                    checked={answer.dietary.includes(d)}
                    onChange={() => toggleDietary(d)}
                  />
                  <span>{d}</span>
                </label>
              ))}
            </div>
          </div>

          <label className="field" style={{ marginBottom: 0 }}>
            <span className="label">Other allergies or notes</span>
            <input
              className="input"
              value={answer.dietary_notes}
              onChange={(e) => set({ dietary_notes: e.target.value })}
              placeholder="Optional"
            />
          </label>
        </div>
      )}
    </div>
  )
}

function RsvpForm({ party, onDone }) {
  const [answers, setAnswers] = useState(() => buildAnswers(party.people))
  const [songs, setSongs] = useState(party.songs || '')
  const [message, setMessage] = useState(party.message || '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const onChange = (i, next) =>
    setAnswers((prev) => prev.map((a, idx) => (idx === i ? next : a)))

  const unanswered = answers.filter((a) => !a.attending)
  const attending = answers.filter((a) => a.attending === 'yes')
  const missingMeal = attending.filter((a) => !a.meal)
  const missingName = attending.filter((a) => a.is_plus_one && !a.name.trim())
  const ready = !unanswered.length && !missingMeal.length && !missingName.length

  async function onSubmit(e) {
    e.preventDefault()
    if (!ready) return
    setBusy(true)
    setError('')
    try {
      const result = await submitRsvp({
        code: party.code,
        songs: songs.trim(),
        message: message.trim(),
        people: answers.map((a) => ({
          person_id: a.person_id,
          name: a.name.trim(),
          attending: a.attending,
          meal: a.meal,
          dietary: a.dietary.join(', '),
          dietary_notes: a.dietary_notes.trim(),
        })),
      })
      onDone({ result, answers, code: party.code, songs: songs.trim(), message: message.trim() })
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  const alreadyAnswered = party.status && party.status !== 'pending'
  const partyName = party.party_name.trim().toLowerCase()

  return (
    <form className="panel" onSubmit={onSubmit}>
      <h2 className="panel__title">{party.party_name}</h2>
      <p className="panel__sub">
        {alreadyAnswered
          ? 'You have already replied. Change anything you like and send it again.'
          : WEDDING.rsvpByLong
            ? `We would be delighted to see you. Please reply by ${WEDDING.rsvpByLong}.`
            : 'We would be delighted to see you.'}
      </p>

      {error && <div className="error-box">{error}</div>}

      {answers.map((a, i) => (
        <GuestBlock
          key={a.person_id}
          answer={a}
          index={i}
          onChange={onChange}
          hideName={!a.is_plus_one && a.name.trim().toLowerCase() === partyName}
        />
      ))}

      <p className="divider-note">
        {attending.length === 0 && !unanswered.length
          ? 'We will miss you. Leave us a note if you like.'
          : 'Anything else you would like to tell us?'}
      </p>

      {/* Only worth asking of people who will actually be on the dance floor. */}
      {SONG_REQUEST.enabled && attending.length > 0 && (
        <label className="field">
          <span className="label">{SONG_REQUEST.label}</span>
          <textarea
            className="textarea"
            value={songs}
            onChange={(e) => setSongs(e.target.value)}
            placeholder={SONG_REQUEST.placeholder}
            rows={4}
          />
          <p className="hint">{SONG_REQUEST.hint}</p>
        </label>
      )}

      <label className="field">
        <span className="label">A message for us</span>
        <textarea
          className="textarea"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Optional"
        />
      </label>

      {!ready && (
        <p className="hint" style={{ marginBottom: '1rem' }}>
          {unanswered.length
            ? 'Please answer for everyone above.'
            : missingName.length
              ? 'Please tell us your guest’s name.'
              : 'Please choose a meal for everyone attending.'}
        </p>
      )}

      <button className="btn" type="submit" disabled={busy || !ready} style={{ width: '100%' }}>
        {busy ? 'Sending...' : alreadyAnswered ? 'Update our reply' : 'Send our reply'}
      </button>
    </form>
  )
}

/* -------------------------------------------------------------------------- */
/* Step 3: confirmation                                                       */
/* -------------------------------------------------------------------------- */

function Confirmation({ payload, onEdit }) {
  const { result, answers, code } = payload
  const attending = answers.filter((a) => a.attending === 'yes')
  const declined = result.status === 'declined'
  const detailsUrl = `${detailsHref}?c=${encodeURIComponent(code)}`

  return (
    <div className="panel done">
      <div className="done__mark">{declined ? 'Thank you' : 'Wonderful'}</div>
      <h2 className="panel__title">
        {declined ? 'Your reply is in' : 'We cannot wait to see you'}
      </h2>
      <p className="panel__sub" style={{ marginBottom: 0 }}>
        {/* Plain text on purpose: the raised ordinal is for the display line at
            the top of the card, and looks like a typo in running prose. */}
        {declined
          ? 'We are sorry you cannot make it, and thank you for letting us know. You will be missed on the day.'
          : `See you at ${WEDDING.venueName} on ${WEDDING.dateLong}.`}
      </p>

      {attending.length > 0 && (
        <ul className="done__list">
          {attending.map((a) => (
            <li key={a.person_id}>
              <span className="done__who">{a.name || 'Your guest'}</span>
              <span className="done__what">
                {a.meal}
                {a.dietary.length ? ` · ${a.dietary.join(', ')}` : ''}
                {a.dietary_notes ? ` · ${a.dietary_notes}` : ''}
              </span>
            </li>
          ))}
        </ul>
      )}

      <p className="done__unlocked">
        Replying has opened up the details page, where we will add the rest of the day as
        it gets decided.
      </p>

      <div className="done__actions">
        <a className="btn" href={detailsUrl}>
          See all the details
        </a>
        <button className="btn btn--quiet" type="button" onClick={onEdit}>
          Change our reply
        </button>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */

export default function RsvpPage() {
  const [party, setParty] = useState(null)
  const [confirmation, setConfirmation] = useState(null)
  const [autoLoading, setAutoLoading] = useState(false)
  const [autoError, setAutoError] = useState('')

  // Hold on to the code as soon as we have a valid one, so the details page
  // opens later without the guest hunting for their original message.
  const keep = (found) => {
    rememberCode(found.code)
    setParty(found)
  }

  // A personal invite link looks like /rsvp.html?c=ABC123 so most guests never
  // have to type the code at all.
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('c')
    if (!code) return
    setAutoLoading(true)
    lookupParty(code)
      .then(keep)
      .catch((err) => setAutoError(err.message))
      .finally(() => setAutoLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  let body
  if (confirmation) {
    body = (
      <Confirmation
        payload={confirmation}
        onEdit={() => {
          // Re-fetch so the form reflects exactly what was saved.
          setConfirmation(null)
          lookupParty(party.code).then(setParty).catch(() => {})
        }}
      />
    )
  } else if (autoLoading) {
    body = (
      <div className="panel">
        <div className="loading-state">
          <div className="spinner" />
          <p>Finding your invitation...</p>
        </div>
      </div>
    )
  } else if (party) {
    body = <RsvpForm party={party} onDone={setConfirmation} />
  } else {
    body = (
      <>
        {autoError && (
          <div className="panel" style={{ marginBottom: '1.25rem' }}>
            <div className="error-box" style={{ marginBottom: 0 }}>{autoError}</div>
          </div>
        )}
        <CodeForm onFound={keep} />
      </>
    )
  }

  return (
    <main className="rsvp">
      <div className="card">
        <Header />
        {body}
        <footer className="card__foot">
          <span className="card__rule" aria-hidden="true" />
          <a className="card__back" href={homeHref}>
            Back to the website
          </a>
        </footer>
      </div>
    </main>
  )
}
