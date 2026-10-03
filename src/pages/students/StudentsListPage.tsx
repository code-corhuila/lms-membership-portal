import { type FormEvent, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { apiClient, type ShellError } from 'shell/apiClient'
import type { Paginated, Student } from '../../types'

type ViewState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'empty' }
  | { status: 'data'; students: Student[] }

type EditFieldErrors = Partial<Record<'fullName' | 'email' | 'phone', string>>

// Implements HU-03 (library-docs/04-requirements/user-stories.md):
// "As the administrator, I want to search, edit, or deactivate student records."
//
// Four states, per rules/2-anexos/H-front.md — loading, error with retry,
// empty, and data — instead of overlaying a red banner on whatever was on
// screen before, which leaves a stale table under a floating error message.
export function StudentsListPage() {
  const [view, setView] = useState<ViewState>({ status: 'loading' })
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ fullName: '', email: '', phone: '' })
  const [editFieldErrors, setEditFieldErrors] = useState<EditFieldErrors>({})
  const [editError, setEditError] = useState<string | null>(null)

  // Rules/2-anexos/H-front.md: "Una petición más nueva reemplaza a la
  // anterior" — a slow response from an older search must never overwrite a
  // faster response from a newer one.
  const latestRequestId = useRef(0)

  async function load(query: string) {
    const requestId = ++latestRequestId.current
    setView({ status: 'loading' })
    try {
      const { data } = await apiClient.get<Paginated<Student>>('/students', { params: { search: query } })
      if (requestId !== latestRequestId.current) return
      setView(data.data.length === 0 ? { status: 'empty' } : { status: 'data', students: data.data })
    } catch (err) {
      if (requestId !== latestRequestId.current) return
      const shellError = err as ShellError
      setView({ status: 'error', message: shellError.message ?? 'Unable to load students.' })
    }
  }

  useEffect(() => {
    load('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleSearch(event: FormEvent) {
    event.preventDefault()
    load(search)
  }

  function startEdit(student: Student) {
    setEditingId(student.id)
    setEditForm({ fullName: student.fullName, email: student.email, phone: student.phone ?? '' })
    setEditFieldErrors({})
    setEditError(null)
  }

  async function saveEdit(id: string) {
    setEditFieldErrors({})
    setEditError(null)
    try {
      await apiClient.patch(`/students/${id}`, editForm)
      setEditingId(null)
      load(search)
    } catch (err) {
      const shellError = err as ShellError
      if (shellError.details?.length) {
        const next: EditFieldErrors = {}
        for (const detail of shellError.details) {
          if (detail.field in ({ fullName: 0, email: 0, phone: 0 } satisfies Record<string, 0>)) {
            next[detail.field as keyof EditFieldErrors] = detail.message
          }
        }
        setEditFieldErrors(next)
      }
      setEditError(shellError.message ?? 'Unable to update the student.')
    }
  }

  async function deactivate(id: string) {
    if (!window.confirm('Deactivate this student? This is blocked if they have active loans or a suspension.')) {
      return
    }
    try {
      await apiClient.post(`/students/${id}/deactivate`)
      load(search)
    } catch {
      // Refreshing the list surfaces the real state either way; a toast
      // system doesn't exist yet in this shell (declared gap, README).
      load(search)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Students</h1>
          <p className="text-sm text-slate-500">Search, register, edit, and deactivate student records.</p>
        </div>
        <Link to="new">
          <Button>Register student</Button>
        </Link>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or document ID"
          className="w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
        />
        <Button type="submit" variant="secondary">Search</Button>
      </form>

      {view.status === 'loading' && (
        <Card className="p-6 text-center text-sm text-slate-400">Loading students…</Card>
      )}

      {view.status === 'error' && (
        <Card className="space-y-3 p-6 text-center">
          <p role="alert" className="text-sm text-error-600">{view.message}</p>
          <Button variant="secondary" onClick={() => load(search)}>Try again</Button>
        </Card>
      )}

      {view.status === 'empty' && (
        <Card className="p-6 text-center text-sm text-slate-400">No students found.</Card>
      )}

      {view.status === 'data' && (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Document ID</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {view.students.map((s) => (
                <tr key={s.id}>
                  {editingId === s.id ? (
                    <>
                      <td className="px-4 py-2 align-top">
                        <input
                          value={editForm.fullName}
                          onChange={(e) => setEditForm((f) => ({ ...f, fullName: e.target.value }))}
                          aria-invalid={Boolean(editFieldErrors.fullName)}
                          aria-describedby={editFieldErrors.fullName ? `fullName-error-${s.id}` : undefined}
                          className="w-full rounded border border-slate-300 px-2 py-1"
                        />
                        {editFieldErrors.fullName && (
                          <p id={`fullName-error-${s.id}`} role="alert" className="mt-1 text-xs text-error-600">
                            {editFieldErrors.fullName}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-2 text-slate-500">{s.documentId}</td>
                      <td className="px-4 py-2 align-top">
                        <input
                          value={editForm.email}
                          onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                          aria-invalid={Boolean(editFieldErrors.email)}
                          aria-describedby={editFieldErrors.email ? `email-error-${s.id}` : undefined}
                          className="w-full rounded border border-slate-300 px-2 py-1"
                        />
                        {editFieldErrors.email && (
                          <p id={`email-error-${s.id}`} role="alert" className="mt-1 text-xs text-error-600">
                            {editFieldErrors.email}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-2 text-slate-500">—</td>
                      <td className="px-4 py-2 align-top">
                        <div className="flex gap-2">
                          <Button onClick={() => saveEdit(s.id)}>Save</Button>
                          <Button variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                        </div>
                        {editError && (
                          <p role="alert" className="mt-1 text-xs text-error-600">{editError}</p>
                        )}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3">{s.fullName}</td>
                      <td className="px-4 py-3 text-slate-500">{s.documentId}</td>
                      <td className="px-4 py-3 text-slate-500">{s.email}</td>
                      <td className="px-4 py-3">
                        {s.deactivatedAt ? (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">Deactivated</span>
                        ) : s.suspendedUntil ? (
                          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-warning-500">Suspended</span>
                        ) : (
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-success-600">Active</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button variant="ghost" onClick={() => startEdit(s)}>Edit</Button>
                          {!s.deactivatedAt && (
                            <Button variant="danger" onClick={() => deactivate(s.id)}>Deactivate</Button>
                          )}
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
