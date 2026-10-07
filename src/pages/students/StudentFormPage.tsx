import { type FormEvent, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { apiClient, type ShellError } from 'shell/apiClient'

type FieldErrors = Partial<Record<'fullName' | 'documentId' | 'email' | 'phone', string>>

// Implements HU-02 (library-docs/04-requirements/user-stories.md):
// "As the administrator, I want to register new students... so that they are
// enabled in the system and can be linked to book loans."
export function StudentFormPage() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [documentId, setDocumentId] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // One key for this whole registration intent, reused on every retry of the
  // same submit — rules/2-anexos/H-front.md: "Idempotency-Key por intención,
  // reutilizada al reintentar". A new key only if the administrator
  // navigates here again (a new component instance, a new intent).
  const idempotencyKey = useRef(crypto.randomUUID())

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(null)
    setFieldErrors({})
    setIsSubmitting(true)
    try {
      await apiClient.post(
        '/students',
        { fullName, documentId, email, phone: phone || undefined },
        { headers: { 'Idempotency-Key': idempotencyKey.current } },
      )
      navigate('/students')
    } catch (err) {
      const shellError = err as ShellError
      if (shellError.details?.length) {
        const next: FieldErrors = {}
        for (const detail of shellError.details) {
          if (detail.field in ({ fullName: 0, documentId: 0, email: 0, phone: 0 } satisfies Record<string, 0>)) {
            next[detail.field as keyof FieldErrors] = detail.message
          }
        }
        setFieldErrors(next)
      }
      setFormError(shellError.message ?? 'Unable to register the student. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Register student</h1>
        <p className="text-sm text-slate-500">HU-02 — enables the student to be linked to loans.</p>
      </div>

      <Card>
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-slate-700">
              Full name
            </label>
            <input
              id="fullName"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              aria-invalid={Boolean(fieldErrors.fullName)}
              aria-describedby={fieldErrors.fullName ? 'fullName-error' : undefined}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
            {fieldErrors.fullName && (
              <p id="fullName-error" role="alert" className="mt-1 text-sm text-error-600">
                {fieldErrors.fullName}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="documentId" className="mb-1 block text-sm font-medium text-slate-700">
              Document ID
            </label>
            <input
              id="documentId"
              required
              value={documentId}
              onChange={(e) => setDocumentId(e.target.value)}
              aria-invalid={Boolean(fieldErrors.documentId)}
              aria-describedby={fieldErrors.documentId ? 'documentId-error' : undefined}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
            {fieldErrors.documentId && (
              <p id="documentId-error" role="alert" className="mt-1 text-sm text-error-600">
                {fieldErrors.documentId}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? 'email-error' : undefined}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
            {fieldErrors.email && (
              <p id="email-error" role="alert" className="mt-1 text-sm text-error-600">
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-medium text-slate-700">
              Phone <span className="text-slate-400">(optional)</span>
            </label>
            <input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              aria-invalid={Boolean(fieldErrors.phone)}
              aria-describedby={fieldErrors.phone ? 'phone-error' : undefined}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
            {fieldErrors.phone && (
              <p id="phone-error" role="alert" className="mt-1 text-sm text-error-600">
                {fieldErrors.phone}
              </p>
            )}
          </div>

          {formError && (
            <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-error-600">
              {formError}
            </p>
          )}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => navigate('/students')} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Register student
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
