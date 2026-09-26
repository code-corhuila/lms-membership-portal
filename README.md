# lms-membership-portal

> Membership bounded context: web UI (remote)

Part of the **LMS Library** distributed system — team `lms-library`, Grupo 2.
Governance and documentation live in [`library-docs`](https://github.com/code-corhuila/library-docs).

Implements HU-02 (register student) and HU-03 (search/edit/deactivate student), consuming
`lms-membership-api`'s `/students` endpoints.

## Structure

```
src/
├── pages/students/       → StudentsListPage (HU-03), StudentFormPage (HU-02)
├── components/ui/         → Button, Card — temporary, see note below
├── lib/                     → api.ts (axios), auth.ts (token storage) — temporary, see note below
└── types/                    → Student, ApiError, Paginated, PaginatedMeta
```

**Temporary duplication:** `components/ui` and `lib/` are copied here so this portal can run
standalone (`npm run dev`) before `lms-front` exists. Once `lms-front` exposes its own shared
`lib/api.ts`/`lib/auth.ts` and UI components, this portal must consume those instead of its own
copies — this is exactly the risk ADR-006 flags ("portals reimplementing the hardest part of the
frontend"), so it's deliberately marked, not silently kept.

## Migration scope

**Comes from** `lms-library` → `frontend/src/pages/students/{StudentsListPage,StudentFormPage}.tsx`.
**Correction:** this repo's original scope note said "from scratch — no `pages/students`" — that
was wrong; the folder exists in `lms-library` with a working HU-02/HU-03 implementation, and this
migration is a relocation from there, not new work. (Same error, and the same mitigation, that
`ADR-006-repo-per-context-decomposition.md` already calls out as a known risk.)

Consume the shared HTTP client and session from `lms-front` once that repo exists; do not
re-implement them here long-term (see "Temporary duplication" above).

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
