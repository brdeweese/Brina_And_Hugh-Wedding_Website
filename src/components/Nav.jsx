import { useEffect, useState } from 'react'
import { WEDDING, STAYS, FAQS } from '../config.js'

// Only link to sections that actually render, so the bar never points at a
// section the page has hidden for want of content.
const LINKS = [
  { href: '#day', label: 'The day' },
  { href: '#venue', label: 'Venue' },
  { href: '#stay', label: 'Travel & stay', when: () => STAYS.length > 0 },
  { href: '#faq', label: 'Questions', when: () => FAQS.length > 0 },
].filter((l) => !l.when || l.when())

export default function Nav() {
  const [solid, setSolid] = useState(false)

  useEffect(() => {
    // Swap to the opaque bar once the hero image is mostly scrolled past.
    const onScroll = () => setSolid(window.scrollY > window.innerHeight * 0.72)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`nav ${solid ? 'nav--solid' : 'nav--float'}`}>
      <a className="nav__mark" href="#top">
        {WEDDING.brideName[0]} &amp; {WEDDING.groomName[0]}
      </a>
      <div className="nav__links">
        {LINKS.map((l) => (
          <a key={l.href} href={l.href}>
            {l.label}
          </a>
        ))}
        <a className="btn btn--sm" href={`${import.meta.env.BASE_URL}rsvp.html`}>
          RSVP
        </a>
      </div>
    </nav>
  )
}
