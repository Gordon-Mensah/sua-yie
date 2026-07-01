import { supabase } from '@/lib/supabase'
import Navbar from '../components/Navbar'
import Link from 'next/link'

export default async function LeaderboardPage() {
  const { data: sessions } = await supabase
    .from('sessions')
    .select('user_id, score, profiles(full_name)')

  const totals: Record<string, { name: string; total: number; sessions: number }> = {}

  sessions?.forEach((s: any) => {
    const id = s.user_id
    const name = s.profiles?.full_name || 'Anonymous'
    if (!totals[id]) totals[id] = { name, total: 0, sessions: 0 }
    totals[id].total += s.score || 0
    totals[id].sessions += 1
  })

  const ranked = Object.values(totals)
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)

  const medals = ['🥇', '🥈', '🥉']

  return (
    <main style={{ minHeight: '100vh', background: '#fafaf9' }}>
      <Navbar />
      <div style={{ background: 'var(--green)', padding: '28px 24px 36px' }}>
        <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: 500, marginBottom: '4px' }}>
          Leaderboard
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
          Top 10 students by total score
        </p>
      </div>
      <div style={{ height: '4px', background: 'var(--gold)' }} />

      <div style={{ padding: '24px 16px', maxWidth: '600px', margin: '0 auto' }}>
        {ranked.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p style={{ color: '#666', fontSize: '15px', marginBottom: '16px' }}>
              No scores yet — be the first!
            </p>
            <Link href="/" style={{ background: 'var(--green)', color: '#fff', padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 500 }}>
              Start practicing
            </Link>
          </div>
        )}

        {ranked.map((student, i) => (
          <div
            key={i}
            style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              background: i === 0 ? '#FEF9E6' : '#fff',
              border: i === 0 ? '1.5px solid var(--gold)' : '0.5px solid #ddd',
              borderRadius: '10px', padding: '14px 16px', marginBottom: '10px',
            }}
          >
            <div style={{ fontSize: '22px', width: '32px', textAlign: 'center', flexShrink: 0 }}>
              {medals[i] || `${i + 1}`}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '15px', fontWeight: 500, color: '#111', marginBottom: '2px' }}>
                {student.name}
              </p>
              <p style={{ fontSize: '13px', color: '#888' }}>
                {student.sessions} session{student.sessions !== 1 ? 's' : ''}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '20px', fontWeight: 500, color: 'var(--green)' }}>
                {student.total}
              </p>
              <p style={{ fontSize: '11px', color: '#888' }}>total pts</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}