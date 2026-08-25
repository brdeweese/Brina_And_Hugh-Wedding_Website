import { useEffect, useState } from 'react'
import { WEDDING } from '../config.js'

const LINKS = [
  { href: '#story', label: 'Our story' },
  { href: '#day', label: 'The day' },
  { href: '#venue', label: 'Venue' },
  { href: '#stay', label: 'Travel & stay' },
  { href: '#faq', label: 'Questions' },
]

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
