import { useState } from 'react'
import { WEDDING, SCHEDULE, FAQS, STAYS } from '../config.js'
import Nav from './Nav.jsx'
import Countdown from './Countdown.jsx'
import SmartImage from './SmartImage.jsx'
import Monogram from './Monogram.jsx'
import OrdinalDate from './OrdinalDate.jsx'

const rsvpHref = `${import.meta.env.BASE_URL}rsvp.html`

function Sprig() {
  return (
    <div className="rule">
      <span>&#10086;</span>
    </div>
  )
}

/** Type only, set like the save the date. No photograph behind it. */
function Hero() {
  return (
    <header className="hero" id="top">
      <div className="hero__inner">
        <p className="hero__eyebrow">We are getting married</p>

        <h1 className="hero__names">
          <span className="hero__name">{WEDDING.brideName}</span>
          <span className="hero__amp">and</span>
          <span className="hero__name">{WEDDING.groomName}</span>
        </h1>

        <p className="hero__date">
          <OrdinalDate>{WEDDING.dateLong}</OrdinalDate>
        </p>
        <p className="hero__where">
          {WEDDING.venueName}, {WEDDING.venueArea}
          <br />
          {WEDDING.venueCity}
        </p>

        <Monogram className="hero__seal" size={104} />

        <div className="hero__cta">
          <a className="btn" href={rsvpHref}>
            RSVP
          </a>
        </div>
      </div>
    </header>
  )
}

function CountdownSection() {
  return (
    <section className="section center">
      {/* The hero carries the date now, so repeating it here would be filler. */}
      <div className="wrap">
        <p className="eyebrow">Counting down</p>
        <Countdown />
      </div>
    </section>
  )
}

function Story() {
  return (
    <section className="section section--tinted" id="story">
      <div className="wrap">
        <div className="story__figure story__figure--solo">
          <SmartImage
            src="images/proposal-watercolour.png"
            alt={`A watercolour of ${WEDDING.groomName} proposing to ${WEDDING.brideName} on the shore of a lake at sunrise`}
            className="artwork"
            placeholderLabel="Watercolour of the proposal"
          />
        </div>
      </div>
    </section>
  )
}

function Schedule() {
  return (
    <section className="section" id="day">
      <div className="wrap wrap--narrow">
        <div className="center">
          <h2 className="section-title">The day</h2>
          <Sprig />
        </div>
        <div className="schedule">
          {SCHEDULE.map((item) => (
            <div className="schedule__row" key={item.time + item.title}>
              <div className="schedule__time">{item.time}</div>
              <div>
                <h3 className="schedule__title">{item.title}</h3>
                {item.note && <p className="schedule__note">{item.note}</p>}
              </div>
            </div>
          ))}
        </div>
        <p className="hint center" style={{ marginTop: '1.5rem' }}>
          Times to be confirmed.
        </p>
      </div>
    </section>
  )
}

function Venue() {
  return (
    <section className="section section--stone" id="venue">
      <div className="wrap">
        <div className="center">
          <h2 className="section-title">The venue</h2>
          <Sprig />
        </div>
        <div className="venue">
          <SmartImage
            src="images/venue-illustration.png"
            alt={`Illustration of ${WEDDING.venueName}`}
            className="venue__illustration"
            placeholderLabel="Venue illustration from the save the date"
          />
          <div className="venue__card">
            <p className="eyebrow">Ceremony and reception</p>
            <h3 className="venue__name">{WEDDING.venueName}</h3>
            <p className="venue__where" style={{ marginBottom: '1.75rem' }}>
              {WEDDING.venueArea}, {WEDDING.venueCity}
            </p>
            <a
              className="btn btn--ghost"
              href={WEDDING.venueMapUrl}
              target="_blank"
              rel="noreferrer"
            >
              Open in maps
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

function Stays() {
  // Hidden until there is something real to list. Better an absent section than
  // one full of invented recommendations.
  if (!STAYS.length) return null

  return (
    <section className="section" id="stay">
      <div className="wrap">
        <div className="center">
          <h2 className="section-title">Travel &amp; stay</h2>
          <Sprig />
        </div>
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
      </div>
    </section>
  )
}

function Faq() {
  const [open, setOpen] = useState(null)

  // Hidden until there are real questions and answers to show.
  if (!FAQS.length) return null

  return (
    <section className="section section--tinted" id="faq">
      <div className="wrap wrap--narrow">
        <div className="center">
          <h2 className="section-title">Questions</h2>
          <Sprig />
        </div>
        <div className="faq">
          {FAQS.map((item, i) => {
            const isOpen = open === i
            return (
              <div className="faq__item" key={item.q} data-open={isOpen}>
                <button
                  className="faq__q"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-${i}`}
                >
                  <span>{item.q}</span>
                  <span className="faq__sign" aria-hidden="true">
                    +
                  </span>
                </button>
                {isOpen && (
                  <p className="faq__a" id={`faq-${i}`}>
                    {item.a}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function ClosingCta() {
  return (
    <section className="section cta">
      <div className="wrap wrap--narrow">
        <p className="cta__script">Will you join us?</p>
        <p className="lede">
          {WEDDING.rsvpByLong ? `Please let us know by ${WEDDING.rsvpByLong}. ` : ''}
          You will need the invitation code from the message we sent you.
        </p>
        <div style={{ marginTop: '2rem' }}>
          <a className="btn" href={rsvpHref}>
            RSVP now
          </a>
        </div>
        <p className="hint" style={{ marginTop: '1.5rem' }}>
          Already replied?{' '}
          <a href={`${import.meta.env.BASE_URL}details.html`}>
            See the full details of the day
          </a>
          .
        </p>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__mark">
        {WEDDING.brideName} &amp; {WEDDING.groomName}
      </div>
      <div className="footer__date">{WEDDING.dateShort}</div>
      {WEDDING.contactEmail && (
        <p style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}>
          Questions? <a href={`mailto:${WEDDING.contactEmail}`}>{WEDDING.contactEmail}</a>
        </p>
      )}
    </footer>
  )
}

export default function HomePage() {
  return (
    <>
      <Nav />
      <Hero />
      <CountdownSection />
      <Story />
      <Schedule />
      <Venue />
      <Stays />
      <Faq />
      <ClosingCta />
      <Footer />
    </>
  )
}
