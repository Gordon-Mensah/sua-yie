import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default async function Home() {
  const { data: subjects, error } = await supabase
    .from('subjects')
    .select('id, name')

  return (
    <main style={{ padding: '40px', fontFamily: 'sans-serif', backgroundColor: '#ffffff', color: '#111111', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px' }}>
        Sua Yie
      </h1>
      <p style={{ marginBottom: '20px', color: '#555' }}>
        Choose a subject to start practicing
      </p>

      {error && <p style={{ color: 'red' }}>Error loading subjects: {error.message}</p>}

      {subjects && subjects.length === 0 && (
        <p>No subjects yet — add some in Supabase!</p>
      )}

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