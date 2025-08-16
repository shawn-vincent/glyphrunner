# Repository Guidelines

## Project Structure & Module Organization
- `docs/`: Documentation assets (images in `docs/images`, requirements in `docs/requirements`).
- `meta/`: Project metadata (e.g., `meta/history`).
- `src/`: Application/library code to be added here (organize by package/module).
- `tests/`: Test suites mirroring `src/` layout.
- Optional: `bin/` for CLIs, `examples/` for runnable samples, `scripts/` for dev tooling.

## Build, Test, and Development Commands
- Tooling is language-specific; prefer a Makefile with targets:
  - `make setup`: Install toolchain and dependencies.
  - `make build`: Compile/bundle sources.
  - `make test`: Run unit/integration tests with coverage.
  - `make lint` / `make fmt`: Lint and auto-format.
  - `make run`: Launch the local app/CLI.
- If no Makefile, use native equivalents (examples): `npm run test`, `pytest -q`, `cargo test`.

## Coding Style & Naming Conventions
- Enforce formatter + linter for the chosen language (e.g., Prettier/ESLint, Black/Ruff, rustfmt/clippy).
- Keep lines ≤ 100 chars; prefer clear, single-responsibility modules.
- Naming: `lower_snake_case` files, `PascalCase` types/classes, `camelCase` functions/vars.
- Include editor/formatter configs; do not mix unrelated changes in one PR.

## Testing Guidelines
- Place tests under `tests/` mirroring `src/` paths.
- Name tests `*.test.*` or `test_<feature>_<behavior>.*`; keep unit vs integration clear.
- Aim for ≥ 80% coverage; include edge cases and negative paths.
- Store fixtures in `tests/fixtures/`; prefer deterministic tests without network calls.

## Commit & Pull Request Guidelines
- Use Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`, `ci:`.
- PRs: concise summary, linked issues, screenshots/CLI output, and notes on breaking changes.
- Keep PRs focused and small; update `docs/` when behavior or APIs change.

## Security & Configuration Tips
- Never commit secrets; use environment variables and provide a `.env.example`.
- Pin tool versions; document setup steps in `README.md`.
