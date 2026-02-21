# LoveFinder 💖

[![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=flat&logo=bun&logoColor=white)](https://bun.sh/)
[![NestJS](https://img.shields.io/badge/NestJS-%23E0234E.svg?style=flat&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Expo](https://img.shields.io/badge/Expo-000020?style=flat&logo=expo&logoColor=white)](https://expo.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-%23316192.svg?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

**LoveFinder** is a state-of-the-art dating platform engineered for high-performance, real-time connectivity, and high-fidelity matching. Built on top of the ultra-fast Bun runtime and NestJS modular architecture.

---

## 🏗 Architecture & Technologies

### Backend Core
- **Engine:** [Bun](https://bun.sh/) runtime for high-throughput SQL and I/O.
- **Framework:** [NestJS](https://nestjs.com/) for a maintainable, enterprise-grade codebase.
- **Database:** [PostgreSQL](https://www.postgresql.org/) with `earthdistance` and `cube` for optimized spatial queries.
- **Real-time:** [Socket.io](https://socket.io/) integration for instant matching and messaging.
- **Security:** Argon2id password hashing and session-based authentication with Redis persistence.

### Mobile Experience
- **Framework:** [Expo](https://expo.dev/) (React Native) with File-based routing (Expo Router).
- **Styling:** [NativeWind](https://www.nativewind.dev/) (Tailwind CSS) for responsive, multi-platform UI.
- **Visuals:** High-performance image processing using `expo-image` and custom glassmorphic UI components.

---

## 🚀 Interactive Features

*   📍 **Spatial Discovery:** Sub-millisecond distance calculation between users via Postgres spatial indexing.
*   🔥 **Intelligent Swipe Engine:** Real-time feed filtering based on complex preference matrices (gender, age, distance, and interests).
*   💬 **Advanced Messaging:** Multi-modal chat supporting text, high-res images, and audio waveforms.
*   ⚡ **Real-time Notifications:** Instant match transitions and read receipts powered by WebSockets.
*   🎨 **Immersive Onboarding:** A polished, gesture-driven flow to build high-quality user profiles.

---

## 🛠 Setup & Development

### 1. Prerequisites
- [Bun Runtime](https://bun.sh/)
- [Docker & Docker Compose](https://www.docker.com/)
- [Expo Go](https://expo.dev/client)

### 2. Environment Configuration
Copy the root `.env` template and populate:
```bash
POSTGRES_USER=app
POSTGRES_PASSWORD=...
DB_PORT=5430
BACKEND_PORT=3000
BACKEND_URL=http://your-local-ip:3000
```

### 3. Launching Services
```bash
# Start Infrastructure (Postgres & Redis)
docker-compose up -d

# Initialize Backend
cd apps/backend
bun install
bun run start:dev

# Initialize Mobile
cd apps/mobile
bun install
bun start
```

### 4. Demo Data & Seeding
Populate the database with curated Gen Z personas (Anime, Thrifting, Gaming, etc.):
```bash
cd apps/backend
bun --env-file=../../.env db/seed.ts
```

## 🗺 Database Schema

*   **Custom Domains:** `t_email` with regex validation.
*   **Custom Enums:** `t_gender`, `t_orientation`, `t_swipe_type`, `t_message_type`.
*   **Geo-Fencing:** `users` table uses `gist (ll_to_earth(latitude, longitude))` for optimized proximity searches.
*   **Safety Views:** 
    *   `safe_users_personal`: Full profile for the logged-in user.
    *   `safe_users_public`: Public profiles with calculated Age (hiding Birthday).

| Account | Credentials | Purpose |
| :--- | :--- | :--- |
| **Demo** | `demo@example.com` / `123456` | Full profile with matches and chat history |
| **Alice** | `alice@example.com` / `123456` | Matching & Chat testing |
| **Bob** | `bob@example.com` / `123456` | Matching & Chat testing |

---

## 🗺 Deployment (Docker)

The project is production-ready with optimized Dockerfiles:

```bash
# Build and start the entire cluster
docker-compose up --build
```

The Docker setup automatically runs migrations and handles service dependencies (Redis/DB) for a seamless "One-Click" deployment.

---
*Built with ❤️ by the LoveFinder Team.*
