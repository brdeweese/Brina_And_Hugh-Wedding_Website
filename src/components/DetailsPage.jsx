import { useEffect, useState } from 'react'
import { WEDDING, SCHEDULE, DAY_DETAILS, STAYS } from '../config.js'
import { lookupParty } from '../api.js'
import { rememberCode, recallCode } from '../inviteCode.js'

const homeHref = import.meta.env.BASE_URL
const rsvpHref = `${import.meta.env.BASE_URL}rsvp.html`

/* -------------------------------------------------------------------------- */

function Header({ party }) {
  return (
    <div className="details__head">
      <p className="eyebrow">The day itself</p>
      <h1 className="details__names">
        {WEDDING.brideName} &amp; {WEDDING.groomName}
      </h1>
      <p className="details__meta">
        {WEDDING.dateLong} · {WEDDING.venueName}
      </p>
      {party && <p className="details__greeting">For {party.party_name}</p>}
      <a className="details__back" href={homeHref}>
        &#8592; Back to the website
      </a>
    </div>
  )
}

function Locked({ code, error, onFound }) {
  const [value, setValue] = useState(code || '')
  const [busy, setBusy] = useState(false)
  const [problem, setProblem] = useState(error || '')

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setProblem('')
    try {
      const party = await lookupParty(value)
      rememberCode(party.code)
      onFound(party)
    } catch (err) {
      setProblem(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="panel" onSubmit={submit}>
      <h2 className="panel__title">These details are for our guests</h2>
      <p className="panel__sub">
        Pop in the code from your invitation and the rest of the day opens up.
      </p>
      {problem && <div className="error-box">{problem}</div>}
      <label className="field">
        <span className="label">Invitation code</span>
        <input
          className="input code-input"
          value={value}
          onChange={(e) => setValue(e.target.value.toUpperCase())}
          maxLength={10}
          autoFocus
          autoComplete="off"
          spellCheck="false"
          placeholder="ABC123"
          required
        />
      </label>
      <button className="btn" type="submit" disabled={busy || !value.trim()} style={{ width: '100%' }}>
        {busy ? 'Looking...' : 'Continue'}
      </button>
    </form>
  )
}

function NeedsRsvp({ party }) {
  return (
    <div className="panel center">
      <h2 className="panel__title">Almost there</h2>
      <p className="panel__sub">
        These details open once we know whether you can come. It takes about a minute, and
        you can change your answer any time afterwards.
      </p>
      <a className="btn" href={`${rsvpHref}?c=${encodeURIComponent(party.code)}`}>
        Reply to your invitation
      </a>
    </div>
  )
}

/* -------------------------------------------------------------------------- */

function RunOfDay() {
  return (
    <section className="details__section">
      <h2 className="section-title">The run of the day</h2>
      <p className="details__note">Times to be confirmed.</p>
      <div className="runsheet">
        {SCHEDULE.map((item) => (
          <div className="runsheet__row" key={item.time + item.title}>
            <div className="runsheet__time">{item.time}</div>
            <div>
              <h3 className="runsheet__title">{item.title}</h3>
              {item.detail ? (
                <p className="runsheet__detail">{item.detail}</p>
              ) : (
                item.note && <p className="runsheet__detail">{item.note}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function DressCode() {
  const { dressCode } = DAY_DETAILS
  // Hidden until one is decided, rather than guessed at.
  if (!dressCode.title) return null

  return (
    <section className="details__section">
      <p className="eyebrow">What to wear</p>
      <h2 className="section-title">Dress code</h2>
      <div className="dress">
        <p className="dress__headline">{dressCode.title}</p>
        {dressCode.body && <p className="dress__body">{dressCode.body}</p>}
        {dressCode.notes.length > 0 && (
          <ul className="dress__notes">
            {dressCode.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

function DetailSection({ section }) {
  return (
    <section className="details__section">
      <p className="eyebrow">{section.eyebrow}</p>
      <h2 className="section-title">{section.title}</h2>
      {section.body && <p className="lede details__body">{section.body}</p>}
      {section.items?.length > 0 && (
        <dl className="factlist">
          {section.items.map((item) => (
            <div className="factlist__row" key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  )
}

function Staying() {
  if (!STAYS.length) return null

  return (
    <section className="details__section">
      <p className="eyebrow">Somewhere to sleep</p>
      <h2 className="section-title">Staying over</h2>
      <div className="stays">
        {STAYS.map((s) => (
          <div className="stay" key={s.name}>
            {s.distance && <div className="stay__distance">{s.distance}</div>}
            <h3>
              {s.url ? (
                <a href={s.url} target="_blank" rel="noreferrer">
                  {s.name}
                </a>
              ) : (
                s.name
              )}
            </h3>
            <p>{s.note}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function ComingSoon() {
  if (!DAY_DETAILS.comingSoon.length) return null
  return (
    <section className="details__section">
      <p className="eyebrow">Not settled yet</p>
      <h2 className="section-title">Still to come</h2>
      <div className="soon">
        {DAY_DETAILS.comingSoon.map((c) => (
          <div className="soon__card" key={c.title}>
            <h3>{c.title}</h3>
            {c.note && <p>{c.note}</p>}
          </div>
        ))}
      </div>
    </section>
  )
}

function Unlocked({ party }) {
  const declined = party.status === 'declined'

  return (
    <>
      {declined && (
        <div className="panel center details__declined">
          <p style={{ margin: 0 }}>
            You told us you cannot make it, and that is absolutely fine. Everything below is
            here anyway, in case anything changes. Just{' '}
            <a href={`${rsvpHref}?c=${encodeURIComponent(party.code)}`}>update your reply</a>{' '}
            and we will squeeze you in.
          </p>
        </div>
      )}

      {DAY_DETAILS.intro && <p className="lede details__intro">{DAY_DETAILS.intro}</p>}

      <RunOfDay />
      <DressCode />
      {DAY_DETAILS.sections.map((s) => (
        <DetailSection key={s.id} section={s} />
      ))}
      <Staying />
      <ComingSoon />

      <div className="details__foot">
        <p className="cta__script">See you there</p>
        <a className="btn btn--ghost" href={`${rsvpHref}?c=${encodeURIComponent(party.code)}`}>
          Change your reply
        </a>
      </div>
    </>
  )
}

/* -------------------------------------------------------------------------- */

export default function DetailsPage() {
  const [party, setParty] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [code] = useState(() => recallCode())

  useEffect(() => {
    if (!code) return
    setLoading(true)
    lookupParty(code)
      .then((p) => {
        rememberCode(p.code)
        setParty(p)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [code])

  let body
  if (loading) {
    body = (
      <div className="panel">
        <div className="loading-state">
          <div className="spinner" />
          <p>Just a moment...</p>
        </div>
      </div>
    )
  } else if (!party) {
    body = <Locked code={code} error={error} onFound={setParty} />
  } else if (party.status === 'pending') {
    body = <NeedsRsvp party={party} />
  } else {
    body = <Unlocked party={party} />
  }

  return (
    <main className="details">
      <div className="details__wrap">
        <Header party={party && party.status !== 'pending' ? party : null} />
        {body}
      </div>
    </main>
  )
}
