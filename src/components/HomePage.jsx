import { useState } from 'react'
import { WEDDING, SCHEDULE, FAQS, STAYS } from '../config.js'
import Nav from './Nav.jsx'
import Countdown from './Countdown.jsx'
import SmartImage from './SmartImage.jsx'

const rsvpHref = `${import.meta.env.BASE_URL}rsvp.html`

function Sprig() {
  return (
    <div className="rule">
      <span>&#10086;</span>
    </div>
  )
}

function Hero() {
  return (
    <header className="hero" id="top">
      <SmartImage
        src="images/hero-proposal.jpg"
        alt="Brina and Hugh at the moment of the proposal beside the lake at Glendalough"
        className="hero__img"
        placeholderLabel="Hero photo"
        loading="eager"
      />
      <div className="hero__scrim" />
      <div className="hero__inner">
        <p className="hero__eyebrow">We are getting married</p>
        <h1 className="hero__names">
          {WEDDING.brideName}
          <span className="hero__amp">and</span>
          {WEDDING.groomName}
        </h1>
        <div className="hero__meta">
          <span>{WEDDING.dateShort}</span>
          <span>
            {WEDDING.venueName}, {WEDDING.venueArea}, {WEDDING.venueCity}
          </span>
        </div>
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
      <div className="wrap">
        <p className="eyebrow">Save the date</p>
        <h2 className="section-title">{WEDDING.dateLong}</h2>
        <Countdown />
      </div>
    </section>
  )
}

function Story() {
  return (
    <section className="section section--tinted" id="story">
      <div className="wrap">
        <div className="center">
          <p className="eyebrow">How we got here</p>
          <h2 className="section-title">Our story</h2>
          <Sprig />
        </div>
        <div className="story">
          <div className="story__figure">
            <SmartImage
              src="images/proposal-watercolour.png"
              alt="A watercolour of Hugh proposing to Brina on the shore of the Upper Lake at Glendalough, the sun rising over the ridge behind them"
              className="artwork"
              placeholderLabel="Watercolour of the proposal"
            />
            <p className="story__caption">The Upper Lake, Glendalough</p>
          </div>
          <div className="story__body">
            <p className="lede">
              It started the way most good things do, without either of us noticing it was
              starting.
            </p>
            <p>
              Somewhere between the first coffee that ran three hours long and the
              hundredth evening that felt exactly the same, we worked out that we were
              rather good at this. There were flights and time zones and a great many
              messages sent at unreasonable hours, and none of it ever felt like effort.
            </p>
            <p>
              Then came a still morning at Glendalough, mist sitting low on the water and
              the sun just clearing the ridge. Hugh got down on one knee on the stones by
              the Upper Lake. Brina said yes before he had quite finished asking.
            </p>
            <p>
              Now we would very much like all of you beside the river in Dublin, watching
              us do it properly.
            </p>
          </div>
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
          <p className="eyebrow">What to expect</p>
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
          Timings are our best guess for now and will be confirmed with your invitation.
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
          <p className="eyebrow">Where</p>
          <h2 className="section-title">The venue</h2>
          <Sprig />
        </div>
        <div className="venue">
          <SmartImage
            src="images/venue-illustration.png"
            alt="Watercolour illustration of Wright's Anglers Rest"
            className="venue__illustration"
            placeholderLabel="Venue illustration from the save the date"
          />
          <div className="venue__card">
            <p className="eyebrow">Ceremony and reception</p>
            <h3 className="venue__name">{WEDDING.venueName}</h3>
            <p className="venue__where">
              {WEDDING.venueArea}, {WEDDING.venueCity}
            </p>
            <p>
              A riverside pub on a quiet lane above the Liffey, all hanging baskets and
              low ceilings, about twenty minutes from the centre of Dublin. Everything
              happens in one place, so once you arrive you can settle in for the day.
            </p>
            <p style={{ marginBottom: '1.75rem' }}>
              The lanes along the Strawberry Beds are narrow and the parking is limited,
              so a taxi is much the easier option, particularly on the way home.
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
  return (
    <section className="section" id="stay">
      <div className="wrap">
        <div className="center">
          <p className="eyebrow">Getting here and staying over</p>
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

  return (
    <section className="section section--tinted" id="faq">
      <div className="wrap wrap--narrow">
        <div className="center">
          <p className="eyebrow">In case you were wondering</p>
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
          Please let us know by {WEDDING.rsvpByLong}. You will need the invitation code
          from the message we sent you.
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
