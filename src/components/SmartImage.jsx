import { useState } from 'react'

/**
 * An <img> that falls back to a labelled placeholder if the file is not there
 * yet, so the site still looks deliberate before the photos are dropped in.
 * Paths are relative to /public and get the deploy base path prepended.
 */
export default function SmartImage({ src, alt, className, placeholderLabel, ...rest }) {
  const [failed, setFailed] = useState(false)
  const url = `${import.meta.env.BASE_URL}${src.replace(/^\//, '')}`

  if (failed) {
    return (
      <div className={`placeholder ${className || ''}`} role="img" aria-label={alt}>
        <span>
          {placeholderLabel || 'Photo goes here'}
          <br />
          <small style={{ opacity: 0.7 }}>public/{src.replace(/^\//, '')}</small>
        </span>
      </div>
    )
  }

  return (
    <img
      src={url}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
      loading="lazy"
      {...rest}
    />
  )
}
