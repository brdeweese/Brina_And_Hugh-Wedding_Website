import { WEDDING } from '../config.js'

/**
 * The gold roundel from the save the date: a thin ring, the two initials in the
 * same script as the names, and a small laurel sprig crossing the lower right.
 *
 * Drawn rather than imaged so it stays sharp, takes the page's gold, and picks
 * up whatever names are set in config. The <text> uses Great Vibes, which the
 * page already loads for the headings.
 */
export default function Monogram({ size = 92, className = '' }) {
  const initials = `${WEDDING.brideName[0]}${WEDDING.groomName[0]}`

  return (
    <svg
      className={`monogram ${className}`}
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role="img"
      aria-label={`Monogram of ${WEDDING.brideName} and ${WEDDING.groomName}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="60" cy="60" r="43" fill="none" stroke="currentColor" strokeWidth="1.1" />

      {/* Sized to sit inside the ring. Great Vibes carries long swashes, so it
          needs noticeably more clearance than the cap height suggests. */}
      <text
        x="57"
        y="61"
        textAnchor="middle"
        dominantBaseline="central"
        fill="currentColor"
        fontFamily="'Great Vibes', cursive"
        fontSize="31"
        letterSpacing="-1"
      >
        {initials}
      </text>

      {/* Laurel sprig, sitting across the ring at about five o'clock. */}
      <g stroke="currentColor" fill="none" strokeWidth="1" strokeLinecap="round">
        <path d="M70 101 Q90 95 101 74" />
      </g>
      <g fill="currentColor">
        {[
          [76, 97, -30],
          [83, 93, -40],
          [90, 87, -52],
          [95, 80, -62],
          [99, 72, -72],
          [79, 103, 12],
          [87, 98, 2],
          [94, 91, -10],
          [99, 83, -22],
        ].map(([x, y, r]) => (
          <ellipse key={`${x}-${y}`} cx={x} cy={y} rx="5.5" ry="2.3" transform={`rotate(${r} ${x} ${y})`} />
        ))}
      </g>
    </svg>
  )
}
