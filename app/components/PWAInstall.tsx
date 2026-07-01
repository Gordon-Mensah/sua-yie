'use client'

import { useEffect, useState } from 'react'

export default function PWAInstall() {
  const [prompt, setPrompt] = useState<any>(null)
  const [show, setShow] = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('pwa-dismissed')) return

    const handler = (e: any) => {
      e.preventDefault()
      setPrompt(e)
      setShow(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setInstalled(true))

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleInstall() {
    if (!prompt) return
    prompt.prompt()
    const result = await prompt.userChoice
    if (result.outcome === 'accepted') setInstalled(true)
    setShow(false)
  }

  function handleDismiss() {
    localStorage.setItem('pwa-dismissed', '1')
    setShow(false)
  }

  if (!show || installed) return null

  return (
    <div style={{
      background: '#004D2E', padding: '12px 16px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px'
    }}>
      <div>
        <p style={{ color: '#fff', fontSize: '14px', fontWeight: 500, marginBottom: '2px' }}>
          Install Sua Yie
        </p>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
          Study offline — no internet needed after install
        </p>
      </div>
      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        <button
          onClick={handleDismiss}
          style={{ padding: '7px 12px', background: 'transparent', border: '1.5px solid rgba(255,255,255,0.4)', color: '#fff', borderRadius: '7px', fontSize: '13px', cursor: 'pointer' }}
        >
          Not now
        </button>
        <button
          onClick={handleInstall}
          style={{ padding: '7px 14px', background: '#FCD116', color: '#3D2B00', border: 'none', borderRadius: '7px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}
        >
          Install
        </button>
      </div>
    </div>
  )
}