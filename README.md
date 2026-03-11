# Nutrition App

Full-stack nutrition tracking app with barcode scanning and macro management.

## Features

- 🍎 Track daily calorie, protein, carb, and fat intake
- 📸 Barcode scanner (Scanbot SDK) for quick food input
- 📊 Progress bars, daily history with streak tracking, and meal management
- 🔐 JWT-based authentication (username/password + Google OAuth)
- 🌐 i18n (internationalization) support
- 📱 Progressive Web App (PWA) with offline support

## Tech Stack

**Frontend (client):**

- React 19 + TypeScript
- Vite 7
- TailwindCSS 4
- i18next (for translations)
- Scanbot Web SDK (barcode scanning)
- react-select, react-circular-progressbar

**Backend (server):**

- Express.js 5
- MySQL 8 (via mysql2 connection pool)
- JWT (jsonwebtoken) + bcrypt
- Passport.js (Google OAuth 2.0)
- Helmet, CORS, express-rate-limit, express-validator

## Getting Started

### Prerequisites

- Node.js 20.19+ or 22.12+
- MySQL 8.0+ server running
- (Optional) Google OAuth 2.0 credentials for SSO

### Installation

1. **Clone the repository**:

   ```bash
   git clone <repo-url>
   cd nutrition-app
   ```

2. **Install dependencies**:

   ```bash
   # Client
   cd client && npm install

   # Server
   cd ../server && npm install
   ```

3. **Set up the database**:

   ```bash
   mysql -u root -p < database/schema.sql
   ```

4. **Configure environment variables**:

   ```bash
   # Backend
   cp server/.env.example server/.env

   # Frontend
   cp client/.env.example client/.env
   ```

   Fill in `server/.env` with your MySQL credentials, JWT secret, Session secret, and Google OAuth keys.  
   Set `VITE_API_URL` in `client/.env` to your backend origin (default: `http://localhost:3001`).

5. **Run the app**:

   ```bash
   # Start backend (terminal 1)
   cd server && npm start

   # Start frontend (terminal 2)
   cd client && npm run dev
   ```

   Visit [http://localhost:5173](http://localhost:5173).

### Build for Production

```bash
cd client && npm run build  # output: client/dist/
```

---

## Project Structure

```
nutrition-app/
├── client/                 # React + TypeScript frontend
│   ├── src/
│   │   ├── components/     # UI components (modals, bars, etc.)
│   │   ├── pages/          # App.tsx (main), Login.tsx
│   │   ├── context/        # ToastContext
│   │   ├── types/          # Shared TypeScript types
│   │   ├── utils/          # API helpers
│   │   └── i18n/           # Translation files (en.json, …)
│   └── public/
│       └── wasm/           # Scanbot SDK WASM binaries
├── server/                 # Express backend
│   ├── src/
│   │   ├── auth.js         # Auth routes + Passport + verifyToken middleware
│   │   ├── routes.js       # Protected API routes (/api/*)
│   │   ├── db.js           # MySQL connection pool
│   │   └── config.js       # (reserved)
│   ├── app.js              # Express app entry point
│   ├── .env.example        # Backend environment template
│   └── package.json
├── database/
│   └── schema.sql          # Full MySQL schema
└── README.md
```

---

## API Reference

All `/api/*` routes require `Authorization: Bearer <token>`.

### Auth (`/auth`)

| Method | Path                    | Auth | Description                                  |
| ------ | ----------------------- | ---- | -------------------------------------------- |
| POST   | `/auth/register`        | No   | Register with username / email / password    |
| POST   | `/auth/login`           | No   | Login, returns JWT                           |
| POST   | `/auth/verifyToken`     | Yes  | Validate token, return user info             |
| POST   | `/auth/userInDb`        | Yes  | Check if token owner still exists in DB      |
| GET    | `/auth/google`          | No   | Start Google OAuth flow                      |
| GET    | `/auth/google/callback` | No   | Google OAuth callback (redirects with token) |
| GET    | `/auth/logout`          | No   | Destroy session, redirect to frontend        |

### User data (`/api`)

| Method | Path                   | Description                                      |
| ------ | ---------------------- | ------------------------------------------------ |
| GET    | `/api/data`            | Get user settings (email, macro targets)         |
| PUT    | `/api/data`            | Update email, nationality, macro targets         |
| GET    | `/api/food`            | Get ingredients, meals, and today's log          |
| POST   | `/api/ingredient`      | Create a new ingredient                          |
| PUT    | `/api/ingredient`      | Update an existing ingredient                    |
| DELETE | `/api/ingredient`      | Delete ingredient (also removes dependent meals) |
| POST   | `/api/meal`            | Create a named meal with ingredients             |
| PUT    | `/api/meal`            | Edit a meal                                      |
| DELETE | `/api/meal`            | Delete a meal                                    |
| POST   | `/api/eaten`           | Log a meal as eaten today                        |
| DELETE | `/api/eaten`           | Remove a single eaten entry                      |
| DELETE | `/api/eaten/all`       | Clear all eaten entries (end-of-day save)        |
| POST   | `/api/history`         | Save a daily macro snapshot                      |
| GET    | `/api/history`         | Fetch all saved daily snapshots                  |
| POST   | `/api/product/search`  | Full-text search in global products DB           |
| POST   | `/api/product/barcode` | Look up a product by barcode                     |

---

## Database Schema

See [`database/schema.sql`](database/schema.sql) for the complete DDL.

| Table           | Purpose                                            |
| --------------- | -------------------------------------------------- |
| `user`          | Accounts (password or Google-only)                 |
| `nut_values`    | Per-user daily macro targets                       |
| `food`          | User-defined ingredients (values per 100 g)        |
| `meal`          | Named meals (collections of ingredients)           |
| `meal_food`     | Ingredient rows belonging to a meal (with grams)   |
| `eaten_meal`    | Meals logged as eaten today                        |
| `eaten_history` | Saved daily macro snapshots (for streak / history) |
| `products`      | Global product database (barcode + name search)    |

---

## Scripts

**Client:**

| Command          | Description                       |
| ---------------- | --------------------------------- |
| `npm run dev`    | Start Vite dev server             |
| `npm run build`  | Production build (`client/dist/`) |
| `npm run lint`   | Lint with ESLint                  |
| `npm run format` | Format with Prettier              |

**Server:**

| Command          | Description                 |
| ---------------- | --------------------------- |
| `npm start`      | Start Express server        |
| `npm run lint`   | Lint & auto-fix with ESLint |
| `npm run format` | Format with Prettier        |

---

## License

This project is provided as-is for portfolio purposes.
