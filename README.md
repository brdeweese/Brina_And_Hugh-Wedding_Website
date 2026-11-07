# Brina & Hugh

Wedding website for **Saturday 31 July 2027** at Wrights Anglers Rest,
Strawberry Beds, Dublin.

Live at <https://brdeweese.github.io/Brina_And_Hugh-Wedding_Website/>

**Setting it up for the first time? Follow [SETUP.md](SETUP.md).**

---

## What it is

One page, plain HTML, published to GitHub Pages straight from the
[`site/`](site/) folder. There is no build step.

- **The envelope.** Guests click the wax seal, the invitation slides out, and
  they type the password printed on their card (any capitals) to come in.
- **Home** with the proposal video, **Schedule of the Day**, and **Venue & Where
  to Stay**.
- **RSVP.** A guest types their name. If it is on the guest list, the lake walk
  plays and their reply card appears, already showing everyone on their
  invitation. They answer for each person, choose dietary requirements, and can
  add songs and a note. They can come back and change it until 1 June 2027, and
  download a keepsake RSVP card as a picture.
- **Guest list (just you).** Add `?admin` to the address, for example
  <https://brdeweese.github.io/Brina_And_Hugh-Wedding_Website/?admin#rsvp>, and
  enter your passcode. You can add and remove invitations and read every reply.
  The switch in the bottom-left corner shows you the page as a guest sees it.

## Where things are kept

The guest list and replies live in a Google Sheet with two tabs:

| Tab       | One row per          | Columns                                                         |
| --------- | -------------------- | --------------------------------------------------------------- |
| `Guests`  | invitation           | `id`, `name`, `type` (`single`, `plus_one` or `couple`), `partner`, `added_at` |
| `Replies` | invitation that replied | who replied, a readable `summary`, `attending_count`, songs, note, dates, and the full answers as JSON |

The website talks to the sheet through the small Apps Script in
[`apps-script/Code.gs`](apps-script/Code.gs). Its address goes in
[`site/config.js`](site/config.js).

You can add guests in the sheet directly instead of on the site: give each row a
unique `id` (anything, e.g. `g001`), the full name, and the type. A couple needs
the partner's full name in `partner`. Either name on a couple's invitation lets
them in. Matching ignores capitals, accents and punctuation.

## Files

| Path                         | What                                             |
| ---------------------------- | ------------------------------------------------ |
| `site/index.html`            | The whole website: layout, styles and behaviour  |
| `site/config.js`             | The Apps Script address                          |
| `site/img/`                  | Photos, videos, envelope and invitation artwork  |
| `apps-script/Code.gs`        | The Google Sheet backend                         |
| `.github/workflows/deploy.yml` | Publishes `site/` to GitHub Pages on every push to `main` |

## Changing the text

Schedule, venue, hotels and dates are written directly in `site/index.html`.
Search for the words you want to change. The RSVP deadline appears in two
places that must match: `DEADLINE` in `site/index.html` and in
`apps-script/Code.gs`.

## Running it on your computer

```bash
npx serve site
```

Then open the address it prints. The RSVP needs `site/config.js` filled in to
find guests.

## Privacy

- The whole site is marked `noindex`, so search engines leave it out.
- The envelope password is a welcome, not a lock: it is checked in the browser.
- The guest list itself is never sent to the browser. A guest only sees their
  own invitation, after typing a name that is on it. Anyone who knows a guest's
  full name could see and change that guest's reply, which is the same trade-off
  as on the claude.ai version.
- The guest list and replies view needs the passcode, which is checked by the
  Apps Script, not the browser.
