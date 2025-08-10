import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// React Query provider is already set inside App.tsx

createRoot(document.getElementById("root")!).render(
  <App />
);
