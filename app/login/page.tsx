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
    if (error) {
      setError(error.message)
    } else {
      router.push('/')
    }
    setLoading(false)
  }

  return (
    <main style={{ padding: '40px', fontFamily: 'sans-serif', backgroundColor: '#fff', color: '#111', minHeight: '100vh', maxWidth: '400px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Welcome back</h1>
      <p style={{ color: '#555', marginBottom: '24px' }}>Log in to continue studying</p>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: 'block', width: '100%', padding: '12px', marginBottom: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: 'block', width: '100%', padding: '12px', marginBottom: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}
      />

      {error && <p style={{ color: 'red', marginBottom: '12px' }}>{error}</p>}

      <button
        onClick={handleLogin}
        disabled={loading}
        style={{ display: 'block', width: '100%', padding: '14px', backgroundColor: '#111', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', marginBottom: '16px' }}
      >
        {loading ? 'Logging in...' : 'Log in'}
      </button>

      <p style={{ color: '#555' }}>
        Don't have an account?{' '}
        <Link href="/signup" style={{ color: '#111', fontWeight: 600 }}>Sign up</Link>
      </p>
    </main>
  )
}