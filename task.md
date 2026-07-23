# Used Cars Marketplace — 3-Day Sprint Plan
### "The Motor Gazette" — Vintage Classifieds × Modern Dealer Site

You're compressing a 30-day plan into 3 days. That only works if you stop treating this as "build 30 days of features" and start treating it as "build the smallest version of every milestone, in order, with zero rework." This plan does that — and gives you a visual identity strong enough that it doesn't look like every other MERN CRUD project a reviewer will see this month.

---

## 1. The Design System (read this before Day 1)

**The problem with the obvious version:** cream background, serif hero, rounded cards, terracotta accent — every AI-assisted portfolio project defaults here. It signals "generated," not "built."

**The concept:** every car listing is a **classified auction lot ticket**, not a SaaS card. The site is a living newspaper — masthead with a real date, hairline-rule broadsheet grid, typewriter-style spec sheets — but the *interactions* (hover reveals, add-car "printing" animation, admin dashboard) are unmistakably modern. Vintage at rest, modern in motion.

### Color tokens
| Role | Hex | Use |
|---|---|---|
| Ink | `#1C1A16` | text, rules, masthead |
| Aged paper | `#EFE9DA` | base background |
| Paper (card) | `#F7F3E8` | lot ticket background |
| Rust stamp | `#9C3B2E` | "SOLD" stamp, masthead rule, urgent tags only — never decorative |
| Brass | `#A6813E` | price tags, active nav state |
| Ledger green | `#3C4A3A` | "Available" ribbon, success states |

### Type tokens
- **Display / masthead:** `Old Standard TT` or `Libre Caslon Text` — used only for the nameplate and page titles, never body copy.
- **Body / listings copy:** `Source Serif 4` — readable, warm, not the same serif as the display face.
- **Data / specs (the bridge between eras):** `Courier Prime` — used for price, year, km driven, VIN-style ID. This is the signature detail: specs look like they came off a typewriter/ledger, not a UI kit.

### Layout concept
```
┌─────────────────────────────────────────┐
│   THE MOTOR GAZETTE   —  Tue, 14 Jul     │  ← masthead, live date
│   Est. today · Used Car Classifieds      │
├───────────┬───────────┬───────────┬──────┤
│  LOT 001  │  LOT 002  │  LOT 003  │ ...  │  ← hairline-ruled grid
│  [photo]  │  [photo]  │  [photo]  │      │
│  Model    │  Model    │  Model    │      │
│  ₹ price  │  ₹ price  │  SOLD     │      │
│  (mono)   │  (mono)   │  (stamp)  │      │
└───────────┴───────────┴───────────┴──────┘
```
Hover on a lot ticket → flips/reveals a mono-font spec sheet (year, fuel, transmission, km). Admin "Add Car" success → the new lot ticket animates in like it's being freshly printed (quick ink-fade + slight type-in), not a generic toast.

**Signature element to protect:** the LOT ticket + typewriter spec reveal. Everything else (buttons, forms, admin tables) stays quiet and disciplined so that element stands out. Don't decorate the admin panel with the same vintage treatment — admin panel should be clean/utilitarian (it's a tool, not the showroom).

---

## 2. Stack (unchanged from the PDF, no detours)
React + Vite, Tailwind CSS, Framer Motion (for the two signature animations only), Express + Node, MongoDB Atlas, Mongoose, Axios, Multer or Cloudinary for images, deploy: Render (API) + Vercel (frontend).

---

## 3. The 3-Day Schedule

Each day below is written as a **direct prompt block** — paste it into Claude Code as-is, in order. Don't skip ahead; each day's prompt assumes the previous day's deliverable exists.

---

### 🗓️ DAY 1 — Backend + Data Layer + Design Foundation
**Goal by end of day:** working REST API with real DB, and a frontend shell with the full design system in place (fonts, colors, components) rendering static/dummy data styled correctly. No wiring between them yet.

**Prompt block for Claude Code:**
```
Set up a MERN project called "used-cars-marketplace" with two folders:
/server (Express + MongoDB) and /client (React + Vite + Tailwind).

BACKEND:
1. Express server with cors, dotenv, morgan.
2. Connect to MongoDB via Mongoose (use process.env.MONGO_URI, create a
   .env.example with a placeholder).
3. Car model with fields: company, model, price, year, fuelType,
   transmission, kmDriven, imageUrl, description, status (enum:
   "available" | "sold", default "available"), lotNumber (auto-increment
   integer), createdAt.
4. Routes: GET /api/cars, GET /api/cars/:id, POST /api/cars,
   PUT /api/cars/:id, DELETE /api/cars/:id. Wrap in try/catch with proper
   status codes and JSON error messages.
5. A seed script (server/seed.js) that inserts 12 realistic used-car
   listings (mix of brands/prices/years/status, some "sold") for demo
   purposes, runnable via `npm run seed`.
6. Basic input validation (required fields, price/year must be numbers).

FRONTEND DESIGN SYSTEM:
1. Tailwind config with custom colors: ink #1C1A16, paper #EFE9DA,
   paperCard #F7F3E8, rust #9C3B2E, brass #A6813E, ledger #3C4A3A.
2. Import Google Fonts: "Libre Caslon Text" (display), "Source Serif 4"
   (body), "Courier Prime" (mono/specs). Configure as Tailwind font
   families: font-display, font-body, font-mono-spec.
3. Build a Masthead component: shows "THE MOTOR GAZETTE" in font-display,
   a live current date (formatted like a newspaper dateline, e.g. "Tue,
   14 Jul 2026"), and a thin rust-colored double rule underneath.
4. Build a LotTicket component (the car card): paperCard background,
   1px ink hairline border, photo on top, model name in font-body bold,
   price in font-mono-spec styled like a price tag, a lotNumber shown as
   "LOT 0XX" in small caps top-left. If status is "sold", overlay a
   rotated rust-colored "SOLD" rubber-stamp text using a slight
   text-shadow/opacity to look stamped, not printed clean.
5. Build the customer pages using DUMMY data for now (array of ~8 fake
   cars in a local JSON file): Home, Cars listing (grid of LotTickets in
   a broadsheet-style CSS grid with hairline dividers between
   columns/rows), Car Details, About, Contact. Use React Router.
6. Build a Navbar styled like a newspaper section header (small caps,
   letter-spaced links, thin ink underline on active link) and a Footer
   with a "classifieds index" feel.
7. Make everything responsive (stack to single column on mobile, masthead
   date can shrink).

Do NOT connect frontend to backend yet — that's tomorrow. Confirm both
`npm run dev` (client) and `npm run dev` (server, with nodemon) work
`independently.`
```

**End of Day 1 checklist:**
- [ ] `GET/POST/PUT/DELETE /api/cars` all tested in Postman/Thunder Client
- [ ] Seed script populates MongoDB Atlas with 12 cars
- [ ] Frontend renders Home/Cars/Details/About/Contact with dummy data, fonts and colors matching the token system exactly
- [ ] LotTicket hover state and SOLD stamp visually confirmed

---

### 🗓️ DAY 2 — Wire It Up + Admin Panel + Signature Interactions
**Goal by end of day:** frontend and backend fully connected, admin panel does real CRUD, both signature animations (hover spec-reveal, "printing" add-car) are working.

**Prompt block for Claude Code:**
```
Connect the existing React frontend to the existing Express backend using
Axios (create a single src/api/cars.js with getCars, getCarById,
createCar, updateCar, deleteCar).

CUSTOMER SIDE:
1. Replace all dummy data on Home and Cars pages with live data from
   GET /api/cars. Add loading and empty states styled in the newspaper
   voice (e.g. empty results: "No lots found in today's edition.").
2. Car Details page fetches by :id from the real API.
3. Add search by company and model (client-side filter is fine for now)
   on the Cars page, styled as a classifieds "search the archive" input.
4. Signature interaction #1: on hover/tap of a LotTicket, flip or reveal
   (Framer Motion) a spec-sheet face showing year, fuel type,
   transmission, km driven — all in font-mono-spec, laid out like a
   typed ledger line ("YR 2019 · PETROL · MANUAL · 42,300 KM").

ADMIN PANEL (keep this visually clean/utilitarian, NOT vintage-styled —
it's a tool, contrast intentionally with the showroom):
1. Routes: /admin (dashboard), /admin/add, /admin/cars (table view),
   /admin/edit/:id.
2. Dashboard: total cars count, count available vs sold, most recently
   added car — small stat cards, plain modern style.
3. Add Car form: all Car model fields, client + server validation,
   image via URL input (skip file upload infra to save time — use
   imageUrl string).
4. On successful add, navigate to /admin/cars AND trigger signature
   interaction #2 on the customer-facing grid: the new LotTicket should
   animate in with a quick "freshly printed" effect (brief ink-fade from
   0 opacity + 2-3px upward slide, ~400ms, Framer Motion) the next time
   the Cars page loads or via a toast link "View in today's edition →".
5. View All Cars: plain data table (not LotTicket style), with Edit and
   Delete actions. Delete requires a confirm dialog.
6. Edit Car: pre-filled form, PUT to update.
7. Toggle status available/sold directly from the table (quick action,
   not just via full edit form).

Test the full loop: add a car in admin → confirm it appears on customer
Home/Cars pages with correct lot number and stamp/status styling → edit
it → confirm changes reflect → delete it → confirm it's gone.
```

**End of Day 2 checklist:**
- [ ] Admin Add/Edit/Delete all confirmed working against live DB
- [ ] Customer pages show live data, search works
- [ ] Hover spec-reveal animation confirmed on at least 3 browsers/devices
- [ ] Add-car "printing" animation visually confirmed
- [ ] No console errors, no broken image states (add a placeholder image fallback)

---

### 🗓️ DAY 3 — Polish, Deploy, Presentation
**Goal by end of day:** deployed, stable, demo-ready, with a presentation script.

**Prompt block for Claude Code:**
```
Final polish and deployment pass on the used-cars-marketplace project.

POLISH:
1. Full responsive audit: test 375px, 768px, 1440px widths for every
   page including admin. Fix any overflow/wrapping issues in the
   LotTicket grid and masthead.
2. Add a 404 page in the newspaper voice ("This edition has no such
   page.").
3. Add basic loading skeletons (styled as blank/greyed lot tickets, not
   generic spinners) for the Cars grid while fetching.
4. Add image fallback (a placeholder "photo unavailable" lot-ticket
   graphic) if imageUrl fails to load.
5. Run a full Lighthouse pass, fix any obvious accessibility issues
   (alt text on all images, focus states visible on interactive
   elements, color contrast check on the rust/brass accents against
   paper background).
6. Write a README.md: project overview, tech stack, setup instructions,
   screenshots, live links (placeholders until deployed), and a short
   "design rationale" paragraph explaining the Motor Gazette concept.

DEPLOYMENT:
1. Prepare server for deployment: confirm PORT uses process.env.PORT,
   MONGO_URI from env, CORS configured for the Vercel frontend domain.
2. Deploy /server to Render (web service, build command, start command,
   env vars documented in README).
3. Deploy /client to Vercel, with VITE_API_URL env var pointing to the
   live Render API.
4. Do a full live smoke test: load live frontend, confirm cars load
   from live backend, do one add/edit/delete cycle against the live
   admin panel, confirm it reflects live on the customer site.
5. Fix any CORS/env issues that appear only in production.

Give me a final list of: live frontend URL, live backend URL, any
manual steps I still need to do (e.g. setting env vars in Render/Vercel
dashboards), and any known issues.
```

**Then, offline (not for Claude Code — for you):**
1. **Record a 90-second demo script** covering exactly the 5 things the evaluation rubric asks for: Customer Website → Admin Panel → Database (show Atlas collection) → APIs (quick Postman hit) → Architecture (one sentence: "React/Vite frontend, Express/MongoDB backend, deployed separately on Vercel and Render, connected via REST API").
2. **One sentence of design rationale, memorized, not read:** *"Used car listings are essentially classified ads — I built the whole site around that idea instead of a generic template, so browsing cars feels like reading a newspaper's auto section, while the admin experience underneath is fully modern."* This is the line that makes you memorable in a room full of identical CRUD demos.
3. Prepare 2 backup talking points in case something breaks live: what you'd fix, and why you made the imageUrl-over-file-upload tradeoff (time-boxing decisions, not laziness).

**End of Day 3 checklist:**
- [ ] Live frontend + backend URLs working end-to-end
- [ ] README complete with screenshots
- [ ] Demo script rehearsed once out loud
- [ ] GitHub repo public, clean commit history (at least one commit per major milestone, not one giant commit)

---

## 4. Scope guardrails (what to explicitly cut if you fall behind)
If Day 2 runs long, cut in this order — don't touch the design system, that's your differentiator:
1. Skip client-side search polish (basic filter is enough)
2. Skip dashboard "most recently added" stat, keep just totals
3. Skip the add-car printing animation on the *customer* grid, keep it only as an admin-side success state

Never cut: the LotTicket component, the masthead, the SOLD stamp, or the mono-font spec reveal — those are what a reviewer will remember.
