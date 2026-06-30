'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else router.push('/')
  }

  return (
    <main style={{ minHeight: '100vh', background: '#fafaf9' }}>
      <nav style={{ background: 'var(--green)', padding: '16px 24px' }}>
        <Link href="/" style={{ color: '#fff', fontSize: '18px', fontWeight: 500 }}>
          Sua <span style={{ color: 'var(--gold)' }}>Yie</span>
        </Link>
      </nav>
      <div style={{ height: '4px', background: 'var(--gold)' }} />

      <div style={{ padding: '40px 24px', maxWidth: '420px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 500, color: '#111', marginBottom: '6px' }}>Welcome back</h1>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '28px' }}>Log in to continue studying</p>

        <input type="email" placeholder="Email" value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ display: 'block', width: '100%', padding: '13px 14px', marginBottom: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '15px', color: '#111', background: '#fff' }}
        />
        <input type="password" placeholder="Password" value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ display: 'block', width: '100%', padding: '13px 14px', marginBottom: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '15px', color: '#111', background: '#fff' }}
        />

        {error && <p style={{ color: '#CE1126', fontSize: '14px', marginBottom: '12px' }}>{error}</p>}

        <button onClick={handleLogin} disabled={loading}
          style={{ display: 'block', width: '100%', padding: '14px', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 500, marginBottom: '18px' }}
        >
          {loading ? 'Logging in...' : 'Log in'}
        </button>

        <p style={{ fontSize: '14px', color: '#555', textAlign: 'center' }}>
          Don't have an account?{' '}
          <Link href="/signup" style={{ color: 'var(--green)', fontWeight: 500 }}>Sign up</Link>
        </p>
      </div>
    </main>
  )
}