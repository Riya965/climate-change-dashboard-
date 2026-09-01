// ============================================================================
// LIVE DATA CONFIG
// ----------------------------------------------------------------------------
// Fill in SHEET_CSV_URL below to make the dashboard pull real-time responses
// from your Google Form's response Sheet. Leave it empty ('') to keep using
// the fixed demo numbers in data.js.
//
// HOW TO GET THIS LINK (2 minutes, no coding):
//   1. Open your Google Form  →  click the "Responses" tab.
//   2. Click the green Sheets icon ("View responses in Sheets"). This opens
//      (or creates) the linked Google Sheet where every response is stored.
//   3. In that Sheet: File → Share → Publish to web.
//   4. In the dialog: first dropdown → select the correct sheet/tab
//      (usually "Form Responses 1"). Second dropdown → select "Comma-separated
//      values (.csv)".
//   5. Click Publish → confirm. Copy the link it gives you.
//   6. Paste that link below as SHEET_CSV_URL (between the quotes).
//
// After this, every new response submitted through your Google Form will
// appear on the Sheet, and the dashboard will pick it up automatically
// (on page load, and every REFRESH_INTERVAL_MS after that).
// ============================================================================

const SHEET_CSV_URL = '';

// How often (in milliseconds) the dashboard re-fetches the Sheet while the
// page is open. 60000 = every 1 minute. Set to 0 to disable auto-refresh
// (it will still fetch once when the page loads).
const REFRESH_INTERVAL_MS = 60000;
