# LoveFinder 💖

LoveFinder is a high-performance, full-stack dating application built with a focus on speed, real-time interaction, and precise location-based matching.

## 🚀 Tech Stack

### Backend
- **Runtime:** [Bun](https://bun.sh/) (for ultra-fast execution and native SQL support)
- **Framework:** [NestJS](https://nestjs.com/)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **Authentication:** Passport.js with Session-based persistence
- **Real-time:** WebSockets (Socket.io)
- **Security:** Argon2 password hashing

### Mobile
- **Framework:** [Expo](https://expo.dev/) (React Native)
- **Routing:** Expo Router (File-based routing)
- **Styling:** [NativeWind](https://www.nativewind.dev/) (Tailwind CSS for React Native)
- **State Management:** React Context API
- **Utilities:** Day.js, Lucide/Vector Icons, Expo Location

---

## 🛠 Project Structure

```text
.
├── apps
│   ├── backend          # NestJS API & Bun.sql logic
│   │   ├── db           # SQL Schemas (init.sql) & Seed scripts
│   │   └── src          # Feature modules (Auth, Chat, Feed, etc.)
│   └── mobile           # Expo React Native App
│       ├── app          # Expo Router pages
│       ├── components   # Atomic UI components & Modals
│       ├── contexts     # Global state (Auth, Theme, Socket)
│       └── services     # API integration layer
└── docker-compose.yml   # Infrastructure (Postgres)
```

---

## ⚡️ Key Features

*   **Location-Based Discovery:** Real-time distance calculation using Postgres `earthdistance` and `cube` extensions.
*   **Swipe Engine:** Advanced feed filtering based on gender preferences, age range, and geographic radius.
*   **Interactive Onboarding:** Multi-step flow including custom wheel pickers for age, interest selection, and photo uploads.
*   **Real-time Chat:** Instant messaging with support for text, images, and audio notes via WebSockets.
*   **Dynamic Theming:** Full Light/Dark mode support across all components.
*   **Interest Matching:** Recommendation logic based on shared user interests.

---

## 🚦 Getting Started

### Prerequisites
- [Bun](https://bun.sh/) installed.
- [Docker](https://www.docker.com/) (for PostgreSQL).
- [Expo Go](https://expo.dev/client) app on your physical device (recommended for Location/Camera features).

### 1. Database Setup
Start the PostgreSQL container:
```bash
docker-compose up -d
```
Run the `apps/backend/db/init.sql` script in your Postgres client to set up the extensions (`citext`, `earthdistance`), types, and tables.

### 2. Backend Installation
```bash
cd apps/backend
bun install
bun run start:dev
```

### 3. Seed the Data (Optional)
To populate the app with 100+ users, matches, and messages for a demo:
```bash
cd apps/backend
bun seed.ts
```
*Hero user created: `alice@example.com` / `password123`*

### 4. Mobile Installation
```bash
cd apps/mobile
bun install
```
**Important:** Update the `BACKEND_BASE_URL` in `apps/mobile/services/api.ts` to match your computer's local IP address (e.g., `http://192.168.1.XX:3000/api/v1/`).

Start the app:
```bash
bun start
```

---

## 🗺 Database Schema Highlights

*   **Custom Domains:** `T_EMAIL` with regex validation.
*   **Custom Enums:** `T_GENDER`, `T_ORIENTATION`, `T_SWIPE_TYPE`, `T_MESSAGE_TYPE`.
*   **Geo-Fencing:** `USERS` table includes `LATITUDE` and `LONGITUDE` columns indexed via `gist (ll_to_earth(...))` for fast proximity searches.
*   **Onboarding Constraint:** A SQL `CHECK` constraint ensures `IS_ONBOARDED` cannot be `TRUE` unless all profile requirements are met.
*   **Views:** 
    *   `SAFE_USERS_PERSONAL`: Secure view for the logged-in user.
    *   `SAFE_USERS_PUBLIC`: Public-facing data (calculated Age instead of Birthday).

---

## 📱 Mobile Architecture

### Onboarding Flow
The app uses a strict onboarding layout. Users are redirected through:
`Welcome -> Name -> Birthday -> Gender -> Orientation -> Interested In -> Interests -> Photos -> Bio -> Discovery -> Privacy -> Location`

### Navigation
- **(auth):** Public screens (Login/Signup).
- **(onboarding):** Sequential profile setup.
- **(tabs):** Main app experience (Feed, Chat, Profile).
- **(chat):** Deep-linked chat rooms with socket integration.

---

## 📄 License
MIT

---
*Built with ❤️ for LoveFinder.*
