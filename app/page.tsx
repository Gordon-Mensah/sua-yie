'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Navbar from './components/Navbar'

type Subject = { id: string; name: string; exam_type: string }
type Profile = { full_name: string; exam_type: string }

export default function Home() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)
  const [mode, setMode] = useState<'practice' | 'exam'>('practice')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        setLoggedIn(true)
        const { data: prof } = await supabase
          .from('profiles')
          .select('full_name, exam_type')
          .eq('id', user.id)
          .single()
        setProfile(prof)
      } else {
        setLoggedIn(false)
      }

      const { data } = await supabase.from('subjects').select('id, name, exam_type')
      if (data) setSubjects(data)
    }
    load()
  }, [])

  const filtered = subjects.filter(s => {
    if (!profile) return true
    return s.exam_type === profile.exam_type || s.exam_type === 'both'
  })

  const modeStyle = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '10px', borderRadius: '8px', fontSize: '14px', fontWeight: 500,
    border: 'none', cursor: 'pointer',
    background: active ? '#fff' : 'transparent',
    color: active ? 'var(--green)' : 'rgba(255,255,255,0.7)',
  })

  return (
    <main style={{ minHeight: '100vh', background: '#fafaf9' }}>
      <Navbar />

      <div style={{ background: 'var(--green)', padding: '24px 24px 0' }}>
        <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: 500, marginBottom: '4px' }}>
          Study smart, pass well.
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', marginBottom: '20px' }}>
          {profile
            ? `${profile.exam_type.toUpperCase()} practice, built for Ghanaian students.`
            : 'WASSCE and BECE practice, built for Ghanaian students.'}
        </p>

        {loggedIn && (
          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '10px', padding: '4px', display: 'flex', marginBottom: '0' }}>
            <button style={modeStyle(mode === 'practice')} onClick={() => setMode('practice')}>
              📖 Practice mode
            </button>
            <button style={modeStyle(mode === 'exam')} onClick={() => setMode('exam')}>
              ⏱ Exam mode
            </button>
          </div>
        )}

        <div style={{ padding: '10px 0 16px', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
          {loggedIn
            ? mode === 'practice'
              ? 'No timer — take your time and learn at your own pace'
              : 'Timed — 60 seconds per question, just like the real exam'
            : 'Log in or sign up to start practicing'}
        </div>
      </div>
      <div style={{ height: '4px', background: 'var(--gold)' }} />

      <div style={{ padding: '24px 16px' }}>
        {loggedIn === false ? (
          <div style={{ textAlign: 'center', padding: '40px 16px' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>📖</div>
            <h2 style={{ fontSize: '18px', fontWeight: 500, color: '#111', marginBottom: '8px' }}>
              Ready to start practicing?
            </h2>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px', lineHeight: 1.6 }}>
              Create a free account to access all subjects, track your scores, and see how you rank.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/signup" style={{ padding: '13px 28px', background: 'var(--green)', color: '#fff', borderRadius: '8px', fontSize: '15px', fontWeight: 500 }}>
                Sign up free
              </Link>
              <Link href="/login" style={{ padding: '13px 28px', background: '#fff', color: '#111', border: '1px solid #ddd', borderRadius: '8px', fontSize: '15px', fontWeight: 500 }}>
                Log in
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <p style={{ fontSize: '12px', color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {filtered.length} subject{filtered.length !== 1 ? 's' : ''} available
              </p>
              {profile && (
                <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '12px', background: '#e8f5ee', color: '#004D2E', fontWeight: 500 }}>
                  {profile.exam_type.toUpperCase()}
                </span>
              )}
            </div>

            {filtered.map((subject, i) => (
              <Link
                key={subject.id}
                href={`/subjects/${subject.id}?mode=${mode}`}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: '#fff', border: '0.5px solid #ddd',
                  borderLeft: i === 0 ? '3px solid var(--gold)' : '0.5px solid #ddd',
                  borderRadius: '10px', padding: '16px', marginBottom: '10px',
                }}
              >
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 500, color: '#111' }}>{subject.name}</div>
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '2px', textTransform: 'uppercase' }}>
                    {subject.exam_type === 'both' ? 'WASSCE & BECE' : subject.exam_type}
                  </div>
                </div>
                <span style={{ color: 'var(--green)', fontSize: '20px' }}>›</span>
              </Link>
            ))}
          </>
        )}
      </div>
    </main>
  )
}