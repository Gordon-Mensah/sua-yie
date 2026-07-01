'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Navbar from './components/Navbar'

type Subject = { id: string; name: string; exam_type: string }

export default function Home() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [filter, setFilter] = useState<'all' | 'wassce' | 'bece'>('all')
  const [mode, setMode] = useState<'practice' | 'exam'>('practice')

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('subjects').select('id, name, exam_type')
      if (data) setSubjects(data)
    }
    load()
  }, [])

  const filtered = subjects.filter(s =>
    filter === 'all' ? true : s.exam_type === filter || s.exam_type === 'both'
  )

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '8px 18px', borderRadius: '20px', fontSize: '14px', fontWeight: 500,
    border: 'none', cursor: 'pointer',
    background: active ? 'var(--gold)' : 'rgba(255,255,255,0.15)',
    color: active ? '#3D2B00' : '#fff',
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
          WASSCE and BECE practice, built for Ghanaian students.
        </p>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {(['all', 'wassce', 'bece'] as const).map(f => (
            <button key={f} style={tabStyle(filter === f)} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All subjects' : f.toUpperCase()}
            </button>
          ))}
        </div>

        <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '10px', padding: '4px', display: 'flex', marginBottom: '0' }}>
          <button style={modeStyle(mode === 'practice')} onClick={() => setMode('practice')}>
            📖 Practice mode
          </button>
          <button style={modeStyle(mode === 'exam')} onClick={() => setMode('exam')}>
            ⏱ Exam mode
          </button>
        </div>

        <div style={{ padding: '10px 0 16px', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
          {mode === 'practice'
            ? 'No timer — take your time and learn at your own pace'
            : 'Timed — 60 seconds per question, just like the real exam'}
        </div>
      </div>
      <div style={{ height: '4px', background: 'var(--gold)' }} />

      <div style={{ padding: '24px 16px' }}>
        <p style={{ fontSize: '12px', color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>
          {filtered.length} subject{filtered.length !== 1 ? 's' : ''} available
        </p>

        {filtered.length === 0 && (
          <p style={{ color: '#888', fontSize: '15px' }}>No subjects found for this filter.</p>
        )}

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
      </div>
    </main>
  )
}