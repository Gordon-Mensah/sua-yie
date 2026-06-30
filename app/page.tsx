import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default async function Home() {
  const { data: subjects } = await supabase
    .from('subjects')
    .select('id, name')

  return (
    <main style={{ padding: '40px', fontFamily: 'sans-serif', backgroundColor: '#ffffff', color: '#111111', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>Sua Yie</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/login" style={{ padding: '8px 16px', border: '1px solid #ddd', borderRadius: '8px', textDecoration: 'none', color: '#111', fontSize: '14px' }}>
            Log in
          </Link>
          <Link href="/signup" style={{ padding: '8px 16px', backgroundColor: '#111', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '14px' }}>
            Sign up
          </Link>
        </div>
      </div>

      <p style={{ marginBottom: '20px', color: '#555' }}>
        Choose a subject to start practicing
      </p>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {subjects?.map((subject) => (
          <li key={subject.id} style={{ marginBottom: '12px' }}>
            <Link
              href={`/subjects/${subject.id}`}
              style={{
                display: 'block',
                padding: '16px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                textDecoration: 'none',
                color: '#111',
                fontWeight: 600,
              }}
            >
              {subject.name}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}