// Settings for the wedding website.
//
// appsScriptUrl: the Web app URL of the Google Sheet's Apps Script, ending in /exec.
// See SETUP.md, step 4. Until it is filled in, the site works but the RSVP
// says the guest list isn't connected yet.
//
// This URL being public is by design. Anyone holding it can ask the script a
// question, but a guest only ever gets their own invitation back, and the whole
// list needs the passcode held as ADMIN_TOKEN in the script's properties. It
// gives nobody access to the Google account or to the spreadsheet itself.
window.BH_CONFIG = {
  appsScriptUrl: 'https://script.google.com/macros/s/AKfycbznXBALFhzMuwprJkQ9FfZYaXpBoh8U8opihLNYiFIrp_Lj9bkhPVvRnx-NZdDxqdU/exec',
};
