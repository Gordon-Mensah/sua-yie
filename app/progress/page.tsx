'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Navbar from '../components/Navbar'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type SubjectProgress = {
  id: string
  name: string
  totalSessions: number
  totalScore: number
  bestScore: number
  avgScore: number
}

export default function ProgressPage() {
  const router = useRouter()
  const [progress, setProgress] = useState<SubjectProgress[]>([])
  const [userName, setUserName] = useState('')
  const [loading, setLoading] = useState(true)
  const [totalSessions, setTotalSessions] = useState(0)
  const [totalScore, setTotalScore] = useState(0)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('profiles').select('full_name').eq('id', user.id).single()
      setUserName(profile?.full_name || 'Student')

      const { data: sessions } = await supabase
        .from('sessions')
        .select('score, subject_id, subjects(name)')
        .eq('user_id', user.id)

      if (!sessions) { setLoading(false); return }

      const bySubject: Record<string, SubjectProgress> = {}
      sessions.forEach((s: any) => {
        const sid = s.subject_id
        const name = Array.isArray(s.subjects) ? s.subjects[0]?.name : s.subjects?.name || 'Unknown'
        if (!bySubject[sid]) bySubject[sid] = { id: sid, name, totalSessions: 0, totalScore: 0, bestScore: 0, avgScore: 0 }
        bySubject[sid].totalSessions += 1
        bySubject[sid].totalScore += s.score || 0
        bySubject[sid].bestScore = Math.max(bySubject[sid].bestScore, s.score || 0)
      })

      const result = Object.values(bySubject).map(s => ({
        ...s,
        avgScore: Math.round(s.totalScore / s.totalSessions),
      }))

      setProgress(result)
      setTotalSessions(sessions.length)
      setTotalScore(sessions.reduce((sum: number, s: any) => sum + (s.score || 0), 0))
      setLoading(false)
    }
    load()
  }, [])

  function getStrengthLabel(avg: number) {
    if (avg >= 8) return { label: 'Strong', color: '#006B3F', bg: '#e8f5ee' }
    if (avg >= 5) return { label: 'Developing', color: '#7A5800', bg: '#FEF9E6' }
    return { label: 'Needs work', color: '#7a0010', bg: '#fde8ea' }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#fafaf9' }}>
      <Navbar />
      <div style={{ background: 'var(--green)', padding: '28px 24px 36px' }}>
        <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: 500, marginBottom: '4px' }}>
          Your progress
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
          {loading ? 'Loading...' : `${userName.split(' ')[0]}'s study summary`}
        </p>
      </div>
      <div style={{ height: '4px', background: 'var(--gold)' }} />

      <div style={{ padding: '24px 16px', maxWidth: '600px', margin: '0 auto' }}>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '28px' }}>
          {[
            { label: 'Sessions', value: totalSessions },
            { label: 'Total pts', value: totalScore },
            { label: 'Subjects', value: progress.length },
          ].map(stat => (
            <div key={stat.label} style={{ background: '#fff', border: '0.5px solid #ddd', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
              <p style={{ fontSize: '24px', fontWeight: 500, color: '#111' }}>{stat.value}</p>
              <p style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        <p style={{ fontSize: '12px', color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>
          Performance by subject
        </p>

        {progress.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p style={{ color: '#666', fontSize: '15px', marginBottom: '16px' }}>No sessions yet — start practicing!</p>
            <Link href="/" style={{ background: 'var(--green)', color: '#fff', padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 500 }}>
              Start now
            </Link>
          </div>
        )}

        {progress.map(subj => {
          const strength = getStrengthLabel(subj.avgScore)
          const barWidth = Math.min((subj.avgScore / 10) * 100, 100)
          return (
            <div key={subj.id} style={{ background: '#fff', border: '0.5px solid #ddd', borderRadius: '10px', padding: '16px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                  <p style={{ fontSize: '15px', fontWeight: 500, color: '#111', marginBottom: '2px' }}>{subj.name}</p>
                  <p style={{ fontSize: '12px', color: '#888' }}>{subj.totalSessions} session{subj.totalSessions !== 1 ? 's' : ''}</p>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 500, padding: '4px 10px', borderRadius: '12px', background: strength.bg, color: strength.color }}>
                  {strength.label}
                </span>
              </div>

              <div style={{ height: '6px', background: '#eee', borderRadius: '3px', marginBottom: '10px' }}>
                <div style={{ height: '6px', background: 'var(--green)', borderRadius: '3px', width: `${barWidth}%` }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#666' }}>
                <span>Avg: <strong style={{ color: '#111' }}>{subj.avgScore}</strong></span>
                <span>Best: <strong style={{ color: '#006B3F' }}>{subj.bestScore}</strong></span>
                <span>Total: <strong style={{ color: '#111' }}>{subj.totalScore}</strong></span>
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}