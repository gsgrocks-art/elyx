# Jewellery Catalog

A product catalog manager for an imitation jewellery business — an admin panel to
manage products/categories, and a public, mobile-friendly catalog customers can
browse and share on WhatsApp. Built with Next.js (App Router) and a local
SQLite database, so it runs with a single `npm run dev` and needs no external
services.

## Features

- **Admin panel** (multiple staff logins, each with their own username and
  password): add/edit/delete products with multiple photos, auto-generated
  product codes (`JWL-0001`, ...), price, category, description, stock
  status; manage categories; upload your logo; set business name, website,
  and WhatsApp number.
- **Customer catalog** (public, no login): browse by category, search by name
  or code, responsive product grid, full product detail pages with an image
  gallery.
- **WhatsApp sharing**: share any product or the whole catalog/category via a
  `wa.me` link that works on both mobile and desktop.
- **Cart & checkout, no payment gateway**: customers add multiple products to
  a cart, adjust quantities, and place an order with their details and
  delivery address. There is no payment page — orders are submitted directly,
  default to **Order In Process**, and the confirmation page tells the
  customer your team will contact them for payment (see **Orders & Checkout**
  below).
- **Billing / accounting report** (Admin → Billing): every product sold,
  with buying cost, selling cost, delivery charges, and profit margin,
  filterable by month or a custom date range.
- **Data persistence**: products, categories, and settings are stored in a
  local SQLite database (`data/jewellery.db` by default); uploaded images are
  stored in `uploads/` and served by a small route handler. Both are
  excluded from git and their locations can be overridden with `DATA_DIR` /
  `UPLOADS_DIR` for deployment — see **Deploying** below.

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the example environment file and adjust it:

   ```bash
   cp .env.example .env.local
   ```

   - `ADMIN_USERNAME` / `ADMIN_PASSWORD` — the first admin account, created
     the very first time the app starts (the password is hashed into the
     database). Editing these env vars afterwards has no effect — manage
     accounts from the admin panel instead (see **Staff Logins** below).
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

## Staff Logins

Every staff member gets their own username and password instead of sharing
one admin password. From **Admin → Staff**, anyone signed in can add a new
staff login or remove one — there's no separate "owner" role, so any signed-in
staff member can manage the others. A couple of guardrails keep this safe to
use day-to-day:

- You can't remove your own account while signed in (avoids locking yourself
  out by mistake).
- The last remaining account can never be removed (avoids locking everyone
  out).

Removing a staff login blocks their *next* login attempt; a session they're
already signed into stays valid until it naturally expires (7 days) since
sessions are verified by a signed cookie rather than a database lookup on
every request. That's a deliberate simplification — fine for a small shop's
staff, not meant for handling a compromised account.

## Orders & Checkout

Customers can add multiple products to a cart (stored in their browser's
`localStorage` — there's no customer login), adjust quantities on the cart
page, then check out with their name, mobile number, email, and delivery
address — all required, and the mobile number must be exactly 10 digits
(validated both in the form and again on the server). **There is no payment
step or payment gateway anywhere in this flow.** Placing an order:

1. Sends the cart to `POST /api/orders`, which re-validates every item
   against the live database — rejecting the order if a product was deleted
   or went out of stock since it was added to the cart — and **recomputes
   the price and total from the database**, ignoring whatever price the
   browser sent. This is what keeps a customer from tampering with prices
   client-side.
2. Snapshots the product name, code, image, and price onto the order at the
   moment of purchase (in `order_items`). If you change a product's price
   later, past orders keep showing the price the customer actually agreed
   to — only new orders see the new price.
3. Generates a human-readable order number (`ORD-YYYYMMDD-0001`, sequential
   per day) and creates the order with status `processing` ("Order In
   Process").
4. Opens a WhatsApp compose tab, pre-filled with the order details,
   addressed to **your own shop's WhatsApp number** (from Admin → Settings)
   — this is the "new order" notification. There's no messaging API wired
   up, so this happens on the *customer's* device and still needs them to
   tap Send; it's the closest thing to an instant notification possible
   without signing up for a paid provider.
5. Shows a confirmation page with the order number and a payment
   instructions message that pulls your WhatsApp number from **Admin →
   Settings** — never hard-coded — telling the customer your team will
   contact them for payment rather than paying online.

From **Admin → Orders**, staff see every order (customer, address, line
items, total) and can update:

- **Order Status** — `Order In Process` (the default for every new order) →
  `Order Dispatched` → `Order Delivered Successfully`, plus `Cancelled`.
  This is the customer-facing lifecycle of the order, shown as a progress
  stepper on the customer's own order confirmation page (which they can
  revisit any time at its URL to see the latest status). Selecting
  `Cancelled` doesn't save immediately — it opens a reason form first
  (**Order cancelled by customer** / **Order cancelled due to no
  inventory** / **Other**, with a required free-text description for
  "Other") and only saves once that's confirmed. The reason is
  internal-only, shown on the order detail page, and cleared automatically
  if the order is later un-cancelled.
- **Payment Status** — `pending` / `payment requested` / `payment received` /
  `payment failed` — a separate, internal-only field for tracking offline
  payment collection. It never appears to customers and doesn't unlock any
  in-app payment flow; it's just a note for staff.

Changing the Order Status shows a **"Notify Customer via WhatsApp"** button
pre-filled with a status-appropriate message (e.g. "Your order ... has been
shipped") addressed to the customer's own number — admin clicks it to open
WhatsApp and send it themselves; there's no automated messaging provider
wired up, by design (no signup or ongoing cost).

Each order also has a **Delivery Charges** field (₹0 by default), editable
from the order detail page — since checkout doesn't collect a shipping fee
upfront, admin sets it after reviewing the order; it's added to the total
shown to the customer and feeds into the Billing report below.

## Billing & Accounting

Each product has an optional **Buying Cost** field (Admin → Products →
add/edit a product) that is completely separate from its selling `price` —
it's admin-only accounting data and is never included in any public page,
API response, or customer-facing data. This is enforced at the data-access
layer (`lib/products.js`): callers only get `buyingCost` back when they
explicitly pass `{ includeCost: true }`, which only admin routes/pages do —
a public page would have to opt in to leak it, not just forget to strip it.

**Admin → Billing** is an accounting report: one row per product sold
(across all orders), showing Product Name, Code, Buying Cost, Selling Cost,
Delivery Charges, Total Selling Cost, and Profit Margin, with dates
formatted as `10-Sep-2026`. Unlike the selling price, buying cost is **not**
snapshotted per order — the report always uses the product's current buying
cost, since it's internal analytics rather than something a customer agreed
to. Filter by month (a dropdown of the last 12 months) or a custom date
range; the page shows running totals (selling cost, buying cost, delivery
charges, total, and profit margin) for whatever's filtered — that's your
monthly revenue view.

The order data model (`lib/orders.js`, `orders` + `order_items` tables in
`lib/db.js`) follows the same thin, plain-SQL style as the rest of `lib/` —
easy to extend with things like order search/filtering or CSV export later.

## Project Structure

```
app/
  (site)/          Public catalog + cart/checkout: home, /product/[id],
                    /category/[slug], /cart, /checkout, /order-confirmation/[id]
  admin/            Admin panel: login, products, categories, orders, staff, settings
  api/              API routes: auth, CRUD, uploads, and /api/orders (public)
  uploads/[...path] Route handler that serves uploaded images from disk
components/         Shared React components (site + admin), incl. CartContext
lib/                Data access layer: db.js, products.js, categories.js,
                    settings.js, admins.js, orders.js, auth.js, upload.js,
                    whatsapp.js
data/               SQLite database file (created on first run, gitignored;
                    override with DATA_DIR)
uploads/            Uploaded product photos & logo (gitignored; override
                    with UPLOADS_DIR)
```

The data layer in `lib/` is intentionally thin (plain SQL via
`better-sqlite3`) so it's easy to extend — e.g. add a "New Arrival" filter,
a discount tag, or an inquiry form — without fighting an ORM.

## Storage & Migrating to the Cloud Later

Everything is local by design right now, but behind two seams so swapping
either one out later doesn't touch the rest of the app:

- **Database** — `lib/db.js` is the only file that opens a database
  connection (a local SQLite file). Every other module
  (`products.js`, `categories.js`, `settings.js`, `admins.js`) imports the
  shared `db` handle from there and runs plain SQL. Moving to a hosted
  database (e.g. Postgres) later means changing the connection setup in
  `lib/db.js` and the query syntax in those modules — API routes and
  components never touch the database directly, so they don't change.
- **Images** — `lib/upload.js` is the only file that touches the filesystem
  for uploads. `saveUploadedFile()`/`deleteUploadedFile()` are the entire
  interface; callers only ever see the public URL string they return (stored
  in `product.images` / `settings.logoUrl`). Moving to S3, Cloudinary, or
  similar later means rewriting those two functions to call that provider's
  SDK instead of `fs`, without changing any caller.

## Customizing the Look

- Brand colors (primary/accent) can be changed from **Admin → Settings**
  without touching code.
- Fonts and base colors/spacing are defined in `app/globals.css` — swap the
  Google Fonts imports in `app/layout.js` to change the typeface.

## Backing Up / Exporting Your Products

All product and category data lives in `jewellery.db`, a single SQLite file
under `data/` (or `$DATA_DIR` if you set it when deploying). To back it up,
just copy that file somewhere safe (or set up a cron job to copy it
periodically once deployed). To export your product list as JSON or CSV, you
can open the database with any SQLite tool (e.g. `sqlite3 data/jewellery.db
".mode csv" ".output products.csv" "SELECT * FROM products;"`) — or ask
Claude Code to add an "Export Products" button to the admin panel.

## Deploying

This app needs a Node.js server with **persistent disk storage** (not a
stateless/serverless platform like plain Vercel functions), because it writes
the SQLite database and uploaded images to disk. `DATA_DIR` and
`UPLOADS_DIR` (see `.env.example`) let you point both at a single mounted
volume, which is what the steps below do.

### Option A: Railway (recommended — simplest)

1. Push this repo to GitHub if it isn't already, and merge this branch into
   your default branch.
2. At [railway.app](https://railway.app), sign in with GitHub → **New
   Project** → **Deploy from GitHub repo** → select this repo.
3. Railway auto-detects the Node app and runs `npm install`, `npm run
   build`, then `npm start` (via Nixpacks, using the scripts in
   `package.json`). `next start` automatically listens on the `PORT` env var
   Railway provides, so no config is needed there.
4. Add a **Volume**: in the service → **Variables** tab area, open the
   **Volumes** section → **New Volume** → mount path `/data` (empty,
   dedicated path — not your app's source folder).
5. Add these environment variables on the service (**Variables** tab):
   - `DATA_DIR=/data/db`
   - `UPLOADS_DIR=/data/uploads`
   - `ADMIN_USERNAME` / `ADMIN_PASSWORD` — your first admin login
   - `SESSION_SECRET` — a long random string (e.g. generate with `openssl
     rand -hex 32` locally and paste the result)
6. Deploy (Railway does this automatically on push, or click **Deploy**).
   Once it's live, Railway shows a public URL under **Settings → Networking
   → Generate Domain** — that's your shareable link, for both the catalog
   (`/`) and the admin panel (`/admin`).
7. Redeploys and restarts now keep your products, images, and logins,
   because they all live on the mounted volume instead of the container's
   throwaway filesystem.

### Option B: Render or Fly.io

Same idea, different UI:

- **Render**: New → Web Service → connect the repo → build command `npm
  install && npm run build`, start command `npm start`. Persistent disks
  require a paid instance type; add one mounted at `/data`, then set
  `DATA_DIR=/data/db`, `UPLOADS_DIR=/data/uploads`, `ADMIN_USERNAME`,
  `ADMIN_PASSWORD`, `SESSION_SECRET` as environment variables.
- **Fly.io**: `fly launch` in this directory, then `fly volumes create data
  --size 1` and mount it at `/data` in the generated `fly.toml`
  (`[mounts]` section), plus the same four environment variables via `fly
  secrets set`.

### Option C: A small VPS

Run `npm run build && npm start` behind a process manager like `pm2`, with a
reverse proxy (nginx/Caddy) for HTTPS. No volume needed — `DATA_DIR` and
`UPLOADS_DIR` can be left unset since everything already lives on the VPS's
own persistent disk; just set `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and
`SESSION_SECRET`.

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
