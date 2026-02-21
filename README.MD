# LoveFinder 💖

[![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=flat&logo=bun&logoColor=white)](https://bun.sh/)
[![NestJS](https://img.shields.io/badge/NestJS-%23E0234E.svg?style=flat&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Expo](https://img.shields.io/badge/Expo-000020?style=flat&logo=expo&logoColor=white)](https://expo.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-%23316192.svg?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

LoveFinder is a high-performance dating app built with **Bun**, **NestJS**, and **Expo**. It features sub-millisecond proximity matching using PostgreSQL spatial indexing and instant messaging via WebSockets.

---

## 🚀 Features

*   📍 **Spatial Discovery:** Sub-millisecond distance calculation via Postgres `earthdistance`.
*   🔥 **Intelligent Swiping:** Filter users by gender, age, and interests.
*   💬 **Real-time Chat:** Instant messaging with read receipts and media support.
*   🎨 **Modern UI:** Glassmorphic design built with NativeWind and custom components.

---

## 🏗 Setup & Running

### 1. Requirements
- Install [Bun](https://bun.sh/).
- Install [Docker](https://www.docker.com/).

### 2. Configure Environment
Create a `.env` file in the root directory:
```bash
POSTGRES_USER=app
POSTGRES_PASSWORD=your_password
DB_PORT=5430
BACKEND_PORT=3000
BACKEND_URL=http://your-local-ip:3000
```

### 3. Quick Start (Recommended)
This command installs all dependencies, starts the database, and seeds it with demo personas:
```bash
bun run setup
```

### 4. Running the App
```bash
# Start the Backend (NestJS)
bun run start:backend

# Start the Mobile App (Expo)
bun run start:mobile
```

---

## 🛠 Project Scripts

| Script | Purpose |
| :--- | :--- |
| `bun run setup` | Full initial setup (install + infrastructure + seed) |
| `bun run up:db` | Starts the PostgreSQL database container |
| `bun run up:redis` | Starts the Redis session store |
| `bun run reseed` | Wipes existing data and creates fresh demo accounts |
| `bun run psql` | Direct access to the Postgres terminal |
| `bun run down` | Stops and removes all docker containers |

---

## 🧪 Demo Accounts
Running `bun run reseed` creates a set of test profiles so you can explore the app immediately:

| Email | Password | Role |
| :--- | :--- | :--- |
| `demo@example.com` | `123456` | **Main Demo** (Has pre-set matches & chats) |
| `alice@example.com` | `123456` | **Test User** (Matched with Demo) |
| `bob@example.com` | `123456` | **Test User** (Matched with Demo) |

---
*Built with ❤️ for LoveFinder.*
