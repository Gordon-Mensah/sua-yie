'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [examType, setExamType] = useState<'wassce' | 'bece' | ''>('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignup() {
    if (!examType) { setError('Please select your exam type.'); return }
    setLoading(true)
    setError('')
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: fullName,
        exam_type: examType,
      })
    }
    router.push('/')
  }

  const examCardStyle = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '16px', border: active ? '2px solid var(--green)' : '1.5px solid #ddd',
    borderRadius: '10px', textAlign: 'center', cursor: 'pointer',
    background: active ? '#e8f5ee' : '#fff',
  })

  return (
    <main style={{ minHeight: '100vh', background: '#fafaf9' }}>
      <nav style={{ background: 'var(--green)', padding: '16px 24px' }}>
        <Link href="/" style={{ color: '#fff', fontSize: '18px', fontWeight: 500 }}>
          Sua <span style={{ color: 'var(--gold)' }}>Yie</span>
        </Link>
      </nav>
      <div style={{ height: '4px', background: 'var(--gold)' }} />

      <div style={{ padding: '40px 24px', maxWidth: '420px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 500, color: '#111', marginBottom: '6px' }}>Create account</h1>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '28px' }}>Start practicing for free</p>

        <label style={{ fontSize: '13px', color: '#555', display: 'block', marginBottom: '8px', fontWeight: 500 }}>
          Which exam are you preparing for?
        </label>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <div style={examCardStyle(examType === 'wassce')} onClick={() => setExamType('wassce')}>
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>🎓</div>
            <div style={{ fontSize: '15px', fontWeight: 500, color: '#111' }}>WASSCE</div>
            <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>Senior High School</div>
          </div>
          <div style={examCardStyle(examType === 'bece')} onClick={() => setExamType('bece')}>
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>📚</div>
            <div style={{ fontSize: '15px', fontWeight: 500, color: '#111' }}>BECE</div>
            <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>Junior High School</div>
          </div>
        </div>

        <input type="text" placeholder="Full name" value={fullName}
          onChange={e => setFullName(e.target.value)}
          style={{ display: 'block', width: '100%', padding: '13px 14px', marginBottom: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '15px', color: '#111', background: '#fff' }}
        />
        <input type="email" placeholder="Email" value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ display: 'block', width: '100%', padding: '13px 14px', marginBottom: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '15px', color: '#111', background: '#fff' }}
        />
        <input type="password" placeholder="Password" value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ display: 'block', width: '100%', padding: '13px 14px', marginBottom: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '15px', color: '#111', background: '#fff' }}
        />

        {error && <p style={{ color: '#CE1126', fontSize: '14px', marginBottom: '12px' }}>{error}</p>}

        <button onClick={handleSignup} disabled={loading}
          style={{ display: 'block', width: '100%', padding: '14px', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 500, marginBottom: '18px', cursor: 'pointer' }}
        >
          {loading ? 'Creating account...' : 'Sign up'}
        </button>

        <p style={{ fontSize: '14px', color: '#555', textAlign: 'center' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--green)', fontWeight: 500 }}>Log in</Link>
        </p>
      </div>
    </main>
  )
}