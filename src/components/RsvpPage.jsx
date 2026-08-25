import { useEffect, useState } from 'react'
import { WEDDING, MEAL_OPTIONS, DIETARY_OPTIONS } from '../config.js'
import { lookupParty, submitRsvp } from '../api.js'

const homeHref = import.meta.env.BASE_URL

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

function Header() {
  return (
    <div className="rsvp__head">
      <h1 className="rsvp__names">
        {WEDDING.brideName} &amp; {WEDDING.groomName}
      </h1>
      <p className="rsvp__meta">{WEDDING.dateLong}</p>
      <a className="rsvp__home" href={homeHref}>
        &#8592; Back to the website
      </a>
    </div>
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

function GuestBlock({ answer, index, onChange }) {
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
      <h3 className="guest__name">{heading}</h3>

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
      onDone({ result, answers, message: message.trim() })
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  const alreadyAnswered = party.status && party.status !== 'pending'

  return (
    <form className="panel" onSubmit={onSubmit}>
      <h2 className="panel__title">{party.party_name}</h2>
      <p className="panel__sub">
        {alreadyAnswered
          ? 'You have already replied. Change anything you like and send it again.'
          : `We would be delighted to see you. Please reply by ${WEDDING.rsvpByLong}.`}
      </p>

      {error && <div className="error-box">{error}</div>}

      {answers.map((a, i) => (
        <GuestBlock key={a.person_id} answer={a} index={i} onChange={onChange} />
      ))}

      <p className="divider-note">
        {attending.length === 0 && !unanswered.length
          ? 'We will miss you. Leave us a note if you like.'
          : 'Anything else you would like to tell us?'}
      </p>

      <label className="field">
        <span className="label">A message for us</span>
        <textarea
          className="textarea"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Optional. Song requests very much encouraged."
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
  const { result, answers } = payload
  const attending = answers.filter((a) => a.attending === 'yes')
  const declined = result.status === 'declined'

  return (
    <div className="panel done">
      <div className="done__mark">{declined ? 'Thank you' : 'Wonderful'}</div>
      <h2 className="panel__title">
        {declined ? 'Your reply is in' : 'We cannot wait to see you'}
      </h2>
      <p className="panel__sub" style={{ marginBottom: 0 }}>
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

      <div style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="btn btn--quiet" type="button" onClick={onEdit}>
          Change our reply
        </button>
        <a className="btn btn--ghost" href={homeHref}>
          Back to the website
        </a>
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

  // A personal invite link looks like /rsvp.html?c=ABC123 so most guests never
  // have to type the code at all.
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('c')
    if (!code) return
    setAutoLoading(true)
    lookupParty(code)
      .then(setParty)
      .catch((err) => setAutoError(err.message))
      .finally(() => setAutoLoading(false))
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
        <CodeForm onFound={setParty} />
      </>
    )
  }

  return (
    <main className="rsvp">
      <Header />
      {body}
    </main>
  )
}
