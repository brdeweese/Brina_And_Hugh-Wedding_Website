# Setup

About thirty minutes, once. Do the steps in order.

---

## 1. Create the spreadsheet

1. Go to [sheets.new](https://sheets.new) and name it **Brina & Hugh - Guest List**.
2. Menu: **Extensions > Apps Script**. A code editor opens in a new tab.
3. Delete whatever is in `Code.gs`, then paste in the entire contents of
   [`apps-script/Code.gs`](apps-script/Code.gs) from this repository.
4. Click the save icon.

## 2. Build the tabs

1. In the Apps Script toolbar, pick **setupSheet** from the function dropdown and press **Run**.
2. Google asks for permission the first time. Choose your account, then
   **Advanced > Go to (project name) (unsafe)** and **Allow**. That warning appears
   for every personal script that has not been through Google's review; the code
   is the file in this repo and it only touches this one spreadsheet.
3. Go back to the spreadsheet. You should now have **Parties** and **People** tabs
   with headers and one example row.

## 3. Set your passcode

1. In Apps Script, click the gear icon (**Project Settings**).
2. Scroll to **Script Properties** and **Add script property**:
   - Property: `ADMIN_TOKEN`
   - Value: a passcode of your choosing. This is what unlocks the dashboard.
3. Optional but recommended, add a second property:
   - Property: `NOTIFY_EMAIL`
   - Value: your email address. You will get an email each time somebody RSVPs.
4. Save.

## 4. Publish the script as a web app

1. Top right: **Deploy > New deployment**.
2. Click the gear next to "Select type" and choose **Web app**.
3. Set:
   - Description: anything
   - Execute as: **Me**
   - Who has access: **Anyone**
4. **Deploy**, approve access if asked, then **copy the Web app URL**. It ends in `/exec`.

> "Anyone" means anyone with the URL can call the script. It does not give anyone
> access to your Google account or the spreadsheet itself. Guest data is only
> returned when a valid invitation code is supplied, and the full list needs the
> passcode from step 3.

## 5. Connect the website

Open [`src/config.js`](src/config.js) and paste the URL from step 4:

```js
export const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfy..../exec'
```

While you are in there, check `SITE_URL`, `WEDDING`, `MEAL_OPTIONS` and the FAQ
answers. Everything guest-facing that you are likely to want to change lives in
that one file.

## 6. Add the photos

Drop these into `public/images/`, using exactly these filenames:

| Filename                  | What it is                                             |
| ------------------------- | ------------------------------------------------------ |
| `hero-proposal.jpg`       | The proposal shot at Glendalough, used full screen     |
| `story-glendalough.jpg`   | The two of you embracing by the lake                   |
| `venue-illustration.png`  | The watercolour pub illustration from the save the date |

Until they are there the site shows a labelled placeholder rather than a broken
image, so nothing looks wrong while you gather them.

## 7. Turn on GitHub Pages

1. On GitHub: **Settings > Pages**.
2. Under "Build and deployment", set **Source** to **GitHub Actions**.
3. Push to `main`. The workflow in `.github/workflows/deploy.yml` builds and publishes.
4. The site appears at `https://brdeweese.github.io/Brina_And_Hugh-Wedding_Website/`.

## 8. Test it end to end

1. Open `.../admin.html`, enter your passcode.
2. **Add invitation**, put yourself in with your own phone number, save.
3. Press **Copy link** on your row, open the link, and RSVP as if you were a guest.
4. Check the **People** tab of the spreadsheet: your answer, meal and dietary
   notes should all be sitting there.
5. Delete the `DEMO01` rows from both tabs once you are happy.

---

## Re-deploying the script after an edit

If you ever change `Code.gs`, you must click **Deploy > Manage deployments >**
the pencil icon **> Version: New version > Deploy**. Simply saving the file does
not update the live web app. The URL stays the same.

## Where things live

| Thing                           | Where                                   |
| ------------------------------- | --------------------------------------- |
| Wedding details, FAQ, meals     | `src/config.js`                         |
| Colours and fonts               | `src/styles/base.css`                   |
| The story text                  | `src/components/HomePage.jsx`           |
| Backend and sheet columns       | `apps-script/Code.gs`                   |
| Invitation message wording      | The **Message** button in the dashboard |

## Editing the sheet by hand

You can, and it is often quicker for bulk work. The rules:

- **Parties** and **People** are linked by the `code` column. Keep them matching.
- Every person needs a `person_id` that is unique within their party (`p1`, `p2`, ...).
- A plus one is a row in **People** with `is_plus_one` set to `TRUE` and a blank
  `name`. The guest fills the name in themselves.
- `allow_plus_one` on the **Parties** row should be `TRUE` for those parties too.
- Do not rename or reorder the header row. Adding your own extra columns at the
  end is fine and they will be left alone.
