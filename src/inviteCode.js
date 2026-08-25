/**
 * Where a guest's invitation code is kept between pages.
 *
 * Remembering it means someone who replies, then bookmarks the details page,
 * still gets in on a later visit without digging out the original message.
 * Storage can throw in private browsing, so every access is guarded; failing to
 * remember is fine, the link in their message always works.
 */
const CODE_KEY = 'bh_code'

export function rememberCode(code) {
  if (!code) return
  try {
    sessionStorage.setItem(CODE_KEY, code)
    localStorage.setItem(CODE_KEY, code)
  } catch {
    // Nothing to do. The code stays in the URL.
  }
}

export function recallCode() {
  const fromUrl = new URLSearchParams(window.location.search).get('c')
  if (fromUrl) return fromUrl
  try {
    return sessionStorage.getItem(CODE_KEY) || localStorage.getItem(CODE_KEY) || ''
  } catch {
    return ''
  }
}
