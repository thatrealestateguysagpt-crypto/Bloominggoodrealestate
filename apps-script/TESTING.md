# Test the Google Sheet connection

1. Open the Apps Script project attached to the Google Sheet.
2. Replace `Code.gs` with the supplied version and click **Save**.
3. In the function dropdown next to **Run**, select `testLeadSubmission`.
4. Click **Run** and approve permissions when Google asks.
5. Open the **Leads** sheet. A row named `Test Lead` should appear.
6. Choose **Deploy → Manage deployments → Edit → New version → Deploy**.

Do not run `doPost` from the Apps Script editor. `doPost` is only called by the live Netlify form and needs a real form submission.
