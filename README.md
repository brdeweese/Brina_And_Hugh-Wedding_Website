# Brina & Hugh

Wedding website and RSVP system for **Saturday 31st July 2027** at Wright's
Anglers Rest, Strawberry Beds, Dublin.

**New here? Start with [SETUP.md](SETUP.md).**

---

## What it does

Three pages, one Google Sheet behind them.

| Page         | For       | What it is                                                                       |
| ------------ | --------- | -------------------------------------------------------------------------------- |
| `index.html` | Guests    | The website: story, schedule, venue, places to stay, questions                    |
| `rsvp.html`  | Guests    | Personal RSVP form, opened by invite code                                         |
| `admin.html` | Just you  | Guest list, live counts, invite sending, CSV exports. Passcode protected          |

### How an invitation works

Each invited **party** gets one six-character code, for example `KQ4M7B`, and a
personal link:

```
https://brdeweese.github.io/Brina_And_Hugh-Wedding_Website/rsvp.html?c=KQ4M7B
```

Opening that link skips the code entry and goes straight to their form, already
listing the right people. A party can be:

- **One person.** One seat, one reply.
- **A couple, or a family.** One seat per named person. Each answers separately,
  so one can come and the other send apologies without confusing your numbers.
- **One person with a plus one.** An extra unnamed seat. If they accept, they
  type their guest's name in and it lands in the sheet.

Nobody needs an account or a password. Anyone can decline as easily as accept,
and everyone can come back and change their answer up to the day.

### How invitations get sent

The dashboard does not send anything by itself, on purpose. Each row has
**WhatsApp**, **Text**, **Email**, **Copy link** and **Copy message** buttons.
The first three open your own WhatsApp, Messages or mail app with the message
already written and the right link in it, so all you do is press send and it
comes from your real number. **Mark sent** then stamps the date in the sheet, so
you always know who has actually been invited.

Edit the wording once via the **Message** button. Placeholders like `{names}`,
`{link}` and `{code}` are filled in per guest.

### What you get back

Live at the top of the dashboard: invitations, people invited, invites sent,
awaiting reply, coming, declined, plus a running tally of meal choices and how
many people have dietary requirements.

Two CSV exports:

- **Export all**, one row per person, everything on file.
- **Catering list**, only the people actually coming, with meal and dietary
  notes, sorted by name. This is the one the venue wants.

---

## Running it locally

```bash
npm install
```

```bash
npm run dev
```

Then open the printed address. `/rsvp.html` and `/admin.html` sit alongside it.

RSVP and dashboard pages need `APPS_SCRIPT_URL` filled in first, see
[SETUP.md](SETUP.md) step 5. The home page works without it.

### Trying it without Google

Add `?mock=1` to any page in dev and it runs against a fake guest list held in
memory, so you can click the whole thing through before setting anything up:

- `http://localhost:5173/rsvp.html?mock=1&c=TR9XP2` — a single guest with a plus one
- `http://localhost:5173/rsvp.html?mock=1&c=KQ4M7B` — a couple who already replied
- `http://localhost:5173/admin.html?mock=1` — the dashboard, passcode `demo`

Changes are forgotten on reload. The mock is dev only and is stripped out of
production builds entirely.

To check a production build:

```bash
npm run build && npm run preview
```

## Deploying

Every push to `main` triggers `.github/workflows/deploy.yml`, which builds the
site and publishes it to GitHub Pages. Set **Settings > Pages > Source** to
**GitHub Actions** once, and that is it.

## A note on privacy

`admin.html` is protected by a passcode checked on the server, and is marked
`noindex` so search engines skip it. The guest list itself is never sent to the
browser without that passcode. An invitation code returns only that party's own
details, never contact details and never your private notes.

Anyone who has a guest's link can see that guest's names and change their reply.
That is the normal trade-off for not making a hundred people create accounts, and
it is the same as a paper invitation somebody else could open.
