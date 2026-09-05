# Jewellery Catalog

A product catalog manager for an imitation jewellery business — an admin panel to
manage products/categories, and a public, mobile-friendly catalog customers can
browse and share on WhatsApp. Built with Next.js (App Router) and a local
SQLite database, so it runs with a single `npm run dev` and needs no external
services.

## Features

- **Admin panel** (password-protected): add/edit/delete products with multiple
  photos, auto-generated product codes (`JWL-0001`, ...), price, category,
  description, stock status; manage categories; upload your logo; set business
  name, website, and WhatsApp number.
- **Customer catalog** (public, no login): browse by category, search by name
  or code, responsive product grid, full product detail pages with an image
  gallery.
- **WhatsApp sharing**: share any product or the whole catalog/category via a
  `wa.me` link that works on both mobile and desktop.
- **Data persistence**: products, categories, and settings are stored in a
  local SQLite database (`data/jewellery.db`); uploaded images are stored in
  `public/uploads/`. Both are excluded from git — see **Backups** below.

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the example environment file and adjust it:

   ```bash
   cp .env.example .env.local
   ```

   - `ADMIN_PASSWORD` — the admin login password used the very first time the
     app starts (it's hashed into the database). Change it later from
     **Admin → Settings → Change Password**; editing this env var afterwards
     has no effect.
   - `SESSION_SECRET` — any long random string, used to sign the admin login
     session cookie. Generate one with `openssl rand -hex 32`.

3. Run the dev server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) for the public catalog
   and [http://localhost:3000/admin](http://localhost:3000/admin) for the
   admin panel.

On first run, the app seeds the database with the default category list
(Necklaces, Earrings, Bangles/Bracelets, Rings, Pendants, Chains, Anklets,
Mangalsutra, Nose Pins, Bridal Sets, Combo Sets, Hair Accessories) and a
default settings row you can edit from the admin panel.

## Project Structure

```
app/
  (site)/          Public catalog: home, /product/[id], /category/[slug]
  admin/            Admin panel: login, products, categories, settings
  api/              API routes used by the admin panel (auth, CRUD, uploads)
components/         Shared React components (site + admin)
lib/                Data access layer: db.js, products.js, categories.js,
                    settings.js, auth.js, upload.js, whatsapp.js
data/               SQLite database file (created on first run, gitignored)
public/uploads/     Uploaded product photos & logo (gitignored)
```

The data layer in `lib/` is intentionally thin (plain SQL via
`better-sqlite3`) so it's easy to extend — e.g. add a "New Arrival" filter,
a discount tag, or an inquiry form — without fighting an ORM.

## Customizing the Look

- Brand colors (primary/accent) can be changed from **Admin → Settings**
  without touching code.
- Fonts and base colors/spacing are defined in `app/globals.css` — swap the
  Google Fonts imports in `app/layout.js` to change the typeface.

## Backing Up / Exporting Your Products

All product and category data lives in `data/jewellery.db`, a single SQLite
file. To back it up, just copy that file somewhere safe (or set up a cron job
to copy it periodically once deployed). To export your product list as JSON
or CSV, you can open the database with any SQLite tool (e.g. `sqlite3
data/jewellery.db ".mode csv" ".output products.csv" "SELECT * FROM
products;"`) — or ask Claude Code to add an "Export Products" button to the
admin panel.

## Deploying

This app needs a Node.js server with **persistent disk storage** (not a
stateless/serverless platform like plain Vercel functions), because it writes
the SQLite database and uploaded images to disk. Good options:

- A small VPS (DigitalOcean, Hetzner, etc.) running `npm run build && npm
  start` behind a process manager like `pm2`, with a reverse proxy (nginx/
  Caddy) for HTTPS.
- Render, Railway, or Fly.io using a persistent volume mounted at the project
  root (so `data/` and `public/uploads/` survive restarts/redeploys).

Before deploying, set real values for `ADMIN_PASSWORD` and `SESSION_SECRET`
as environment variables on your host, then run:

```bash
npm run build
npm start
```

## Adding Features Later

The codebase is deliberately simple — plain Next.js route handlers and SQL
queries, no heavy abstractions — so you can ask Claude Code to extend it.
Ideas already supported by the data model:

- "New Arrival" badges — the `isNewArrival` field already exists on products;
  it just needs a way to toggle it and filter by it if you want a dedicated
  view.
- Discount tags — `discountPercent` already exists and is displayed on the
  product card/detail page when set.
- A customer inquiry form, more categories, product variants, etc.
