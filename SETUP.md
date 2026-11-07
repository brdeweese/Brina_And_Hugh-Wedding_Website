# Setup

About fifteen minutes, once. Do the steps in order.

---

## 1. Create the spreadsheet

1. Go to [sheets.new](https://sheets.new) and name it **Brina & Hugh - RSVPs**.
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
3. Back in the spreadsheet you now have **Guests** and **Replies** tabs with headers.

## 3. Set your passcode

1. In Apps Script, click the gear icon (**Project Settings**).
2. Scroll to **Script Properties** and **Add script property**:
   - Property: `ADMIN_TOKEN`
   - Value: a passcode of your choosing. This is what opens the guest list on the site.
3. Optional: add `NOTIFY_EMAIL` with your email address to get an email each
   time somebody replies.
4. Save.

## 4. Publish the script as a web app

1. Top right: **Deploy > New deployment**.
2. Click the gear next to "Select type" and choose **Web app**.
3. Set **Execute as: Me** and **Who has access: Anyone**.
4. **Deploy**, approve access if asked, then **copy the Web app URL**. It ends in `/exec`.

> "Anyone" means anyone with the URL can call the script. It does not give
> anyone access to your Google account or the spreadsheet. A guest only gets
> their own invitation back, and the full list needs your passcode.

## 5. Connect the website

Open [`site/config.js`](site/config.js) and paste the URL between the quotes:

```js
window.BH_CONFIG = {
  appsScriptUrl: 'https://script.google.com/macros/s/AKfy..../exec',
};
```

Commit and push to `main`. The site republishes itself in about a minute.

## 6. GitHub Pages

Already on from the previous version of the site. If it ever needs turning on
again: **Settings > Pages > Source: GitHub Actions**.

## 7. Test it end to end

1. Open `https://brdeweese.github.io/Brina_And_Hugh-Wedding_Website/?admin#rsvp`,
   get through the envelope, and enter your passcode.
2. Add yourself as a guest.
3. Use the switch in the bottom-left corner to view as **Guest**, type your
   name into the RSVP box, and send a reply.
4. Check the **Replies** tab of the spreadsheet: your answers should be there.
5. Remove yourself from the guest list (and delete your row in **Replies**).

---

## Re-deploying the script after an edit

If you ever change `Code.gs`, click **Deploy > Manage deployments >** the pencil
icon **> Version: New version > Deploy**. Saving the file alone does not update
the live web app. The URL stays the same.

## The old guest list

The previous version of the site used a different sheet (Parties and People
tabs) and invite codes. It is not used any more. Keep it for reference or
delete it; the new site does not touch it.
