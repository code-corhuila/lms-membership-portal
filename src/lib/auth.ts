// Minimal session storage — see library-docs/07-api/authentication.md.
// A single Administrator role, no RBAC (library-docs/02-domain/domain-map.md), so there
// is nothing to store beyond "is there a valid token".
//
// Temporary: duplicated here until lms-front exists and exposes a shared
// lib/auth.ts for every portal to consume instead (ADR-006's flagged risk).

const TOKEN_KEY = 'lms.accessToken'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export function isAuthenticated(): boolean {
  return getToken() !== null
}
