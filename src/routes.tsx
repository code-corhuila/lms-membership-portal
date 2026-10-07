import type { RouteObject } from 'react-router-dom'

import { StudentFormPage } from './pages/students/StudentFormPage'
import { StudentsListPage } from './pages/students/StudentsListPage'

// Exposed to lms-front via Module Federation (vite.config.ts's
// federation({ exposes })). Paths are relative to wherever the shell mounts
// this portal (today, /students/*) — this portal doesn't know or care what
// that prefix is, per rules/2-anexos/H-front.md.
export const membershipRoutes: RouteObject[] = [
  { index: true, element: <StudentsListPage /> },
  { path: 'new', element: <StudentFormPage /> },
]
