import { APPS_SCRIPT_URL } from './config.js'

// Apps Script web apps do not answer CORS preflight requests, so every call is
// sent as a "simple" POST with a text/plain body. The script parses the body as
// JSON on the other side. Apps Script answers with a 302 to
// script.googleusercontent.com; fetch follows it and that response carries
// permissive CORS headers, which is why this works from a static site.
/**
 * Dev only. Run `npm run dev`, then add ?mock=1 to any page to click through the
 * whole thing against a fake guest list, with no Google account involved. The
 * flag sticks for the tab. Vite drops this branch from production builds.
 */
function mockEnabled() {
  if (!import.meta.env.DEV) return false
  if (new URLSearchParams(window.location.search).get('mock') === '1') {
    sessionStorage.setItem('bh_mock', '1')
    return true
  }
  return sessionStorage.getItem('bh_mock') === '1'
}

async function call(action, payload = {}) {
  if (mockEnabled()) {
    const { mockCall } = await import('./mockBackend.js')
    return mockCall(action, payload)
  }

  if (!APPS_SCRIPT_URL) {
    throw new Error(
      'The site is not connected to its guest list yet. Set APPS_SCRIPT_URL in src/config.js.'
    )
  }

  let res
  try {
    res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, ...payload }),
      redirect: 'follow',
    })
  } catch (err) {
    throw new Error('Could not reach the server. Check your connection and try again.')
  }

  const text = await res.text()
  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('The server sent back something unexpected. Please try again.')
  }

  if (!data.ok) throw new Error(data.error || 'Something went wrong.')
  return data.data
}

/** Look up one invited party by its invite code. Public, code acts as the key. */
export const lookupParty = (code) => call('getParty', { code: String(code || '').trim() })

/** Submit or update an RSVP for a party. */
export const submitRsvp = (payload) => call('submitRsvp', payload)

/** Admin: full guest list. Requires the admin passcode. */
export const adminList = (token) => call('adminList', { token })

/** Admin: patch fields on one party, e.g. marking an invite as sent. */
export const adminUpdateParty = (token, code, fields) =>
  call('adminUpdateParty', { token, code, fields })

/** Admin: add a new invited party. */
export const adminAddParty = (token, party) => call('adminAddParty', { token, party })
