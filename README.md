# ICRE Gargoti — Student Portal

**Department of Computer Engineering | Institute of Civil and Rural Engineering, Gargoti**

---

## 🚀 Deployment Guide

### Files
| File | Purpose |
|---|---|
| index.html | Student-facing portal |
| dmin.html | Staff & admin panel |
| config.js | **Gitignored** — your real API URL & Cloudinary credentials |
| config.example.js | Template — safe to commit, contains no real secrets |
| security.js | Runtime security guards (CSP, rate-limiting, config validation) |
| logo.png | College logo |
| avicon.png | Browser tab icon |

---

### 1. Configure credentials

`ash
cp config.example.js config.js
`

Open config.js and fill in:

| Key | Where to get it |
|---|---|
| API_URL | Google Apps Script → Deploy → Web App → Copy /exec URL |
| CLOUDINARY_CLOUD_NAME | cloudinary.com → Dashboard |
| CLOUDINARY_UPLOAD_PRESET | cloudinary.com → Settings → Upload → Upload presets (set to **Unsigned**) |

> ⚠️ **Never commit config.js** — it is gitignored for a reason.

---

### 2. Deploy to GitHub Pages (free)

1. Push all files (except config.js) to a **private** GitHub repo
2. In repo Settings → Pages, set source to main branch / root
3. Add config.js as a **GitHub Actions secret** or upload it separately
4. Your portal is live at https://<username>.github.io/<repo-name>/

### 2b. Deploy to Netlify (free tier, recommended)

1. Connect your repo to Netlify
2. In Netlify → Site settings → Environment variables, add each APP_CONFIG key
3. Add a 
etlify.toml build step that generates config.js from env vars
4. Netlify auto-deploys on every push

### 2c. Deploy to cPanel / shared hosting

1. Upload **all files including config.js** via File Manager or FTP
2. Make sure your hosting directory is not publicly listed (add .htaccess if needed)

---

### 3. Security checklist

- [ ] config.js is NOT committed to Git (check .gitignore)
- [ ] Google Apps Script is deployed with **Execute as: Me**, **Access: Anyone**
- [ ] Cloudinary upload preset is set to **Unsigned** (not signed)
- [ ] Your hosting serves files over **HTTPS** only
- [ ] Add HTTP security headers on your server (see below)

#### Recommended HTTP headers (add to .htaccess or Netlify _headers)

`
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com; font-src https://fonts.gstatic.com; img-src 'self' data: blob: https://res.cloudinary.com; connect-src 'self' https://script.google.com https://api.cloudinary.com; frame-ancestors 'none'
`

---

### 4. Local development

Open index.html or dmin.html directly in a browser — config.js is loaded from the same folder.

> Tip: If you see the "Configuration Missing" error page, you haven't created config.js yet.

---

## Architecture

`
Browser
  |
  ├── index.html + admin.html    (static HTML + vanilla JS)
  |     loads config.js          (credentials, gitignored)
  |     loads security.js        (CSP, rate-limit, config guard)
  |
  ├── Google Apps Script /exec   (backend — Code.gs)
  |     Reads/writes Google Sheets (database)
  |
  └── Cloudinary                 (image storage — unsigned upload)
        Stores student photos, ID cards, certificates
`

---

## Built by Vinayraj Kore
