import { useEffect, useState } from 'react'
import { WEDDING } from '../config.js'

const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

function remaining(target) {
  const ms = target - Date.now()
  if (ms <= 0) return null
  return {
    days: Math.floor(ms / DAY),
    hours: Math.floor((ms % DAY) / HOUR),
    minutes: Math.floor((ms % HOUR) / MINUTE),
    seconds: Math.floor((ms % MINUTE) / 1000),
  }
}

export default function Countdown() {
  const target = new Date(WEDDING.dateISO).getTime()
  const [left, setLeft] = useState(() => remaining(target))

  useEffect(() => {
    const id = setInterval(() => setLeft(remaining(target)), 1000)
    return () => clearInterval(id)
  }, [target])

  if (!left) {
    return (
      <p className="lede center" style={{ marginTop: '2rem' }}>
        Today is the day.
      </p>
    )
  }

  const units = [
    ['Days', left.days],
    ['Hours', left.hours],
    ['Minutes', left.minutes],
    ['Seconds', left.seconds],
  ]

  return (
    <div className="countdown">
      {units.map(([label, value]) => (
        <div className="countdown__unit" key={label}>
          <div className="countdown__n">{String(value).padStart(2, '0')}</div>
          <div className="countdown__l">{label}</div>
        </div>
      ))}
    </div>
  )
}
