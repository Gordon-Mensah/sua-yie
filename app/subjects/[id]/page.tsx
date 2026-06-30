import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data: topics } = await supabase
    .from('topics')
    .select('id, name')
    .eq('subject_id', id)

  return (
    <main style={{ padding: '40px', fontFamily: 'sans-serif', backgroundColor: '#ffffff', color: '#111111', minHeight: '100vh' }}>
      <Link href="/" style={{ color: '#555', textDecoration: 'none' }}>
        ← Back to subjects
      </Link>

      <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '20px 0' }}>
        Topics
      </h1>

      {topics && topics.length === 0 && <p>No topics yet for this subject.</p>}

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {topics?.map((topic) => (
          <li key={topic.id} style={{ marginBottom: '12px' }}>
            <Link
              href={`/topics/${topic.id}`}
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
              {topic.name}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}