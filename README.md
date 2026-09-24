# Madhuli Namkeen & Sweets 🍬

A complete, production-ready e-commerce site for **Madhuli Namkeen & Sweets** — a
woman-owned mithai & namkeen shop at Ishwar Icon, Nikol, Ahmedabad. Customers browse
the menu, place orders (delivery or pickup), and track them live; the owner manages
products, prices, stock, orders and shop settings from a full admin panel.

> “કેમ છે મારા વાલા” — first-time visitors get a haveli door-opening animation with a
> golden particle burst. (There is a 🚪 in the footer to replay it.)

---

## Features

### Customer storefront
| Page | What it does |
|---|---|
| `/` | 3D rotating thali hero (procedural Three.js primitives, mouse parallax), trust badges, 4 category tilt-cards, bestseller carousel, about teaser, Google Map + click-to-call + live hours, announcement banner |
| `/menu` | Search (English **and** Gujarati, case-insensitive), category chips, sort (popular / price / name), quantity selector, load-more, branded empty state “તમારી થાળી ખાલી છે!” |
| `/cart` | Desktop slide-in drawer / mobile full page; persists in `localStorage` across refreshes; free delivery above ₹500 (else ₹30) |
| `/checkout` | 3 steps: details → summary + payment (COD / UPI `9924122746@upi`) → confirm. All input Zod-validated; prices recomputed **server-side** |
| `/order/[id]` | Public tracking by order id, status timeline, 30 s auto-poll, WhatsApp deep-link with the full order message |
| `/about` | Story — woman-owned, pure peanut oil, three recipes from nani's kitchen |
| `/contact` | Contact form (Resend email), 3 phone numbers, map, hours |

- Order id format: `MAD-YYYY-XXXX`
- On order placement a pre-filled WhatsApp message is generated at
  `wa.me/919924122746` with items, totals and address
- EN / ગુજ i18n toggle (JSON dictionaries), persisted
- Mobile app-like bottom nav (Home / Menu / Cart / Orders)
- Responsive at 375 / 768 / 1024 / 1440

### Admin panel (`/admin`)
| Page | What it does |
|---|---|
| `/admin/login` | Auth.js v5 credentials (admin only) |
| `/admin/dashboard` | Today's stats, pending orders with confirm/cancel, recent orders, live activity feed |
| `/admin/menu` | **Inline click-to-edit price** (click → type → Enter saves, Escape reverts — the #1 feature), one-click stock toggle that reflects on the storefront instantly, add/edit modal with drag-and-drop image upload (Cloudinary), delete confirm, bulk out-of-stock |
| `/admin/orders` | Date filters (today / yesterday / week / custom) in IST, status filter, debounced search, one-tap status quick actions, detail modal with print, call and WhatsApp, full status history |
| `/admin/settings` | Shop info + phone numbers, delivery numbers, per-day opening hours, open/closed toggle, category CRUD + reorder, announcement banner, change password |

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript, `output` ready for Vercel |
| Styling | Tailwind CSS v4 (`@theme` tokens — white + warm yellow palette, no dark mode) |
| Motion | Framer Motion, GSAP + Lenis scroll, R3F + drei hero (procedural primitives only, no GLTF) |
| State | Zustand cart persisted to `localStorage` |
| DB | MongoDB + Prisma (schema in `prisma/schema.prisma`, seed in `prisma/seed.ts`) |
| Auth | Auth.js v5, Credentials provider, JWT sessions, bcryptjs password hashes |
| Validation | Zod on every API input |
| Uploads | Cloudinary (signed, drag-and-drop) |
| Email | Resend (order notifications + contact form) |
| Icons / misc | Lucide, date-fns, React Hot Toast |

---

## Getting started

### 1. Prerequisites
- Node 20+
- A MongoDB replica set (local `mongod --replSet rs0` **or** a free MongoDB Atlas M0)

> Prisma requires a replica set for transactions (seed + order status updates).

### 2. Install
```bash
npm install
```

### 3. Environment
Copy `.env.example` to `.env` (and `.env.local`) and fill in:

| Variable | Notes |
|---|---|
| `DATABASE_URL` | `mongodb://user:pass@host:27017/madhuli?w=majority` (Atlas or local). Do **not** include `wtimeout` |
| `AUTH_SECRET` | Any long random string (`openssl rand -base64 32`) |
| `SHOP_WHATSAPP_NUMBER` | `919924122746` |
| `SHOP_FROM_EMAIL` | (optional) Resend from-address for order emails |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Image uploads; without them the product cards fall back to warm gradient + emoji |
| `RESEND_API_KEY` | Contact form + order emails; without it the endpoints still succeed and log to console |
| `NEXT_PUBLIC_APP_URL` | e.g. `http://localhost:3000` or your Vercel URL |

### 4. Database
```bash
npx prisma db push     # create collections
npx prisma db seed      # 4 categories, 40 products, admin, settings, testimonials
```

### 5. Run
```bash
npm run dev      # development
npm run build && npm start   # production
```

### 6. Admin login
| | |
|---|---|
| URL | `http://localhost:3000/admin/login` |
| Username | `madhuli` |
| Password | `madhuli2025` (change it immediately in `/admin/settings`) |

---

## API overview

All inputs are Zod-validated. Admin routes require the session cookie.

| Route | Access | Purpose |
|---|---|---|
| `GET /api/products?search&category&bestseller&available&sort&limit&offset` | public | Menu (search is case-insensitive, matches EN + Gujarati) |
| `POST /api/products` · `PATCH/DELETE /api/products/[id]` | admin | Product CRUD |
| `PATCH /api/products/[id]/price` | admin | Inline price update |
| `PATCH /api/products/[id]/stock` | admin | Instant stock toggle |
| `GET/POST /api/categories` · `PUT/DELETE /api/categories/[id]` | GET public | Category CRUD + reorder |
| `GET /api/settings` | public | Announcement, hours, delivery rules |
| `PUT /api/settings` | admin | Shop settings (partial) |
| `GET /api/orders?date&status&search` | admin | Order list, IST date filters |
| `POST /api/orders` | public | Place order (server-side price recompute, OOS + min-order checks) |
| `GET /api/orders/[id]` | public by `MAD-…` id | Order tracking |
| `PATCH /api/orders/[id]/status` | admin | Status changes (appends to history) |
| `GET /api/testimonials` | public | About-page stories |
| `POST /api/contact` | public | Contact form → Resend |
| `POST /api/upload` | admin | Cloudinary upload |
| `GET /api/admin/activity` | admin | Activity feed |
| `POST /api/admin/password` | admin | Change password |
| `/api/auth/[...nextauth]` | — | Auth.js v5 |

---

## Project structure

```
src/
├── app/
│   ├── (storefront)/        # /, /menu, /cart, /checkout, /order/[id], /about, /contact, /my-orders
│   ├── admin/               # login, dashboard, menu, orders, settings
│   └── api/                 # route handlers above
├── components/              # Header, Footer, HeroScene (R3F), DoorAnimation, CartDrawer…
│   ├── home/  ProductCard.tsx  TrustBadges.tsx  ui/ …
│   └── admin/               # AdminShell, PriceEditor, StockToggle, ProductForm, OrderDetail
├── lib/                     # prisma, auth, validation (Zod), emails, activity, utils, mongo
├── i18n/                    # EN + GU dictionaries, useT() hook
├── store/                   # Zustand cart (persisted)
├── types/                   # shared domain types
└── middleware.ts            # protect /admin, i18n cookie
prisma/
├── schema.prisma            # Product, Category, Order, Admin, Settings, Testimonial, Activity
└── seed.ts
```

---

## Deployment (Vercel + Atlas, all free tier)

1. Push to GitHub, import the repo in Vercel (framework preset: Next.js).
2. Create a free **MongoDB Atlas M0** cluster, a user, and a network allow-list entry for `0.0.0.0/0`.
3. Set the environment variables above (Atlas `DATABASE_URL`, a fresh `AUTH_SECRET`, etc.).
4. Run `npx prisma db push && npx prisma db seed` once with `DATABASE_URL` pointed at Atlas
   (e.g. from the Vercel CLI or a temporary local `.env`).
5. Deploy. `AUTH_SECRET` and `trustHost: true` are already set for proxied hosts.

## Design rules (enforced)

White + warm yellow palette only (`--gold #FACC15`, `--jalebi #EA580C`, creams and
cocoa inks). No dark mode, no purple/blue/pink, no glassmorphism, no generic
spinners (branded jalebi spinner 🍥), no fake stats, real Gujarati copy throughout,
asymmetric editorial layouts. Product images fall back to warm gradient + emoji when
absent.

## Local test database

In this workspace the site runs against a local MongoDB 8.0 replica set
(`rs0`, `127.0.0.1:27017`, db `madhuli`) seeded with 4 categories, 40 products,
the admin user, default settings and 3 testimonials.
