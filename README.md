# Love n' Grill — Full Project

## Folder Structure

```
lovengrill/
├── index.html                   ← Vite entry point (root)
├── vite.config.js               ← Vite + React config
├── package.json                 ← Dependencies
├── netlify.toml                 ← Netlify build + redirect rules
├── .gitignore
│
├── lovengrill-cms.html          ← Standalone offline CMS (no backend needed)
│
├── public/
│   ├── uploads/                 ← CMS-uploaded images land here
│   └── admin/
│       ├── index.html           ← Decap CMS entry point  →  /admin/
│       └── config.yml           ← Decap CMS collection config
│
└── src/
    ├── main.jsx                 ← React app entry
    ├── components/
    │   └── LoveNGrill.jsx       ← Main React app component
    └── data/
        ├── menu.json            ← Menu data  (edited via CMS)
        ├── about.json           ← About / contact info
        └── hours.json           ← Opening hours schedule
```

---

## Quick Start (local dev)

```bash
npm install
npm run dev
```

App runs at **http://localhost:3000**

---

## Option A — Standalone CMS (no backend, offline)

Open `lovengrill-cms.html` directly in any browser.

- Edit menu items, prices, descriptions, hours, contact info
- Click **Save Changes** → downloads updated JSON files
- Drop them into `src/data/` and commit

---

## Option B — Decap CMS on Netlify (recommended for production)

### 1. Push to GitHub / GitLab
Make sure the entire project folder is in a Git repo.

### 2. Connect to Netlify
Import the repo in Netlify. Build settings are auto-detected from `netlify.toml`:
- **Build command:** `npm run build`
- **Publish directory:** `dist`

### 3. Enable Netlify Identity
Netlify dashboard → **Identity** → **Enable**.  
Then: **Settings → Identity → Git Gateway** → **Enable**.

### 4. Invite yourself as a CMS user
In the Identity tab, click **Invite users** and enter your email.
Accept the invite — this creates your CMS login.

### 5. Access the CMS
Visit `https://your-site.netlify.app/admin/`

---

## How CMS edits flow back to your site

1. Editor logs into `/admin/` and makes changes
2. Decap CMS commits the updated JSON files to your Git repo
3. Netlify detects the push and rebuilds automatically
4. Live site reflects the changes within ~1 minute

---

## Data file reference

### `src/data/menu.json`
| Field | Type | Notes |
|-------|------|-------|
| `name` | string | Display name |
| `desc` | string | Description |
| `tag` | string | Badge text (e.g. "Best Seller") |
| `price` | number | Single price (omit if using variants) |
| `pricePrefix` | string | "Starting" / "From" shown before price |
| `variants` | array | `[{ label, price }]` for sized items like pizza |
| `popular` | boolean | Shows 🔥 badge |
| `spicy` | boolean | Shows 🌶 badge |
| `image` | string | URL or base64 image |

### `src/data/about.json`
Location, description, phone, WhatsApp, email, hours summary, social links.

### `src/data/hours.json`
`schedule` array of `{ days, opens, closes }` + optional `notice` string.

---

## Loading CMS data in your React component

```js
import menuData  from '../data/menu.json';
import aboutData from '../data/about.json';
import hoursData from '../data/hours.json';

// Convert categories array → object map the app expects:
const MENU = Object.fromEntries(
  menuData.categories.map(cat => [
    cat.name,
    { icon: cat.icon, items: cat.items }
  ])
);
```
