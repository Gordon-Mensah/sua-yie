import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Navbar from '../../components/Navbar'

export default async function SubjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ mode?: string }>
}) {
  const { id } = await params
  const { mode = 'practice' } = await searchParams

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

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <p style={{ fontSize: '12px', color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Select a topic
          </p>
          <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '12px', background: mode === 'exam' ? '#fde8ea' : '#e8f5ee', color: mode === 'exam' ? '#7a0010' : '#004D2E', fontWeight: 500 }}>
            {mode === 'exam' ? '⏱ Exam mode' : '📖 Practice mode'}
          </span>
        </div>

        {topics?.length === 0 && (
          <p style={{ color: '#666', fontSize: '15px' }}>No topics yet for this subject.</p>
        )}

        {topics?.map((topic) => (
          <Link
            key={topic.id}
            href={`/topics/${topic.id}?mode=${mode}`}
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