import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Navbar from './components/Navbar'

export default async function Home() {
  const { data: subjects } = await supabase
    .from('subjects')
    .select('id, name')

  return (
    <main style={{ minHeight: '100vh', background: '#fafaf9' }}>
      <Navbar />

      <div style={{ background: 'var(--green)', padding: '28px 24px 36px' }}>
        <h1 style={{ color: '#fff', fontSize: '26px', fontWeight: 500, marginBottom: '8px' }}>
          Study smart, pass well.
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '15px', lineHeight: 1.6 }}>
          WASSCE and BECE practice, built for Ghanaian students.
        </p>
      </div>

      <div style={{ padding: '24px 16px' }}>
        <p style={{ fontSize: '12px', color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>
          Choose a subject
        </p>

        {subjects?.map((subject, i) => (
          <Link
            key={subject.id}
            href={`/subjects/${subject.id}`}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: '#fff', border: '0.5px solid #ddd',
              borderLeft: i === 0 ? '3px solid var(--gold)' : '0.5px solid #ddd',
              borderRadius: '10px', padding: '16px', marginBottom: '10px',
            }}
          >
            <div style={{ fontSize: '16px', fontWeight: 500, color: '#111' }}>{subject.name}</div>
            <span style={{ color: 'var(--green)', fontSize: '20px' }}>›</span>
          </Link>
        ))}
      </div>
    </main>
  )
}