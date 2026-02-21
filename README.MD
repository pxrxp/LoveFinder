# LoveFinder 💖

[![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=flat&logo=bun&logoColor=white)](https://bun.sh/)
[![NestJS](https://img.shields.io/badge/NestJS-%23E0234E.svg?style=flat&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Expo](https://img.shields.io/badge/Expo-000020?style=flat&logo=expo&logoColor=white)](https://expo.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-%23316192.svg?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

**LoveFinder** is a high-performance, full-stack dating application built with a focus on speed, real-time interaction, and precise location-based matching.

---

## 🚀 Tech Stack

### Backend
- **Runtime:** [Bun](https://bun.sh/) (Native SQL support, ultra-fast execution)
- **Framework:** [NestJS](https://nestjs.com/) (Modular Architecture)
- **Database:** [PostgreSQL](https://www.postgresql.org/) (with `earthdistance` extension)
- **Authentication:** Passport.js + Session-based persistence
- **Real-time:** WebSockets via [Socket.io](https://socket.io/)
- **Hashing:** Argon2 for secure password storage

### Mobile
- **Framework:** [Expo](https://expo.dev/) (React Native)
- **Routing:** Expo Router (File-based routing)
- **Styling:** [NativeWind](https://www.nativewind.dev/) (Tailwind CSS for React Native)
- **State:** React Context API
- **Icons:** Lucide-React-Native & Expo Vector Icons

---

## 🛠 Project Structure

```text
.
├── apps
│   ├── backend          # NestJS API & Bun.sql logic
│   │   ├── db           # SQL Schemas (init.sql) & Seed scripts
│   │   └── src          # Feature modules (auth, chat, feed, etc.)
│   └── mobile           # Expo React Native App
│       ├── app          # Expo Router pages
│       ├── components   # Atomic UI components & Modals
│       ├── contexts     # Global state (auth, theme, socket)
│       └── services     # API and WebSocket integration
├── docker-compose.yml   # Infrastructure (Postgres, Redis)
├── eslint.config.mjs    # Modern ESLint Flat Config
└── package.json         # Workspace configuration
```

---

## ⚡️ Key Features

*   📍 **Location-Based Discovery:** Real-time distance calculation using Postgres `earthdistance` and `cube` extensions.
*   🔥 **Swipe Engine:** Advanced feed filtering based on gender preferences, age range, and geographic radius.
*   🎨 **Interactive Onboarding:** Multi-step flow including custom wheel pickers for age, interest selection, and photo uploads.
*   💬 **Real-time Chat:** Instant messaging with support for text, images, and audio notes via WebSockets.
*   🌗 **Dynamic Theming:** Full Light/Dark mode support across the entire mobile experience.
*   🤝 **Interest Matching:** Recommendation logic based on shared user interests.

---

## 🚦 Getting Started

### Prerequisites
- [Bun](https://bun.sh/) installed.
- [Docker](https://www.docker.com/) (for PostgreSQL).
- [Expo Go](https://expo.dev/client) app on your physical device.

### 1. Infrastructure Setup
Start the PostgreSQL container:
```bash
npm run up:db
```

### 2. Database Initialization
Run the schema script to set up extensions, types, and tables:
1. Connect to your local Postgres.
2. Execute the contents of `apps/backend/db/init.sql`.

### 3. Backend Setup
```bash
cd apps/backend
bun install
npm run start:dev
```

### 4. Seed Demo Data (Optional)
To populate the app with 100+ users and sample messages:
```bash
cd apps/backend
bun db/seed.ts
```
> **Default User:** `alice@example.com` / `password123`

### 5. Mobile Setup
**Important:** Update the `BACKEND_BASE_URL` in `apps/mobile/services/api.ts` to your machine's local IP address.

```bash
cd apps/mobile
bun install
bun start
```

---

## 🗺 Database Schema

*   **Custom Domains:** `t_email` with regex validation.
*   **Custom Enums:** `t_gender`, `t_orientation`, `t_swipe_type`, `t_message_type`.
*   **Geo-Fencing:** `users` table uses `gist (ll_to_earth(latitude, longitude))` for optimized proximity searches.
*   **Safety Views:** 
    *   `safe_users_personal`: Full profile for the logged-in user.
    *   `safe_users_public`: Public profiles with calculated Age (hiding Birthday).

---

## 📱 Mobile Architecture

### Onboarding Flow
Sequential profile setup: `Welcome -> Name -> Birthday -> Gender -> Orientation -> Interested In -> Interests -> Photos -> Bio -> Discovery -> Privacy -> Location`.

### Navigation Groups
- `(auth)`: Login and Registration.
- `(onboarding)`: Progressive profile completion.
- `(tabs)`: Main application (Feed, Chat, Profile).
- `(chat)`: Real-time messaging interface.

---

## 📄 License
MIT

---
*Built with ❤️ for LoveFinder.*
