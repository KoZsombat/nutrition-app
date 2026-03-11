# Nutrition App

[![Frontend](https://img.shields.io/badge/frontend-React%2019%20%2B%20TypeScript-61dafb?style=flat-square)](client)
[![Backend](https://img.shields.io/badge/backend-Express%205%20%2B%20MySQL-3c873a?style=flat-square)](server)
[![Build](https://img.shields.io/badge/build-Vite%207-646cff?style=flat-square)](client)

Full-stack nutrition tracking app for logging meals, managing macro targets, and adding foods manually or from a barcode-backed product lookup.

## At a Glance

| Area          | Details                                                            |
| ------------- | ------------------------------------------------------------------ |
| Frontend      | React 19, TypeScript, Vite, Tailwind CSS 4                         |
| Backend       | Express 5, MySQL 8, JWT auth                                       |
| Input methods | Manual ingredients, saved meals, barcode product lookup            |
| User features | Macro targets, daily log, history snapshots, optional Google OAuth |
| Delivery      | SPA frontend with PWA support                                      |

## Highlights

- Daily calorie, protein, carb, and fat tracking
- Custom ingredients and reusable meals
- Logged meals for the current day with history snapshots
- Barcode-based product lookup with Scanbot Web SDK
- JWT authentication with optional Google OAuth login
- Internationalization via i18next
- PWA-enabled frontend build via Vite

## Tech Stack

| Frontend                   | Backend                          |
| -------------------------- | -------------------------------- |
| React 19                   | Express 5                        |
| TypeScript 5               | MySQL 8 via mysql2               |
| Vite 7                     | JWT + bcrypt                     |
| Tailwind CSS 4             | Passport Google OAuth 2.0        |
| react-i18next              | Helmet, CORS, express-rate-limit |
| react-select               | express-validator                |
| react-circular-progressbar |                                  |
| Scanbot Web SDK            |                                  |
| vite-plugin-pwa            |                                  |

## Requirements

- Node.js 20.19+ or 22.12+
- npm
- MySQL 8+
- Optional: Google OAuth credentials

## Quick Start

```bash
git clone <repo-url>
cd nutrition-app

cd client
npm install
cd ../server
npm install

cd ..
mysql -u root -p < database/schema.sql
```

Create your environment files, start the backend and frontend, then open `http://localhost:5173`.

## Setup

### 1. Clone the repository

```bash
git clone <repo-url>
cd nutrition-app
```

### 2. Install dependencies

```bash
cd client
npm install
cd ../server
npm install
```

### 3. Create the database schema

```bash
mysql -u root -p < database/schema.sql
```

### 4. Create environment files

macOS/Linux:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

PowerShell:

```powershell
Copy-Item server/.env.example server/.env
Copy-Item client/.env.example client/.env
```

### 5. Fill in the environment values

Server variables in `server/.env`:

- `DBHOST`
- `DBPORT`
- `DBUSER`
- `DBPASSWORD`
- `DBNAME`
- `JWT_SECRET`
- `SESSION_SECRET`
- `FRONTEND_URL`
- `PORT`
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` if Google login is enabled

Client variables in `client/.env`:

- `VITE_API_URL`, for example `http://localhost:3001`

### 6. Start the application

Backend:

```bash
cd server
npm start
```

Frontend:

```bash
cd client
npm run dev
```

### 7. Open the app

`http://localhost:5173`

## Scripts

### Client

| Command           | Description                                         |
| ----------------- | --------------------------------------------------- |
| `npm run dev`     | Start the Vite dev server                           |
| `npm run build`   | Run TypeScript build and create a production bundle |
| `npm run preview` | Preview the production build locally                |
| `npm run lint`    | Run ESLint on `src/`                                |
| `npm run format`  | Format frontend source files with Prettier          |

### Server

| Command          | Description                                   |
| ---------------- | --------------------------------------------- |
| `npm start`      | Start the Express server                      |
| `npm run lint`   | Run ESLint with auto-fix                      |
| `npm run format` | Format the server project with Prettier       |
| `npm test`       | Placeholder script, currently not implemented |

## Build

Frontend production build:

```bash
cd client
npm run build
```

Output is generated in `client/dist`.

## Runtime Notes

- The backend listens on `PORT`, defaulting to `3001`.
- The frontend expects the backend base URL from `VITE_API_URL`.
- CORS is restricted to `FRONTEND_URL`.
- Google OAuth is optional; leaving those credentials unset disables SSO in practice.

## Health Check

| Endpoint      | Response             |
| ------------- | -------------------- |
| `GET /health` | `{ "status": "ok" }` |

## API Overview

All `/api/*` routes require `Authorization: Bearer <token>`.

### Auth Routes

| Method | Path                    | Auth | Description                                                     |
| ------ | ----------------------- | ---- | --------------------------------------------------------------- |
| `POST` | `/auth/register`        | No   | Register a new user with username, email, and password          |
| `POST` | `/auth/login`           | No   | Log in with username and password                               |
| `POST` | `/auth/verifyToken`     | Yes  | Validate a token and return the authenticated user              |
| `POST` | `/auth/userInDb`        | Yes  | Check whether the token owner still exists                      |
| `GET`  | `/auth/google`          | No   | Start the Google OAuth flow                                     |
| `GET`  | `/auth/google/callback` | No   | OAuth callback that redirects back to the frontend with a token |
| `GET`  | `/auth/logout`          | No   | Log out the Passport session and redirect to the frontend       |

### Protected Routes

| Method   | Path                   | Description                                |
| -------- | ---------------------- | ------------------------------------------ |
| `GET`    | `/api/data`            | Fetch profile data and macro targets       |
| `PUT`    | `/api/data`            | Update profile data and macro targets      |
| `GET`    | `/api/food`            | Fetch ingredients, meals, and eaten items  |
| `POST`   | `/api/ingredient`      | Create an ingredient                       |
| `PUT`    | `/api/ingredient`      | Update an ingredient                       |
| `DELETE` | `/api/ingredient`      | Delete an ingredient                       |
| `POST`   | `/api/meal`            | Create a meal                              |
| `PUT`    | `/api/meal`            | Update a meal                              |
| `DELETE` | `/api/meal`            | Delete a meal                              |
| `POST`   | `/api/eaten`           | Log a meal as eaten                        |
| `DELETE` | `/api/eaten`           | Delete a single eaten entry                |
| `DELETE` | `/api/eaten/all`       | Clear today's eaten entries                |
| `POST`   | `/api/history`         | Save a daily history snapshot              |
| `GET`    | `/api/history`         | Fetch history snapshots                    |
| `POST`   | `/api/product/search`  | Search the shared product database by name |
| `POST`   | `/api/product/barcode` | Look up a product by barcode               |

## Database

The schema lives in `database/schema.sql` and creates these main tables:

| Table           | Purpose                                 |
| --------------- | --------------------------------------- |
| `user`          | Local and Google-authenticated accounts |
| `nut_values`    | Per-user calorie and macro targets      |
| `food`          | User-defined ingredients                |
| `meal`          | Saved meals                             |
| `meal_food`     | Ingredient rows belonging to a meal     |
| `eaten_meal`    | Meals logged for the current day        |
| `eaten_history` | Saved daily nutrition history           |
| `products`      | Shared barcode and product lookup data  |

The `products` table is created by the schema, but product data must be populated separately.

## Project Structure

```text
nutrition-app/
├── client/
│   ├── public/
│   │   └── wasm/               # Scanbot Web SDK assets
│   ├── src/
│   │   ├── components/         # UI components and modals
│   │   ├── context/            # React context providers
│   │   ├── countries/          # Country data for profile settings
│   │   ├── i18n/               # i18n setup and locale files
│   │   ├── pages/              # App and login pages
│   │   └── types/              # Shared frontend types
│   └── vite.config.ts          # Vite + PWA configuration
├── database/
│   └── schema.sql              # MySQL schema
├── server/
│   ├── src/
│   │   ├── config/             # Runtime config and rate limiters
│   │   ├── middleware/         # Token verification and error helpers
│   │   ├── routes/             # Express route modules
│   │   ├── auth.js             # Auth router and Passport setup
│   │   ├── db.js               # MySQL connection setup
│   │   └── routes.js           # Protected API router aggregation
│   └── app.js                  # Express entry point
└── README.md
```

## Notes

- The frontend currently ships with an English locale file in `client/src/i18n/locales/en.json`.
- There is no real automated test suite configured yet.

## License

Provided as-is for portfolio and learning purposes.
