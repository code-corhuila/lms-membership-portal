import { Navigate, useRoutes } from 'react-router-dom'

import { membershipRoutes } from './routes'

// Standalone route tree for previewing this portal in isolation
// (`npm run dev`, without lms-front running). Reuses routes.tsx — the exact
// same route objects lms-front's shell composes as a remote — so the two
// never drift apart. Only useful for visual preview: without the shell,
// shell/apiClient and shell/session aren't resolvable at all
// (@module-federation/vite needs the container's dev server running to
// resolve them), so every page here fails its data calls until the
// container is also running (`npm run dev` in lms-front, on port 3000).
function App() {
  const element = useRoutes([...membershipRoutes, { path: '*', element: <Navigate to="/" replace /> }])
  return element
}

export default App
