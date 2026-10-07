# lms-membership-portal

> Membership bounded context: web UI (remote)

Part of the **LMS Library** distributed system — team `lms-library`, Grupo 2.
Governance and documentation live in [`library-docs`](https://github.com/code-corhuila/library-docs).

Implements HU-02 (register student) and HU-03 (search/edit/deactivate student), consuming
`lms-membership-api`'s `/students` endpoints.

## Structure

Follows `rules/2-anexos/H-front.md` (the course's own repository norm): this portal is composed
into `lms-front` as a **Module Federation remote**, not run as an unrelated standalone app.

```
src/
├── pages/students/    → StudentsListPage (HU-03), StudentFormPage (HU-02)
├── components/ui/      → Button, Card — still local; only the HTTP client and session are
│                          required to live in the container (rules/2-anexos/H-front.md)
├── routes.tsx            → exposed to lms-front via vite.config.ts's federation({ exposes })
├── shell.d.ts              → ambient types for shell/apiClient, shell/session
├── App.tsx                  → standalone preview only, reuses routes.tsx (see below)
├── bootstrap.tsx              → the real entry point; main.tsx dynamically imports this
└── types/                       → Student, Paginated, PaginatedMeta
```

**No HTTP client or session code of this portal's own anymore.** `src/lib/api.ts` and
`src/lib/auth.ts` — marked temporary since they were first added — are gone; pages import
`apiClient`/`ShellError` from `shell/apiClient` and `shell/session` instead, resolved at runtime
by `@module-federation/vite` against `lms-front`'s own dev server on port 3000 — this portal itself
runs on port 3001 (`vite.config.ts`).

**Running this portal alone (`npm run dev`) no longer fully works in isolation** — `shell/apiClient`
and `shell/session` only resolve while `lms-front`'s dev server is also running (`npm run dev` in
that repo, port 3000). This is the correct trade-off per the norm, not a bug: a portal is not
meant to be a fully independent application once it's federated.

## Known gaps

- **`package-lock.json` needs regenerating.** `@module-federation/vite` was added to
  `package.json` by hand in this environment (no `npm`/network access to run `npm install`) — the
  lockfile doesn't have its entry yet. Run `npm install` once before the first real build.
- **Not built or run against a real Module Federation setup in this environment** — the
  `vite.config.ts`/`shell.d.ts` wiring follows `@module-federation/vite`'s documented API, but
  hasn't been confirmed against an actual `npm run dev` + `lms-front` pair. `.github/workflows/ci.yml`
  (added in this change) is meant to be that first real check.

## Migration scope

**Comes from** `lms-library` → `frontend/src/pages/students/{StudentsListPage,StudentFormPage}.tsx`.
**Correction:** this repo's original scope note said "from scratch — no `pages/students`" — that
was wrong; the folder exists in `lms-library` with a working HU-02/HU-03 implementation, and this
migration is a relocation from there, not new work. (Same error, and the same mitigation, that
`ADR-006-repo-per-context-decomposition.md` already calls out as a known risk.)

Consumes the shared HTTP client and session from `lms-front` via Module Federation, per
"Structure" above — done, not a future step anymore.

The full map lives in `library-docs`.

---

## Branching

Three permanent branches. **None of them accepts a direct commit** — you enter through a child
branch and leave through a Pull Request.

```
develop  <--PR--  feat/... fix/... chore/...
qa       <--PR--  qa/...
main     <--PR--  release/...  hotfix/...
```

Promotion happens **by re-application** (`git cherry-pick -x`), never by merging one permanent
branch into another: `merge develop -> qa` and `merge qa -> main` do not exist in this model.

`main` requires **1 approval from `ariel5253`**. On `develop` and `qa` the team sets its own review
rule.

Full policy: `00-governance/branching-policy.md` in `library-docs`.
