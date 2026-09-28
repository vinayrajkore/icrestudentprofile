/**
 * functions/api.js  -  Cloudflare Pages Function
 * ================================================
 * Acts as a CORS-safe proxy between the browser and Google Apps Script.
 *
 * Why this is needed:
 *   Google Apps Script Web Apps do not reliably send Access-Control-Allow-Origin
 *   headers when called from a real web origin. This function runs on Cloudflare's
 *   edge (server-side) where CORS doesn't apply, forwards the request to Apps
 *   Script, and returns the response to the browser with proper CORS headers.
 *
 * Frontend calls:  POST /api  { action, ...payload }
 * This function:   POST Apps Script /exec  { action, ...payload }
 * Browser gets:    JSON response with Access-Control-Allow-Origin: *
 *
 * The Apps Script URL is read from the CF_API_URL environment variable
 * set in Cloudflare Pages → Settings → Environment variables.
 */

export async function onRequestPost(context) {
  const CORS = {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type":                 "application/json",
  };

  try {
    const apiUrl = context.env.CF_API_URL;

    if (!apiUrl) {
      return new Response(
        JSON.stringify({ ok: false, error: "CF_API_URL env var not set in Cloudflare Pages." }),
        { status: 500, headers: CORS }
      );
    }

    // Forward the request body to Apps Script
    const body = await context.request.text();

    const upstream = await fetch(apiUrl, {
      method:  "POST",
      body:    body,
      headers: { "Content-Type": "text/plain" },  // text/plain = no preflight
    });

    const text = await upstream.text();

    // Try to parse as JSON; fall back to wrapping the text
    let json;
    try {
      json = JSON.parse(text);
    } catch (_) {
      json = { ok: false, error: "Apps Script returned non-JSON: " + text.slice(0, 200) };
    }

    return new Response(JSON.stringify(json), { status: 200, headers: CORS });

  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: "Proxy error: " + String(err) }),
      { status: 500, headers: CORS }
    );
  }
}

// Handle OPTIONS preflight
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin":  "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
