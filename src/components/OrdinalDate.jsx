const ORDINAL = /(\d+)(st|nd|rd|th)\b/i

/**
 * Renders "Saturday 31st July 2027" with the ordinal raised, the way it is set
 * on the save the date. Falls back to plain text if there is no ordinal.
 */
export default function OrdinalDate({ children }) {
  const text = String(children ?? '')
  const match = text.match(ORDINAL)
  if (!match) return <>{text}</>

  const at = match.index
  return (
    <>
      {text.slice(0, at)}
      {match[1]}
      <sup className="ordinal">{match[2]}</sup>
      {text.slice(at + match[0].length)}
    </>
  )
}
