import { SITE_URL, WEDDING } from './config.js'

/** The personal RSVP link for one party. */
export function inviteLink(code) {
  return `${SITE_URL.replace(/\/$/, '')}/rsvp.html?c=${encodeURIComponent(code)}`
}

export const DEFAULT_TEMPLATE = `You're invited!

{names}, we are getting married on {date} at {venue}, {area}, {city}, and we would love you there.

Everything you need, and your RSVP, is here:
{link}

Your invitation code is {code} if you are ever asked for it. Please let us know by {rsvpBy}.

{bride} and {groom} x`

export function fillTemplate(template, party) {
  const map = {
    '{names}': party.party_name,
    '{code}': party.code,
    '{link}': inviteLink(party.code),
    '{bride}': WEDDING.brideName,
    '{groom}': WEDDING.groomName,
    '{date}': WEDDING.dateLong,
    '{venue}': WEDDING.venueName,
    '{area}': WEDDING.venueArea,
    '{city}': WEDDING.venueCity,
    '{rsvpBy}': WEDDING.rsvpByLong,
  }
  return Object.keys(map).reduce((out, key) => out.split(key).join(map[key]), template)
}

/** WhatsApp wants the number as digits only, including the country code. */
export function whatsappHref(phone, message) {
  const digits = String(phone || '').replace(/\D/g, '')
  if (!digits) return ''
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

/**
 * iOS wants sms:number&body=..., Android wants sms:number?body=...
 * Getting this wrong means the message body is silently dropped.
 */
export function smsHref(phone, message) {
  const number = String(phone || '').replace(/[^\d+]/g, '')
  if (!number) return ''
  const isApple = /iPhone|iPad|iPod|Macintosh/i.test(navigator.userAgent)
  return `sms:${number}${isApple ? '&' : '?'}body=${encodeURIComponent(message)}`
}

export function mailtoHref(email, message) {
  if (!email) return ''
  const subject = `${WEDDING.brideName} & ${WEDDING.groomName} — ${WEDDING.dateLong}`
  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(message)}`
}

/* --- Derived numbers ------------------------------------------------------ */

export function summarise(parties) {
  const seats = parties.reduce((n, p) => n + p.people.length, 0)
  const attendingPeople = parties.reduce(
    (n, p) => n + p.people.filter((x) => x.attending === 'yes').length,
    0
  )
  return {
    parties: parties.length,
    seats,
    sent: parties.filter((p) => p.invite_sent_at).length,
    notSent: parties.filter((p) => !p.invite_sent_at).length,
    responded: parties.filter((p) => p.status !== 'pending').length,
    awaiting: parties.filter((p) => p.status === 'pending' && p.invite_sent_at).length,
    attendingParties: parties.filter((p) => p.status === 'attending' || p.status === 'partial')
      .length,
    declined: parties.filter((p) => p.status === 'declined').length,
    attendingPeople,
  }
}

export function mealTotals(parties) {
  const counts = {}
  parties.forEach((p) =>
    p.people.forEach((x) => {
      if (x.attending !== 'yes') return
      const key = x.meal || 'Not chosen'
      counts[key] = (counts[key] || 0) + 1
    })
  )
  return Object.entries(counts).sort((a, b) => b[1] - a[1])
}

/**
 * Every song anyone asked for, one per line, with who asked. Guests type these
 * freehand, so the most we can do is split on newlines and commas-with-newlines
 * and tidy up numbering people add themselves.
 */
export function songList(parties) {
  const out = []
  parties.forEach((p) => {
    String(p.songs || '')
      .split('\n')
      .map((line) => line.replace(/^\s*[-•*\d.)]+\s*/, '').trim())
      .filter(Boolean)
      .forEach((song) => out.push({ song, party: p.party_name, code: p.code }))
  })
  return out
}

export function dietaryList(parties) {
  const out = []
  parties.forEach((p) =>
    p.people.forEach((x) => {
      if (x.attending !== 'yes') return
      const notes = [x.dietary, x.dietary_notes].filter(Boolean).join(' · ')
      if (notes) out.push({ name: x.name || '(plus one)', party: p.party_name, notes })
    })
  )
  return out
}

/* --- CSV ------------------------------------------------------------------ */

function csvCell(v) {
  const s = String(v == null ? '' : v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function toCsv(headers, rows) {
  return [headers, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n')
}

export function downloadCsv(filename, csv) {
  // A BOM keeps Excel happy with accented names.
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function guestCsv(parties) {
  const rows = []
  parties.forEach((p) =>
    p.people.forEach((x) =>
      rows.push([
        p.party_name,
        p.code,
        x.name || (x.is_plus_one ? '(plus one, unnamed)' : ''),
        x.is_plus_one ? 'yes' : 'no',
        p.status,
        x.attending || 'no reply',
        x.meal,
        x.dietary,
        x.dietary_notes,
        p.email,
        p.phone,
        p.preferred_contact,
        p.invite_sent_at ? 'sent' : 'not sent',
        p.invite_sent_at,
        p.responded_at,
        p.songs,
        p.message,
        p.notes,
      ])
    )
  )
  return toCsv(
    [
      'party',
      'code',
      'guest',
      'is_plus_one',
      'party_status',
      'attending',
      'meal',
      'dietary',
      'dietary_notes',
      'email',
      'phone',
      'preferred_contact',
      'invite',
      'invite_sent_at',
      'responded_at',
      'songs',
      'message',
      'notes',
    ],
    rows
  )
}

/** One row per requested song. This is the list the band or DJ wants. */
export function playlistCsv(parties) {
  const rows = songList(parties).map((s) => [s.song, s.party, s.code])
  return toCsv(['song', 'requested_by', 'code'], rows)
}

export function cateringCsv(parties) {
  const rows = []
  parties.forEach((p) =>
    p.people.forEach((x) => {
      if (x.attending !== 'yes') return
      rows.push([x.name || '(plus one)', p.party_name, x.meal, x.dietary, x.dietary_notes])
    })
  )
  rows.sort((a, b) => String(a[0]).localeCompare(String(b[0])))
  return toCsv(['guest', 'party', 'meal', 'dietary', 'notes'], rows)
}
