/**
 * ICRE Gargoti - Student Portal & Admin Panel
 * ============================================
 * CONFIG TEMPLATE  (safe to commit - contains NO real secrets)
 *
 * HOW TO USE:
 *   cp config.example.js config.js
 *   Then fill in your real values in config.js
 *   config.js is gitignored and must never be committed.
 */

window.APP_CONFIG = {

  // Google Apps Script Web App URL (ends with /exec)
  // Deploy Code.gs: Execute as "Me", Access "Anyone"
  API_URL: "PASTE_YOUR_APPS_SCRIPT_EXEC_URL_HERE",

  // Cloudinary unsigned upload preset
  // Create at: cloudinary.com > Settings > Upload > Upload presets
  // Set mode to "Unsigned" - NO secret key needed
  CLOUDINARY_CLOUD_NAME:    "YOUR_CLOUDINARY_CLOUD_NAME",
  CLOUDINARY_UPLOAD_PRESET: "YOUR_UNSIGNED_UPLOAD_PRESET",

  // Companion file paths (change only if you rename the files)
  LOGO:               "logo.png",
  ADMIN_URL:          "admin.html",
  STUDENT_PORTAL_URL: "index.html",

  // PORTAL TOKEN - shared secret sent with every API request.
  // Generate a long random string (e.g. 64 hex chars).
  // Set the SAME value as a Script Property in Apps Script:
  //   Project Settings > Script Properties > PORTAL_TOKEN = <your value>
  // Code.gs then rejects any request that does not include this token.
  PORTAL_TOKEN: "GENERATE_A_LONG_RANDOM_SECRET_HERE",


  // Department labels used in the UI
  DEPT_NAME:    "Computer Engineering",
  COLLEGE_NAME: "Institute of Civil and Rural Engineering",
  COLLEGE_CITY: "Gargoti",
};

