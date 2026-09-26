// A dynamic import, not a direct one — react/react-router-dom are shared via
// Module Federation (vite.config.ts), and the shared scope only finishes
// initializing across an async boundary. Also fixes a real pre-existing bug:
// App.tsx used react-router-dom without any Router in the tree at all before
// this — BrowserRouter now wraps it in bootstrap.tsx.
import('./bootstrap')
