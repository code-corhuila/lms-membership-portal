import { Navigate, Route, Routes } from 'react-router-dom'

import { StudentFormPage } from './pages/students/StudentFormPage'
import { StudentsListPage } from './pages/students/StudentsListPage'

// Standalone route tree for previewing this portal in isolation. Once
// lms-front exists, this portal is composed as a remote into its shell
// instead of being run standalone — see the repo's README migration scope.
function App() {
  return (
    <Routes>
      <Route path="/students" element={<StudentsListPage />} />
      <Route path="/students/new" element={<StudentFormPage />} />
      <Route path="*" element={<Navigate to="/students" replace />} />
    </Routes>
  )
}

export default App
