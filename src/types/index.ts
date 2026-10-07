// Mirrors the Membership-relevant subset of
// library-docs/07-api/contracts/openapi/membership-service.yaml component schemas.

export interface Student {
  id: string
  fullName: string
  documentId: string
  email: string
  phone: string | null
  suspendedUntil: string | null
  deactivatedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface PaginatedMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface Paginated<T> {
  data: T[]
  meta: PaginatedMeta
}
