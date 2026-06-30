import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Navbar from '../../components/Navbar'

export default async function SubjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: topics } = await supabase
    .from('topics')
    .select('id, name')
    .eq('subject_id', id)

  return (
    <main style={{ minHeight: '100vh', background: '#fafaf9' }}>
      <Navbar />

      <div style={{ padding: '24px 16px' }}>
        <Link href="/" style={{ fontSize: '14px', color: 'var(--green)', fontWeight: 500, display: 'inline-block', marginBottom: '16px' }}>
          ← Back to subjects
        </Link>

        <p style={{ fontSize: '12px', color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>
          Select a topic
        </p>

        {topics?.length === 0 && (
          <p style={{ color: '#666', fontSize: '15px' }}>No topics yet for this subject.</p>
        )}

        {topics?.map((topic) => (
          <Link
            key={topic.id}
            href={`/topics/${topic.id}`}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: '#fff', border: '0.5px solid #ddd',
              borderRadius: '10px', padding: '16px', marginBottom: '10px',
            }}
          >
            <div style={{ fontSize: '16px', fontWeight: 500, color: '#111' }}>{topic.name}</div>
            <span style={{ color: 'var(--green)', fontSize: '20px' }}>›</span>
          </Link>
        ))}
      </div>
    </main>
  )
}