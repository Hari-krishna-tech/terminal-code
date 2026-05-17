# AGENTS.md — Terminal Code

Monorepo: `backend/` (Spring Boot metadata service) + `frontend/` (Vite React + Tauri 2 desktop).

**Critical constraint:** Backend NEVER touches filesystem or executes commands. All terminal/FS ops are local via Tauri Rust commands.

## Commands

```bash
# Backend (workdir: backend/)
./gradlew test                                           # tests (H2 in-memory, profile=test)
./gradlew test --tests "terminal_code.backend.ClassName" # single test
./gradlew build                                          # compile + test
./gradlew bootRun                                        # dev server (needs DB per active profile)

# Frontend (workdir: frontend/)
npm run dev          # Vite dev server (browser only, port 5173)
npm run build        # tsc -b (typecheck) THEN vite build
npm run lint         # eslint
npm run tauri dev    # full Tauri desktop window
npm run tauri build  # Tauri production build
```

## Backend Spring Profiles

Profile is set via `SPRING_PROFILES_ACTIVE` env var.

| Profile | Database | Flyway | ddl-auto | Use case |
|---------|----------|--------|----------|----------|
| `local` | H2 file (`./data/`) | disabled | create-drop | **No Docker needed** — local dev |
| `dev` | PostgreSQL (Docker) | disabled | update | Docker Compose dev |
| `prod` | PostgreSQL (ext) | enabled | validate | Production |
| `test` | H2 in-memory | disabled | create-drop | `./gradlew test` |
| (none) | PostgreSQL | enabled | validate | Fallback, needs PostgreSQL |

- **`local` profile**: Runs with zero dependencies. H2 console at `/h2-console`. JPA creates schema from entities.
- **`dev`/`prod`**: Require running PostgreSQL. Set env vars `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
- **`test`**: Static JWT secrets embedded in `application-test.yml`. No external env vars needed.

For quick local dev without Docker:
```bash
SPRING_PROFILES_ACTIVE=local ./gradlew bootRun
```

## Frontend TypeScript Quirks

- `verbatimModuleSyntax: true` — use `import type { X }` for type-only imports (not `import { type X }`).
- `erasableSyntaxOnly: true` — no enums, namespaces, or parameter properties. Use union types and `as const`.
- `noUnusedLocals` + `noUnusedParameters` — unused imports are compile errors.
- `target: es2023` in both vite build and tsconfig.

## .env / Secrets

`.env` at repo root is gitignored and contains real OAuth/JWT secrets. Never read it into context or log it. The `local` profile does NOT need these secrets for basic CRUD; `dev`/`prod` do.

## Architecture Notes

- **Java toolchain**: 19 (see `backend/build.gradle:12`). The `CLAUDE.md` may say 21 — trust the build.gradle.
- **Flyway**: Only active in production or when no profile override is active. Migrations in `backend/src/main/resources/db/migration/`.
- **Tauri IPC**: Wrappers in `frontend/src/tauri/commands.ts` do dynamic imports of `@tauri-apps/api` and silently fall back to browser-only mode (no terminal, no FS). Tauri commands available: `create_terminal`, `write_terminal`, `resize_terminal`, `kill_terminal`, `read_directory`, `read_file`, `write_file`, `store_token`, `get_token`, `clear_tokens`.
- **CORS**: Backend allows `tauri://localhost`, `http://localhost:5173`, `https://app.terminal-code.io`.
- **Build order**: `npm run build` already runs typecheck first (`tsc -b`). No separate typecheck step needed. For CI: `npm run lint && npm run build`.
