// ---------------------------------------------------------------------------
// EDIT ME. Everything guest-facing that you are likely to change lives here.
//
// Nothing in this file is invented. Anything not yet decided is left empty or
// marked TBC, and the site simply hides a section rather than filling it with
// placeholder prose. Add real content here as decisions get made.
// ---------------------------------------------------------------------------

// Paste the Apps Script Web App URL here after step 4 of SETUP.md.
// It looks like: https://script.google.com/macros/s/AKfy..../exec
export const APPS_SCRIPT_URL = ''

export const WEDDING = {
  brideName: 'Brina',
  groomName: 'Hugh',
  // ISO date and time of the ceremony, in Irish local time. The time is a
  // placeholder used only by the countdown; change it once it is set.
  dateISO: '2027-07-31T12:00:00+01:00',
  dateLong: 'Saturday 31st July 2027',
  dateShort: '31 . 07 . 2027',
  venueName: "Wright's Anglers Rest",
  venueArea: 'Strawberry Beds',
  venueCity: 'Dublin, Ireland',
  venueMapUrl: 'https://maps.google.com/?q=Wrights+Anglers+Rest+Strawberry+Beds+Dublin',
  // Leave empty until you set a deadline. The site drops the sentence if blank.
  rsvpByLong: '',
  contactEmail: '',
}

// The public address of the deployed site. Used to build invite links in the
// admin dashboard. No trailing slash.
export const SITE_URL = 'https://brdeweese.github.io/Brina_And_Hugh-Wedding_Website'

// The song request box on the RSVP form. Set `enabled` to false to drop it.
export const SONG_REQUEST = {
  enabled: true,
  label: 'Songs that will get you dancing',
  hint: 'One or several. We will pass the list on to whoever is playing.',
  placeholder: 'Artist and song, one per line',
}

// Placeholder options so the form works. Replace with the real menu once the
// caterer is confirmed; the labels are what get written to the spreadsheet.
export const MEAL_OPTIONS = [
  { value: 'beef', label: 'Beef' },
  { value: 'chicken', label: 'Chicken' },
  { value: 'fish', label: 'Fish' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
]

// Common restrictions offered as quick checkboxes, plus a free-text box.
export const DIETARY_OPTIONS = [
  'Gluten free',
  'Dairy free',
  'Nut allergy',
  'Shellfish allergy',
  'Halal',
  'Kosher',
]

// The order of the day. Times are not set yet. Put the real time in `time` and
// anything you want guests to know in `detail`, which shows on the details page.
export const SCHEDULE = [
  { time: 'TBC', title: 'Ceremony', note: '', detail: '' },
  { time: 'TBC', title: 'Drinks reception', note: '', detail: '' },
  { time: 'TBC', title: 'Dinner', note: '', detail: '' },
  { time: 'TBC', title: 'Dancing', note: '', detail: '' },
]

// Add questions and answers here and the Questions section appears on the home
// page. While this is empty the section is hidden.
export const FAQS = []

// Add places to stay here and the Travel and stay section appears. While this
// is empty the section is hidden.
export const STAYS = []

// ---------------------------------------------------------------------------
// The details page, which only opens once a guest has replied.
// ---------------------------------------------------------------------------

export const DAY_DETAILS = {
  // Shown above the run of the day. Leave empty to hide it.
  intro: '',

  // Leave `title` empty to hide the dress code section entirely.
  dressCode: {
    title: '',
    body: '',
    notes: [],
  },

  // Each entry becomes its own section. Shape:
  // { id, eyebrow, title, body, items: [{ label, value }] }
  sections: [],

  // Shown to guests as things still being worked out. Delete an entry once its
  // real section exists above.
  comingSoon: [
    { title: 'Times', note: 'The full order of the day, once it is set.' },
    { title: 'Dress code', note: '' },
    { title: 'The menu', note: '' },
    { title: 'Travel and where to stay', note: '' },
  ],
}
