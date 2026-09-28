/**
 * CODE_GS_TOKEN_SNIPPET.gs
 * ========================
 * COMPLETE doPost() REPLACEMENT for Code.gs
 *
 * PROBLEM SOLVED: Without a try/catch that ALWAYS returns via ContentService,
 * any unhandled exception makes Apps Script return an HTML error page with
 * NO CORS headers — the browser then shows "Could not reach the server".
 *
 * HOW TO USE:
 *   1. Open your Apps Script project (script.google.com)
 *   2. Find your existing doPost() function
 *   3. ADD the safe JSON parser at the top of doPost() as shown below
 *   4. Make sure var data = parseBody(e) is the FIRST line inside doPost()
 *   5. Save, then Deploy > Manage Deployments > click pencil > Version: New version > Deploy
 */

// ============================================================
// SAFE BODY PARSER — add this ABOVE your doPost() function
// ============================================================
function parseBody(e) {
  try {
    // New style: JSON body sent by the portal (e.postData.contents)
    if (e.postData && e.postData.contents) {
      return JSON.parse(e.postData.contents);
    }
  } catch (err) { /* fall through */ }
  // Old style fallback: form-encoded parameters
  return e.parameter || {};
}

function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================
// YOUR doPost() — replace your existing one with this pattern
// ============================================================
function doPost(e) {
  try {
    // 1. Parse body safely (supports both JSON and form-encoded)
    var data = parseBody(e);
    var action = data.action || "";

    // 2. Token validation — skip this block if you haven't set PORTAL_TOKEN yet
    var expectedToken = PropertiesService
      .getScriptProperties()
      .getProperty("PORTAL_TOKEN");

    if (expectedToken && data.portalToken !== expectedToken) {
      return respond({ ok: false, error: "Unauthorized" });
    }
    // ---------------------------------------------------------

    // 3. Route to your existing action handlers
    //    IMPORTANT: replace the switch cases below with YOUR existing code
    //    Just change HOW you read the data — use data.fieldName
    //    instead of e.parameter.fieldName
    switch (action) {

      // ---- EXAMPLE: replace with your real cases ----
      // case "login":
      //   return respond(handleLogin(data));
      //
      // case "getStudents":
      //   return respond(handleGetStudents(data));

      default:
        return respond({ ok: false, error: "Unknown action: " + action });
    }

  } catch (err) {
    // CRITICAL: always return via ContentService so CORS headers are sent
    return respond({ ok: false, error: "Server error: " + String(err) });
  }
}
