<p align="center">
  <img width="400" alt="LoveFinder" src="https://github.com/user-attachments/assets/0560b393-42f2-4095-8b5a-0f4c4eeb08f5" />
  <br/>
  <a href="https://bun.sh/">
    <img src="https://img.shields.io/badge/Bun-%23000000.svg?style=flat&logo=bun&logoColor=white"/>
  </a>
  <a href="https://nestjs.com/">
    <img src="https://img.shields.io/badge/NestJS-%23E0234E.svg?style=flat&logo=nestjs&logoColor=white"/>
  </a>
  <a href="https://expo.dev/">
    <img src="https://img.shields.io/badge/Expo-000020?style=flat&logo=expo&logoColor=white"/>
  </a>
  <a href="https://www.postgresql.org/">
    <img src="https://img.shields.io/badge/PostgreSQL-%23316192.svg?style=flat&logo=postgresql&logoColor=white"/>
  </a>
  <a href="https://redis.io/">
    <img src="https://img.shields.io/badge/Redis-%23DD0031.svg?style=flat&logo=redis&logoColor=white"/>
  </a>
</p>

This is a dating app built with **NestJS** (on Bun) and **Expo**. It handles matching, swiping, and real-time chat.

<p align="center">
  <img alt="Screenshot of Swipe tab" src="https://github.com/user-attachments/assets/dd8bec0f-af78-4478-bee3-e2bf4305892b" width="200"/>
  <img alt="Screenshot of Chat tab" src="https://github.com/user-attachments/assets/7de180c0-db6b-4c69-8ab9-aa779d3c5079" width="200" />
  <img alt="Screenshot of a test chat" src="https://github.com/user-attachments/assets/bdb7410f-a573-47cb-b403-f239f27d6ca5" width="200" />
  <img alt="Screenshot of Profile tab" src="https://github.com/user-attachments/assets/82766022-f444-496c-86b8-d276e93fa650" width="200" />
</p>

---

## 📖 Contents
1. [Tech Stack](#-tech-stack)
2. [Database Tables](#-database-tables)
3. [API List](#-api-list)
4. [Live Chat (WebSockets)](#-live-chat-websockets)
5. [Matching Logic](#-matching-logic)
6. [Setup & Scripts](#-setup--scripts)

---

## 🏗 Tech Stack

- **Backend:** NestJS using the Bun runtime.
- **Database:** PostgreSQL for storage and Redis for session/chat data.
- **Mobile:** React Native (Expo) with file-based routing.
- **Styling:** NativeWind (Tailwind) for UI.

### Folders
```text
LoveFinder/
├── apps/
│   ├── backend/          # Server code, DB rules, and setup scripts
│   └── mobile/           # App code, UI components, and types
```

---

## 🗄 Database Tables

| Table | What it does | Key Data |
| :--- | :--- | :--- |
| `users` | Account info | Email, password hash, and location point |
| `profiles` | What users see | Name, gender, age, bio, and photos |
| `swipes` | Keeps track of swipes | Who swiped, on who, and if it was a like/pass |
| `messages` | Chat history | Text or images sent between users |
| `interests` | List of hobbies | ID and name of the interest |

**Location:** We use a `gist` index in Postgres so the database can find nearby users quickly without checking every single row.

---

## 📡 API List

### Login & Security
- `POST /api/v1/auth/login` - Logs you in and sets a session cookie.
- `POST /api/v1/auth/logout` - Logs you out.

### Users
- `POST /api/v1/users` - Create a new account.
- `GET /api/v1/users/me` - Get your own profile info.
- `PATCH /api/v1/users` - Update your settings (age, distance, gender).
- `GET /api/v1/users/:id` - See someone else's public profile.

### Discovery
- `GET /api/v1/feed` - Get the stack of people to swipe on.
- `POST /api/v1/swipes` - Send a like, pass, or block.
- `GET /api/v1/chat/conversations` - Get your match list and last messages.

---

## ⚡ Live Chat (WebSockets)

Events sent between the server and the app for instant updates.

### Server to App
- `new_message`: Sent when someone sends you a message.
- `new_match`: Sent when you and someone else both like each other.
- `new_like`: Sent when someone likes you (updates your list).
- `messages_read`: Sent when the other person views your message.

### App to Server
- `join_room`: Joins a specific chat room.
- `send_message`: Sends a message to someone.
- `mark_as_read`: Tells the server you've seen the latest messages.

---

## 🧠 Matching Logic

### How the Feed works
The app finds people for you based on:
1. **Filters:** Skips people you already swiped on, or people who blocked you.
2. **Distance:** Matches your location against others using `earth_distance`.
3. **Preferences:** Checks your age and gender settings.
4. **Sorting:** People with more **shared interests** show up first, followed by whoever is closest.

---

## 🛠 Setup & Scripts

### 1. Requirements
Install **Bun** and **Docker**.

### 2. Fast Setup
Run this from the root folder to configure your environment, install dependencies, and set up the database:
```bash
bun run setup
```

This will launch an **Interactive CLI** that walks you through:
- 🗄️ Database credentials
- 🌐 **Backend URL** (The URL used by the mobile app, detected from your network!)
- 🔑 Generating secure session secrets

### 3. Environment Configuration
If you need to update your settings later, you can re-run just the configuration tool:
```bash
bun run setup:env
```

### 4. Scripts

| Script | Command | Result |
| :--- | :--- | :--- |
| `setup` | `bun run setup` | Install + Start DB + Add test data |
| `start:backend` | `bun run start:backend` | Start backend server |
| `start:mobile` | `bun run start:mobile` | Start mobile app |
| `up:db` | `bun run up:db` | Start Postgres |
| `up:redis` | `bun run up:redis` | Start Redis |
| `reseed` | `bun run reseed` | Wipe DB and add 100+ demo users |
| `down` | `bun run down` | Stop all Docker containers |

---

## 🧪 Demo Accounts
Use these to test matching and chat:

| Account | Email | Password |
| :--- | :--- | :--- |
| **Demo** | `demo@example.com` | `123456` |
| **Alice** | `alice@example.com` | `123456` |
| **Bob** | `bob@example.com` | `123456` |

---
Built with ❤️ — LoveFinder
