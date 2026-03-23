import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { Toaster } from 'sonner'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          className: '!rounded-lg !border !border-zinc-800 !bg-zinc-900 !text-[13px] !text-zinc-50 !font-sans select-none',
        }}
      />
    </BrowserRouter>
  </StrictMode>,
)
