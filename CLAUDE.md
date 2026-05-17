# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Terminal Code — local-first developer workspace manager. VS Code-inspired desktop app. Spring Boot 4.0.6 backend (Java 21, metadata service only) + Vite React TypeScript frontend (React 19, Vite 8, Tailwind CSS 4, Zustand) inside Tauri 2 desktop wrapper. Monorepo: `backend/`, `frontend/`.

**Critical architecture rule:** Backend NEVER executes commands or accesses filesystem. All terminal execution and filesystem access is local via Tauri Rust commands.

## Backend

Spring Boot 4.0.6, Java 21, Gradle 9.4.1. Package: `terminal_code.backend`.

### Commands

```bash
# Build and run tests
./gradlew build

# Run tests only
./gradlew test

# Run a single test class
./gradlew test --tests "terminal_code.backend.BackendApplicationTests"

# Run the app (dev, requires PostgreSQL)
./gradlew bootRun

# Run with Docker (starts PostgreSQL + backend)
cd .. && docker compose up
```

### Architecture

Layered by domain: `domain/` (JPA entities + Spring Data repos) → `application/` (@Service) → `api/` (@RestController) → `dto/` (records).

```
config/           SecurityConfig, CORS, JWT config
auth/             Google OAuth2, JWT generation/validation, refresh token rotation
workspace/        Workspace CRUD, project metadata CRUD
user/             User profile, preferences
common/error/     GlobalExceptionHandler, domain exceptions
```

### Key Details

- Flyway migrations in `src/main/resources/db/migration/` — 6 migrations (users, refresh_tokens, workspaces, projects, user_preferences, workspace_states)
- Spring Security: stateless JWT filter chain, OAuth2 login with Google, CORS for `tauri://localhost` + Vite dev
- JWT: two HMAC-SHA256 keys (access 15min, refresh 7day), stored in env vars `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- Refresh token rotation: single-use, revoked token reuse → revoke all tokens for user (theft detection)
- Backend is pure metadata — stores workspace names, project local paths, layout state JSONB. Never reads file contents or executes commands.
- `local_path` in projects table stored but never validated by backend. Frontend/Tauri validates locally.
- Lombok for boilerplate (though entities currently hand-written).
- `application.yml` (base) + `application-dev.yml` + `application-prod.yml`. Profiles set via `SPRING_PROFILES_ACTIVE`.
- H2 in-memory DB for tests, PostgreSQL for dev/prod.

### API Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/auth/refresh` | No | Rotate refresh token, get new JWT pair |
| POST | `/api/auth/logout` | No | Revoke refresh token |
| GET | `/api/auth/me` | JWT | Current user info |
| GET | `/api/workspaces` | JWT | List user's workspaces |
| POST | `/api/workspaces` | JWT | Create workspace |
| PATCH | `/api/workspaces/{id}` | JWT | Update workspace |
| DELETE | `/api/workspaces/{id}` | JWT | Delete workspace |
| PUT | `/api/workspaces/{id}/star` | JWT | Toggle star |
| POST | `/api/workspaces/{id}/projects` | JWT | Add project to workspace |
| DELETE | `/api/workspaces/{wid}/projects/{pid}` | JWT | Remove project |
| GET | `/api/users/me` | JWT | Current user profile |
| GET | `/actuator/health` | No | Health check |

## Frontend

Vite 8 + React 19 + TypeScript 6.0 + Tailwind CSS 4 + Zustand 5. Tauri 2 desktop wrapper.

### Commands

```bash
# Dev server (browser only, no Tauri)
npm run dev

# Dev with Tauri desktop window
npm run tauri dev

# Production build (typecheck + vite)
npm run build

# Build Tauri desktop app
npm run tauri build

# Lint
npm run lint
```

### Architecture

```
src/
  api/           Axios client + API modules (auth, workspaces)
  store/         Zustand stores (authStore, workspaceStore, terminalStore, editorStore, uiStore)
  components/
    layout/      AppShell, Sidebar, StatusBar (VS Code-inspired)
    workspace/   WorkspaceList, WorkspaceCreateDialog
    editor/      EditorTabs, EditorPane (Monaco placeholder)
    terminal/    TerminalTabs, TerminalPane (xterm.js placeholder)
    auth/        AuthGuard, LoginButton
    fileExplorer/FileTree, FileTreeNode, FileContextMenu (TBD)
    common/      Shared UI primitives (TBD)
  pages/         LoginPage, WorkspacePage
  tauri/         Typed invoke() wrappers for all Rust IPC commands
  types/         TypeScript interfaces (auth, workspace, editor, terminal)
  utils/         Constants, helpers

src-tauri/       Tauri Rust project
  src/
    commands/
      terminal.rs    create/write/resize/kill terminal via pty
      filesystem.rs  read_directory/read_file/write_file
      auth_store.rs  store/get/clear tokens in OS keychain
    lib.rs          Plugin init, command registration
    main.rs         Entry point
  tauri.conf.json   Window config, CSP, plugin scopes
  capabilities/default.json  Permission allowlist
```

### Key Conventions

- `verbatimModuleSyntax` enabled — use `import type` for type-only imports
- `erasableSyntaxOnly` enabled — no enums, namespace, or param properties
- `noUnusedLocals` / `noUnusedParameters` — unused imports are compile errors
- Tailwind CSS 4 with `@tailwindcss/vite` plugin (no PostCSS config)
- Zustand with `persist` middleware for auth + UI state (localStorage fallback)
- Tauri IPC wrappers in `src/tauri/commands.ts` — graceful fallback to `localStorage` when running in browser dev mode
- VS Code dark theme: bg `#1e1e1e`, sidebar `#252526`, tabs `#2d2d2d`, accent `#007acc`
- ESLint flat config with typescript-eslint + react-hooks + react-refresh

### Tauri Plugin Scopes

- **shell**: open allowed, command scope = system shells only
- **fs**: `$HOME/**`, `/**` (OS prompts on first access to sensitive dirs)
- **store**: `**` (auth tokens in OS keychain)
- **deep-link**: `terminal-code` scheme for OAuth callback

### State Flow

1. Auth: Login → system browser → Google OAuth → backend callback → `terminal-code://auth/callback` deep-link → Tauri intercepts → stores JWT in OS keychain → React app loads
2. Terminal: React `invoke('create_terminal', {cwd})` → Rust spawns pty → stdout via Tauri events → xterm.js renders
3. Filesystem: React `invoke('read_directory', {path})` → Rust `std::fs::read_dir` → FileEntry[] → React renders
4. Workspace state: Frontend serializes layout (open editors, terminal cwds, panel sizes — NOT file contents) → POST JSON to backend → stored as JSONB

## Docker

```bash
# Start PostgreSQL + backend
docker compose up

# Stop
docker compose down
```

Uses `postgres:16-alpine`. Backend built via `Dockerfile.dev` (hot-reload with Gradle). Env vars: `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — set in `.env` or shell.

## Database

PostgreSQL 16. Tables: `users`, `refresh_tokens`, `workspaces`, `projects`, `user_preferences`, `workspace_states`. Flyway migrations version-controlled in `backend/src/main/resources/db/migration/`.
