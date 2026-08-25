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

// The song request box on the RSVP form. Set `enabled` to false to drop it.
export const SONG_REQUEST = {
  enabled: true,
  label: 'Songs that will get you dancing',
  hint: 'One or several, whatever it takes. We are handing this list straight to whoever is playing, so be honest rather than tasteful.',
  placeholder: 'Artist and song, one per line',
  // Shown to guests who are not coming, where asking for a dance floor song
  // would read oddly.
  declinedLabel: '',
}

// Common restrictions offered as quick checkboxes, plus a free-text box.
export const DIETARY_OPTIONS = [
  'Gluten free',
  'Dairy free',
  'Nut allergy',
  'Shellfish allergy',
  'Halal',
  'Kosher',
]

// `note` is the one line shown on the public home page. `detail` is the longer
// version, shown only on the details page once a guest has replied. Leave
// `detail` empty and the section simply shows the note.
export const SCHEDULE = [
  {
    time: '1:30 pm',
    title: 'Guests arrive',
    note: 'Please be seated by 1:45 pm',
    detail:
      'Come round to the riverside entrance and someone will point you the right way. Do give yourself a few extra minutes, the lane in is narrow and slow.',
  },
  {
    time: '2:00 pm',
    title: 'Ceremony',
    note: '',
    detail: 'About half an hour. TO ADD: who is officiating, readings, and any music.',
  },
  {
    time: '3:00 pm',
    title: 'Drinks reception',
    note: 'Along the river',
    detail:
      'Drinks and something to eat on the terrace above the water. This is when the photographs happen, so please do not feel you need to stand still for any of it.',
  },
  {
    time: '5:00 pm',
    title: 'Dinner',
    note: '',
    detail:
      'Everyone is called through and seated. TO ADD: the seating plan, the menu, and how long the speeches will run.',
  },
  {
    time: '8:00 pm',
    title: 'First dance and music',
    note: '',
    detail:
      'Tables are cleared back and the floor opens. TO ADD: the band or DJ. Your song requests go straight to whoever is playing.',
  },
  {
    time: 'Late',
    title: 'Carriages',
    note: '',
    detail: 'TO ADD: the exact finish time and how taxis are being organised.',
  },
]

// ---------------------------------------------------------------------------
// The details page, which only opens once a guest has replied.
// Everything below is a foundation. Fill it in as decisions get made.
// ---------------------------------------------------------------------------

export const DAY_DETAILS = {
  intro:
    'Thank you for letting us know. Here is everything we have settled so far. We will keep adding to this page as the day takes shape, so do come back to it closer to the time.',

  dressCode: {
    title: 'Formal, with comfortable shoes',
    body: 'Think garden party rather than black tie. Suits and jackets, dresses and good separates, all very welcome.',
    notes: [
      'The drinks reception is outdoors on grass and gravel, so flats or block heels will serve you far better than a stiletto.',
      'Irish evenings turn cool the moment the sun goes, even in July. Bring a layer you are happy to be photographed in.',
      'No dress code on colour, with the usual exception of white.',
    ],
  },

  sections: [
    {
      id: 'getting-there',
      eyebrow: 'Practicalities',
      title: 'Getting there and home',
      body: "Wright's Anglers Rest sits on a narrow lane along the Strawberry Beds, above the Liffey. It is roughly twenty minutes from the centre of Dublin and ten from the Phoenix Park.",
      items: [
        { label: 'Parking', value: 'TO ADD: how many spaces the venue can hold, and whether cars can be left overnight.' },
        { label: 'Taxis', value: 'TO ADD: a local firm worth booking in advance, particularly for the journey home.' },
        { label: 'Buses', value: 'TO ADD: nearest stop and the walk from it, if there is a sensible one.' },
      ],
    },
    {
      id: 'on-the-day',
      eyebrow: 'Good to know',
      title: 'A few small things',
      body: '',
      items: [
        { label: 'Children', value: 'We would love to see the little ones named on your invitation.' },
        { label: 'Photographs', value: 'TO ADD: whether phones are welcome during the ceremony, and where the gallery will go afterwards.' },
        { label: 'Gifts', value: 'Your presence really is the present. There will be a card box on the day for anyone who wants one.' },
        { label: 'Accessibility', value: 'TO ADD: step-free routes, accessible facilities, and anyone to ask on the day.' },
      ],
    },
  ],

  // Cards shown as deliberately unfinished, so guests know more is coming and
  // you know where to put it. Delete one once its real section exists above.
  comingSoon: [
    { title: 'The menu', note: 'Once tasting is done and the courses are chosen.' },
    { title: 'Seating plan', note: 'Closer to the day, once numbers are final.' },
    { title: 'The wedding party', note: 'Who is standing with us, and who to find if you need anything.' },
    { title: 'The playlist', note: 'Built from the songs you are all sending us.' },
  ],
}

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
