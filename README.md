# 🚗 YE CHALEGI — Premium Indian Car Marketplace

> A full-stack used car marketplace built with React (TanStack Start), Express, MongoDB and JWT auth.

---

## 🖥️ Tech Stack

| Layer | Tech |
|:---|:---|
| Frontend | React 19, TanStack Router/Start, Tailwind CSS v4, Framer Motion |
| Backend | Node.js, Express, MongoDB (Mongoose) |
| Auth | JWT (Express middleware) |
| State | Zustand (persisted) |
| Data fetching | TanStack Query |

---

## ⚡ Quick Start (1 command)

### Prerequisites

- Node.js 18+ ([nvm](https://github.com/nvm-sh/nvm) recommended)
- MongoDB running locally → `mongod --dbpath ~/data/db`
- OR a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster

### Install & Run

```bash
# 1. Clone the repo
git clone https://github.com/Utkarshsharma2005/YE-CHALEGI---car-marketplace.git
cd YE-CHALEGI---car-marketplace

# 2. Install dependencies for both client and server
cd server && npm install && cd ..
cd client && npm install && cd ..

# 3. Start everything with one command (auto-creates .env files too)
bash start.sh
```

That's it — open **http://localhost:5173** in your browser.

---

## 🔧 Manual Setup (if you prefer separate terminals)

### Terminal 1 — Backend

```bash
cd server
cp .env.example .env        # then edit .env with your values
npm install
npm run dev
# → Server running on http://localhost:5000
```

### Terminal 2 — Frontend

```bash
cd client
cp .env.example .env        # edit if your backend is on a different port
npm install
npm run dev
# → Frontend on http://localhost:5173
```

### If you get "Port already in use"

```bash
fuser -k 5173/tcp 5000/tcp
```

Then re-run the servers.

---

## 🔑 Environment Variables

### `server/.env`

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/used_cars_marketplace
JWT_SECRET=your_super_secret_jwt_key_here
CLIENT_URL=http://localhost:5173,http://localhost:5174
```

### `client/.env`

```env
VITE_API_URL=http://localhost:5000
```

---

## 🔐 Authentication (JWT)

The app uses self-contained **JWT** authentication via the Express backend. No external auth service is required — everything runs locally.

- **Customers** can sign up (email + password) and log in from `/login`. Their account (and JWT session) is stored in MongoDB.
- **Admins** sign in from `/login → Admin Portal` with the seeded admin credentials. Admin token is required to create/edit/delete car listings.
- The JWT is used on the API via `Authorization: Bearer <token>` (see `server/middleware/auth.js`).
- Frontend stores the token in `localStorage` (Zustand persist) and restores it on app load via `/api/auth/me`.

**To create an admin account**, seed the database first:

```bash
cd server && node seed.js
```

Default admin: `admin@yechalegi.com` / `admin123`

---

## 👤 Admin Access

Admin login is separate from the customer login.

- Go to `/login` → click **"Admin Sign In"**
- Use credentials: `admin@yechalegi.com` / `admin123` (set these in your DB via seed script)

To seed the database:

```bash
cd server && node seed.js
```

---

## 📁 Project Structure

```
new project-01/
├── start.sh              ← One-command startup script
├── client/               ← React frontend (TanStack Start)
│   ├── src/
│   │   ├── routes/       ← Pages (login, search, admin, dashboard…)
│   │   ├── components/   ← UI components
│   │   ├── lib/          ← API helpers, utils
│   │   └── store/        ← Zustand state stores
│   └── .env.example
└── server/               ← Express REST API
    ├── routes/           ← auth, cars, inquiries
    ├── models/           ← Mongoose schemas
    ├── middleware/        ← JWT auth middleware
    └── .env.example
```
