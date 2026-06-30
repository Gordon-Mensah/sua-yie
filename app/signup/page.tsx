'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignup() {
    setLoading(true)
    setError('')
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: fullName,
      })
    }
    router.push('/')
    setLoading(false)
  }

  return (
    <main style={{ padding: '40px', fontFamily: 'sans-serif', backgroundColor: '#fff', color: '#111', minHeight: '100vh', maxWidth: '400px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Create account</h1>
      <p style={{ color: '#555', marginBottom: '24px' }}>Start practicing for free</p>

      <input
        type="text"
        placeholder="Full name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        style={{ display: 'block', width: '100%', padding: '12px', marginBottom: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}
      />
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
        onClick={handleSignup}
        disabled={loading}
        style={{ display: 'block', width: '100%', padding: '14px', backgroundColor: '#111', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', marginBottom: '16px' }}
      >
        {loading ? 'Creating account...' : 'Sign up'}
      </button>

      <p style={{ color: '#555' }}>
        Already have an account?{' '}
        <Link href="/login" style={{ color: '#111', fontWeight: 600 }}>Log in</Link>
      </p>
    </main>
  )
}