# Blooming Good Real Estate — Toyota Legend Ermelo

Co-branded lead-capture page for **Marlyn Ferreira Properties**, **Blue Lily Properties**, **Marko Ferreira** and **Marlyn Ferreira**.

## Important fix included
The prior deployment showed “The enquiry form is not configured yet.” This build removes that dependency: the supplied Google Apps Script `/exec` URL is included as the Netlify Function fallback. The form works without adding `GOOGLE_APPS_SCRIPT_URL` in Netlify.

## Deploy
1. Upload this project folder to GitHub.
2. In Netlify, choose **Add new project → Import an existing project**.
3. Select the GitHub repository and deploy.
4. No build command is needed. Netlify reads `netlify.toml` automatically.

## Google Apps Script
The code in `apps-script/Code.gs` already uses the supplied Google Sheet ID. Confirm that the Google Apps Script deployment is published as a **Web app** with access set to **Anyone** and that the latest code version is deployed.

## Lead source saved in Google Sheets
`Blooming Good Real Estate at the Toyota Legend Ermelo | Lead contacts: Marko Ferreira + Marlyn Ferreira | Marlyn Ferreira Properties + Blue Lily Properties`


## Lead contacts displayed on the page
- **Marko Ferreira** — 072 127 0306 | marko@bluelilysa.co.za | PPRA FFC 1270762
- **Marlyn Ferreira** — 076 726 3868 | marlyn@bluelilysa.co.za | PPRA FFC 1235514

## Connected Google Apps Script endpoint

This build is configured to send enquiries to:

```text
https://script.google.com/macros/s/AKfycbyWuLwKLtgogLFs4MgNcugcn5FHe9xdusJ2eZK5_1khg_8cJZ75XZq5JLGG25MNOo1soA/exec
```

The endpoint is stored server-side in `netlify/functions/submit-lead.js`. Do not put it into the browser-side `site/app.js`.

## Apps Script testing
Do not run `doPost` manually in Apps Script. Select `testLeadSubmission` from the function dropdown to write a safe test lead, then deploy a new version of the web app.
