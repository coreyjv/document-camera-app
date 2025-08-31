import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: 'https://c53e1463ba6774a19eadd17d04141f22@o4509939221397504.ingest.us.sentry.io/4509939234832384',
  sendDefaultPii: false
})

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
