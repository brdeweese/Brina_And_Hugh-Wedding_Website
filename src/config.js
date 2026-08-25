// ---------------------------------------------------------------------------
// EDIT ME. Everything guest-facing that you are likely to change lives here.
// ---------------------------------------------------------------------------

// Paste the Apps Script Web App URL here after step 4 of SETUP.md.
// It looks like: https://script.google.com/macros/s/AKfy..../exec
export const APPS_SCRIPT_URL = ''

export const WEDDING = {
  brideName: 'Brina',
  groomName: 'Hugh',
  // ISO date + time of the ceremony, in Irish local time.
  dateISO: '2027-07-31T14:00:00+01:00',
  dateLong: 'Saturday 31st July 2027',
  dateShort: '31 . 07 . 2027',
  venueName: "Wright's Anglers Rest",
  venueArea: 'Strawberry Beds',
  venueCity: 'Dublin, Ireland',
  venueAddress: "Wright's Anglers Rest, Strawberry Beds, Chapelizod, Dublin 20, Ireland",
  venueMapUrl: 'https://maps.google.com/?q=Wrights+Anglers+Rest+Strawberry+Beds+Dublin',
  // RSVP deadline shown to guests.
  rsvpByLong: 'Saturday 1st May 2027',
  contactEmail: '',
}

// The public address of the deployed site. Used to build invite links in the
// admin dashboard. No trailing slash.
// GitHub Pages default: https://brdeweese.github.io/Brina_And_Hugh-Wedding_Website
export const SITE_URL = 'https://brdeweese.github.io/Brina_And_Hugh-Wedding_Website'

// Meal choices offered on the RSVP form. Edit freely once the menu is settled;
// the labels are what get written to the spreadsheet.
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

export const SCHEDULE = [
  { time: '1:30 pm', title: 'Guests arrive', note: 'Please be seated by 1:45 pm' },
  { time: '2:00 pm', title: 'Ceremony', note: '' },
  { time: '3:00 pm', title: 'Drinks reception', note: 'Along the river' },
  { time: '5:00 pm', title: 'Dinner', note: '' },
  { time: '8:00 pm', title: 'First dance and music', note: '' },
  { time: 'Late', title: 'Carriages', note: '' },
]

export const FAQS = [
  {
    q: 'What should I wear?',
    a: 'Formal dress. Think garden party rather than black tie. The drinks reception is outdoors on the riverbank, so flat or block heels will thank you on the grass, and bring a layer for the evening.',
  },
  {
    q: 'Can I bring a guest?',
    a: 'Your invitation names everyone we have space for, and your RSVP page will show exactly who is included. If you have been given a plus one, there is a box on the form to tell us their name.',
  },
  {
    q: 'Are children welcome?',
    a: 'We would love to celebrate with the little ones who are named on your invitation. If your RSVP page does not list them, we are afraid we could not stretch to it this time.',
  },
  {
    q: 'How do I get there?',
    a: "Wright's Anglers Rest is on the Strawberry Beds, about twenty minutes from Dublin city centre by car and roughly ten minutes from the Phoenix Park. There is parking on site, but the lanes are narrow, so a taxi is the easy option.",
  },
  {
    q: 'Where should I stay?',
    a: 'See the Travel and Stay section below for a few places we like at a range of prices, all within a short taxi ride of the venue.',
  },
  {
    q: 'What about gifts?',
    a: 'Your presence is genuinely the present. If you would still like to mark the day, a contribution towards our honeymoon is very welcome, and there will be a card box on the day.',
  },
  {
    q: 'When do you need to know by?',
    a: 'Please RSVP by Saturday 1st May 2027 so we can confirm numbers with the venue. If your plans change after that, just get in touch.',
  },
]

// Starting suggestions only. Please check each one yourself, confirm the travel
// times, and ask about a room block before the site goes live.
export const STAYS = [
  {
    name: 'Castleknock Hotel',
    distance: 'Castleknock',
    note: 'The closest full service hotel to the Strawberry Beds, with a spa and plenty of parking. A good base for anyone driving.',
    url: '',
  },
  {
    name: 'Lucan Spa Hotel',
    distance: 'Lucan',
    note: 'Just the other side of the river and usually the friendliest on price. Handy if a group wants to book together.',
    url: '',
  },
  {
    name: 'Ashling Hotel',
    distance: 'Parkgate Street',
    note: 'On the edge of the Phoenix Park, so you get the city on your doorstep and a short taxi out to the venue.',
    url: '',
  },
  {
    name: 'Dublin city centre',
    distance: 'About 20 minutes',
    note: 'If you are making a weekend of it, staying central is lovely. Taxis out to the Strawberry Beds are straightforward, though worth booking ahead for the journey home.',
    url: '',
  },
]
