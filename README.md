# Terminal Code

VS Code–inspired developer workspace manager. Full-stack: React + Tauri desktop app with Spring Boot metadata service.

## Architecture

```
frontend/     React 19 + Tauri 2 + TypeScript
backend/      Spring Boot 4 + Java 19 + JPA
```

**Critical constraint:** Backend never touches filesystem or executes commands. All terminal/FS ops are local via Tauri Rust commands.

## Quick Start (local dev)

### Backend

```bash
cd backend
SPRING_PROFILES_ACTIVE=local ./gradlew bootRun
```

Runs with zero dependencies — H2 file database, no Docker needed. Starts on `http://localhost:8080`.

| Profile | Database | Use case |
|---------|----------|----------|
| `local` | H2 file (`./data/`) | Zero-dependency local dev |
| `dev` | PostgreSQL (Docker) | Docker Compose |
| `prod` | PostgreSQL (ext) | Production |
| `test` | H2 in-memory | `./gradlew test` |

### Frontend

```bash
cd frontend
npm install
npm run dev          # Browser dev on http://localhost:5173
npm run tauri dev    # Full Tauri desktop window
```

### Google OAuth

Copy `.env` at repo root (gitignored) with:

```
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
JWT_ACCESS_SECRET=your-base64-key
JWT_REFRESH_SECRET=your-base64-key
```

Authorized redirect URI in Google Cloud Console: `http://localhost:8080/login/oauth2/code/google`

## Commands

```bash
# Backend
./gradlew test                                           # tests
./gradlew test --tests "terminal_code.backend.ClassName" # single test
./gradlew build                                          # compile + test

# Frontend
npm run lint        # ESLint
npm run build       # tsc + Vite build
npm run tauri build # Tauri production build
```

## Features

- Google OAuth2 login with JWT access + refresh token rotation
- Workspace + project CRUD management
- Monaco code editor with file open/save
- xterm.js terminal with real shell via Rust PTY
- Recursive file explorer with directory browsing
- VS Code–dark theme, split pane layout, draggable dividers

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, TypeScript, Tailwind CSS, Zustand |
| Editor | Monaco Editor |
| Terminal | xterm.js + @xterm/addon-fit |
| Desktop | Tauri 2 (Rust) |
| Backend | Spring Boot 4, Spring Security, JPA |
| Auth | JWT (HMAC-SHA256) + Google OAuth2 |
| Database | H2 (dev), PostgreSQL (prod), Flyway migrations |
| Build | Gradle (backend), Vite + tsc (frontend) |
