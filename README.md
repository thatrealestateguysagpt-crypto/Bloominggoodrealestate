# Marlyn Ferreira Properties – Lead Capture Form

A polished, mobile-friendly enquiry form for **Marlyn Ferreira Properties**, powered by **Blue Lily Properties**.

The site is intended for a GitHub → Netlify workflow. Enquiries are validated in a Netlify Function and then saved to the supplied Google Sheet through a Google Apps Script web app.

## Captured fields

1. Timestamp
2. Name
3. Surname
4. Number
5. Email
6. Do you own a property? (Yes / No)
7. Do you want to sell a property? (Yes / No)
8. Do you want to buy a property? (Yes / No)
9. Do you need insurance? (Yes / No)
10. Do you need a will? (Yes / No)
11. I consent to communication (Yes / No)
12. Additional Info
13. Source

## Project structure

```text
marlyn-ferreira-lead-capture/
├── apps-script/
│   └── Code.gs                 # Paste into Apps Script linked to the Google Sheet
├── netlify/
│   └── functions/
│       └── submit-lead.js      # Server-side validation and secure relay
├── site/
│   ├── assets/                 # Marlyn + Blue Lily logos
│   ├── index.html              # Front end
│   ├── styles.css              # Styling
│   └── app.js                  # Browser form logic
├── netlify.toml                # Netlify build + API route settings
└── package.json
```

---

## 1. Prepare the Google Sheet backend

The Apps Script is already configured with this spreadsheet ID:

```text
1-uRPB6uM9bHpIo69CMSMLxQVlsE2tVgodY5FFCOKnv0
```

1. Open the Google Sheet.
2. Select **Extensions → Apps Script**.
3. Replace any starter code with the contents of `apps-script/Code.gs`.
4. Click **Save**.
5. Select **Deploy → New deployment → Web app**.
6. Set the app to run as the account that owns the sheet.
7. Choose an access setting that allows the public website to submit the form without each visitor needing a Google sign-in.
8. Authorise the script when Google asks.
9. Deploy, then copy the URL that ends in **`/exec`**.

The script automatically creates a sheet tab called **Leads** and adds the heading row on its first successful submission.

> Do not use the `/dev` URL on Netlify. It is for testing by script editors only.

---

## 2. Put the project on GitHub

1. Create a new GitHub repository, for example: `marlyn-ferreira-leads`.
2. Upload all files and folders from this project, keeping the folder structure unchanged.
3. Commit and push the repository.

No Google Sheet URL or Apps Script URL is placed in the public front-end files.

---

## 3. Deploy on Netlify

1. In Netlify, select **Add new project → Import an existing project**.
2. Connect GitHub and select the repository.
3. Netlify reads `netlify.toml` automatically. The publish folder is `site` and no build command is required.
4. The supplied Apps Script `/exec` URL has already been added to `netlify.toml`, so no additional environment-variable setup is required for the first deployment.
5. Deploy the site.

The public page sends data to `/api/lead`. The Netlify Function validates the form and sends it server-to-server to Apps Script. The URL is held in Netlify’s server-side build configuration, not in browser-side code.

> Later, you may override `GOOGLE_APPS_SCRIPT_URL` in **Netlify → Site configuration → Environment variables** without changing the repository.

---

## 4. Test the full flow

1. Open the published Netlify URL.
2. Submit a real test enquiry.
3. Open the Google Sheet and verify that the **Leads** tab contains a new row.
4. Check that the consent response and the source column are captured correctly.

## Important operational notes

- The form includes a hidden honeypot field and server-side validation to reduce obvious spam. It is not a replacement for dedicated spam protection if the campaign becomes high-volume.
- The form records consent as either **Yes** or **No**. Use contact details only in line with the permission the visitor selected and your privacy process.
- Keep the Apps Script project under the account that owns or has ongoing access to the Google Sheet. If ownership changes, redeploy the web app.

## Deployment status

The Netlify deployment configuration now contains this Apps Script endpoint:

```text
https://script.google.com/macros/s/AKfycbxOVSMBjEzZDCazxDS6FhS_JnI143xZJChbnPQ-nxSxpFvw-e-Va-dPHeIjIbzBdsUS2Q/exec
```

After importing the project from GitHub into Netlify, publish the site. No code changes are needed for the Google Sheets connection.
