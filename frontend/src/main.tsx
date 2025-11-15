import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import faviconUrl from './assets/icon image/favicon.ico?url'

const ensureFavicon = () => {
  let faviconLink = document.querySelector<HTMLLinkElement>("link[rel~='icon']")

  if (!faviconLink) {
    faviconLink = document.createElement('link')
    faviconLink.rel = 'icon'
    document.head.appendChild(faviconLink)
  }

  faviconLink.type = 'image/x-icon'
  faviconLink.href = faviconUrl
}

ensureFavicon()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

