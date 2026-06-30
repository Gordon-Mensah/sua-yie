'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Navbar from '../components/Navbar'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Session = {
  id: string
  score: number
  finished_at: string
  subjects: { name: string } | null
}

export default function Dashboard() {
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>([])
  const [userName, setUserName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

      setUserName(profile?.full_name || 'Student')

      const { data: sessionData } = await supabase
        .from('sessions')
        .select('id, score, finished_at, subjects(name)')
        .eq('user_id', user.id)
        .order('finished_at', { ascending: false })
        .limit(20)

      if (sessionData) setSessions(sessionData as Session[])
      setLoading(false)
    }
    load()
  }, [])

  const totalSessions = sessions.length
  const avgScore = totalSessions > 0
    ? Math.round(sessions.reduce((sum, s) => sum + (s.score || 0), 0) / totalSessions)
    : 0

  return (
    <main style={{ minHeight: '100vh', background: '#fafaf9' }}>
      <Navbar />

      <div style={{ background: 'var(--green)', padding: '28px 24px 36px' }}>
        <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: 500, marginBottom: '4px' }}>
          {loading ? 'Loading...' : `Welcome back, ${userName.split(' ')[0]}`}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
          Here's your practice history
        </p>
      </div>

      <div style={{ padding: '24px 16px', maxWidth: '600px', margin: '0 auto' }}>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '28px' }}>
          <div style={{ background: '#fff', border: '0.5px solid #ddd', borderRadius: '10px', padding: '16px' }}>
            <p style={{ fontSize: '12px', color: '#666', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sessions</p>
            <p style={{ fontSize: '28px', fontWeight: 500, color: '#111' }}>{totalSessions}</p>
          </div>
          <div style={{ background: '#fff', border: '0.5px solid #ddd', borderRadius: '10px', padding: '16px' }}>
            <p style={{ fontSize: '12px', color: '#666', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg score</p>
            <p style={{ fontSize: '28px', fontWeight: 500, color: 'var(--green)' }}>{avgScore}</p>
          </div>
        </div>

        <p style={{ fontSize: '12px', color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>
          Recent sessions
        </p>

        {sessions.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p style={{ color: '#666', fontSize: '15px', marginBottom: '16px' }}>No practice sessions yet.</p>
            <Link href="/" style={{ background: 'var(--green)', color: '#fff', padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 500 }}>
              Start practicing
            </Link>
          </div>
        )}

        {sessions.map(session => (
          <div key={session.id} style={{ background: '#fff', border: '0.5px solid #ddd', borderRadius: '10px', padding: '14px 16px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '15px', fontWeight: 500, color: '#111', marginBottom: '4px' }}>
                {session.subjects?.name || 'Unknown subject'}
              </p>
              <p style={{ fontSize: '13px', color: '#888' }}>
                {new Date(session.finished_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
            <div style={{ background: 'var(--green-light)', borderRadius: '8px', padding: '8px 14px', textAlign: 'center' }}>
              <p style={{ fontSize: '16px', fontWeight: 500, color: 'var(--green)' }}>{session.score}</p>
              <p style={{ fontSize: '11px', color: '#555' }}>score</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}