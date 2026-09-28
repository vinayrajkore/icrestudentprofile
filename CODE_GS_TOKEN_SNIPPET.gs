/**
 * Code.gs  -  PORTAL TOKEN VALIDATION SNIPPET
 * =============================================
 * Add this to the TOP of your doPost() function in Code.gs.
 * This ensures that only requests from your portal (with the correct
 * PORTAL_TOKEN) are processed. Anyone who discovers the Apps Script URL
 * but does not know the token will receive an "Unauthorized" response.
 *
 * SETUP:
 *   1. In Apps Script, go to: Project Settings > Script Properties
 *   2. Add property:  PORTAL_TOKEN  =  (same value as in your config.js)
 *   3. Redeploy the Web App after adding the property.
 *
 * IMPORTANT: After setting up the token, regenerate your Apps Script
 * deployment URL (Deploy > Manage Deployments > New Deployment) and
 * update API_URL in your config.js with the new URL.
 */

// ---- Paste this at the TOP of your doPost() function ----
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    // --- TOKEN VALIDATION ---
    var expectedToken = PropertiesService
      .getScriptProperties()
      .getProperty("PORTAL_TOKEN");

    if (!expectedToken || data.portalToken !== expectedToken) {
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: "Unauthorized" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    // --- END TOKEN VALIDATION ---

    // ... rest of your existing doPost logic below ...
    var action = data.action;
    // switch (action) { ... }

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
