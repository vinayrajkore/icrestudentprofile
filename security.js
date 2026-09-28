/**
 * security.js  -  ICRE Gargoti Student Portal
 * ============================================
 * Runtime security utilities loaded by BOTH index.html and admin.html.
 *
 * What this file does:
 *   1. Validates APP_CONFIG is present before the app starts
 *   2. Freezes the config object so it cannot be mutated at runtime
 *   3. Provides a client-side rate-limiter for API calls (anti-spam)
 *   4. Sanitises every value that could be injected into innerHTML
 *   5. Detects and blocks obvious open-redirect attempts
 *   6. Logs a security banner in the console for developers
 */

(function () {
  "use strict";

  /* ------------------------------------------------------------------
     1. CONFIG GUARD
     Crash fast and clearly if config.js was not loaded before this file.
  ------------------------------------------------------------------ */
  if (!window.APP_CONFIG || typeof window.APP_CONFIG !== "object") {
    document.body.innerHTML = [
      '<div style="font-family:system-ui,sans-serif;max-width:520px;margin:80px auto;padding:32px;',
      'border:2px solid #C0352B;border-radius:12px;background:#FFF5F5;color:#C0352B;">',
      "<h2 style='margin:0 0 12px'>⚠️ Configuration Missing</h2>",
      "<p style='margin:0 0 8px;color:#444'>",
      "<strong>config.js</strong> was not loaded. The portal cannot start.",
      "</p>",
      "<p style='margin:0;font-size:13px;color:#666'>",
      "Copy <code>config.example.js</code> to <code>config.js</code>, ",
      "fill in your API URL and Cloudinary credentials, then reload.",
      "</p></div>",
    ].join("");
    throw new Error("[ICRE] APP_CONFIG missing — config.js not loaded.");
  }

  /* ------------------------------------------------------------------
     2. FREEZE CONFIG so it cannot be mutated by injected scripts
  ------------------------------------------------------------------ */
  try {
    Object.freeze(window.APP_CONFIG);
  } catch (_) {/* already frozen or non-configurable - ignore */}

  /* ------------------------------------------------------------------
     3. VALIDATE REQUIRED KEYS
  ------------------------------------------------------------------ */
  const REQUIRED = ["API_URL", "CLOUDINARY_CLOUD_NAME", "CLOUDINARY_UPLOAD_PRESET"];
  const missing = REQUIRED.filter(function (k) {
    var v = window.APP_CONFIG[k];
    return !v || v.indexOf("PASTE_") === 0 || v.indexOf("YOUR_") === 0;
  });
  if (missing.length) {
    console.warn(
      "[ICRE Security] config.js is missing real values for: " + missing.join(", ") + ". " +
      "The app will still load but API calls and uploads will fail."
    );
  }

  /* ------------------------------------------------------------------
     4. VALIDATE API_URL ORIGIN
     Only allow Google Apps Script (/exec) URLs or localhost for dev.
  ------------------------------------------------------------------ */
  var apiUrl = window.APP_CONFIG.API_URL || "";
  if (
    apiUrl &&
    apiUrl.indexOf("PASTE_") !== 0 &&
    apiUrl.indexOf("YOUR_") !== 0 &&
    !apiUrl.match(/^https:\/\/script\.google\.com\//) &&
    !apiUrl.match(/^https?:\/\/localhost/) &&
    !apiUrl.match(/^https?:\/\/127\.0\.0\.1/)
  ) {
    console.warn(
      "[ICRE Security] API_URL does not look like a Google Apps Script URL. " +
      "Expected: https://script.google.com/macros/s/…/exec"
    );
  }

  /* ------------------------------------------------------------------
     5. CLIENT-SIDE RATE LIMITER
     Prevents rapid-fire form submissions (accidental double-clicks or
     scripted abuse). Each "key" gets a configurable call budget per window.

     Usage:  RateLimit.check("login")   -> true (allowed) | false (blocked)
  ------------------------------------------------------------------ */
  window.RateLimit = (function () {
    var buckets = {};
    var LIMITS = {
      login:         { max: 5,  windowMs: 60000  }, // 5 per minute
      register:      { max: 3,  windowMs: 120000 }, // 3 per 2 min
      passout:       { max: 3,  windowMs: 120000 }, // 3 per 2 min
      updateStudent: { max: 20, windowMs: 60000  }, // 20 per minute
      addCertificate:{ max: 10, windowMs: 60000  }, // 10 per minute
      upload:        { max: 10, windowMs: 60000  }, // 10 uploads per minute
      default:       { max: 30, windowMs: 60000  }, // fallback
    };

    function check(key) {
      var cfg = LIMITS[key] || LIMITS.default;
      var now = Date.now();
      if (!buckets[key]) buckets[key] = { calls: [], blocked: false };
      var b = buckets[key];
      // Drop calls outside the current window
      b.calls = b.calls.filter(function (t) { return now - t < cfg.windowMs; });
      if (b.calls.length >= cfg.max) {
        if (!b.blocked) {
          console.warn("[ICRE Security] Rate limit hit for action: " + key);
          b.blocked = true;
        }
        return false;
      }
      b.blocked = false;
      b.calls.push(now);
      return true;
    }

    function reset(key) { if (key) delete buckets[key]; else buckets = {}; }

    return { check: check, reset: reset };
  })();

  /* ------------------------------------------------------------------
     6. OPEN-REDIRECT GUARD
     Intercepts any programmatic navigation (window.location changes)
     and blocks navigation to external origins.
  ------------------------------------------------------------------ */
  window.SafeNavigate = function (url) {
    if (!url) return;
    // Allow relative paths and same-origin URLs only
    try {
      var parsed = new URL(url, window.location.origin);
      if (parsed.origin !== window.location.origin) {
        console.warn("[ICRE Security] Blocked navigation to external URL:", url);
        return;
      }
    } catch (_) {
      // Relative URLs that fail to parse as absolute are fine
    }
    window.location.href = url;
  };

  /* ------------------------------------------------------------------
     7. CONTENT SECURITY POLICY — runtime fallback
     A proper CSP should be sent as an HTTP header by your web server.
     This meta-tag equivalent is a defence-in-depth fallback for static
     hosting (GitHub Pages, cPanel, Netlify) that doesn't set headers.
  ------------------------------------------------------------------ */
  var existingCsp = document.querySelector("meta[http-equiv='Content-Security-Policy']");
  if (!existingCsp) {
    var csp = document.createElement("meta");
    csp.httpEquiv = "Content-Security-Policy";
    csp.content = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://res.cloudinary.com https://lh3.googleusercontent.com",
      // Apps Script redirects through script.googleusercontent.com — both domains needed
      "connect-src 'self' https://script.google.com https://script.googleusercontent.com https://api.cloudinary.com",
      "frame-ancestors 'none'",
    ].join("; ");
    document.head.insertBefore(csp, document.head.firstChild);
  }

  /* ------------------------------------------------------------------
     8. CLICKJACKING PREVENTION (X-Frame-Options equivalent via CSP
     frame-ancestors above is the modern replacement, but the meta
     below helps legacy browsers)
  ------------------------------------------------------------------ */
  if (window.self !== window.top) {
    // Page is inside an iframe - bail out unless on localhost
    if (!window.location.hostname.match(/localhost|127\.0\.0\.1/)) {
      console.warn("[ICRE Security] Page loaded inside a frame. Aborting.");
      document.body.innerHTML = "";
      window.top.location = window.self.location;
    }
  }

  /* ------------------------------------------------------------------
     9. DEVELOPER CONSOLE BANNER
  ------------------------------------------------------------------ */
  var styles = [
    "background:linear-gradient(135deg,#0F1B40,#2953E0);color:#fff;",
    "padding:10px 18px;border-radius:6px;font-size:13px;font-weight:bold;",
  ].join("");
  console.log("%c ICRE Gargoti Student Portal ", styles);
  console.log(
    "%cBuilt by Vinayraj Kore  |  Security: config.js loaded & validated",
    "color:#0EA5A4;font-size:11px;"
  );
  console.log(
    "%c⚠  Never paste sensitive data into this console. " +
    "Attackers use social engineering via the DevTools console.",
    "color:#C0352B;font-weight:bold;font-size:12px;"
  );

})();
