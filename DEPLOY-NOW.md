# Deployment steps

1. Create a new GitHub repository, then upload all files in this folder.
2. In Netlify: **Add new project → Import an existing project → GitHub**.
3. Select the repository and click **Deploy site**.
4. Submit a test enquiry. It should create a row in the `Leads` sheet tab with the event-specific source: **Blooming Good Real Estate at the Toyota Legend Ermelo** and both lead contacts: Marko Ferreira + Marlyn Ferreira.

This project includes the Apps Script endpoint in the server-side Netlify function fallback, so the old “not configured yet” message will not appear because of a missing environment variable.


### Google Sheets endpoint in this version
The Netlify function has been updated to use this deployed Apps Script Web App URL:

```text
https://script.google.com/macros/s/AKfycbyWuLwKLtgogLFs4MgNcugcn5FHe9xdusJ2eZK5_1khg_8cJZ75XZq5JLGG25MNOo1soA/exec
```
