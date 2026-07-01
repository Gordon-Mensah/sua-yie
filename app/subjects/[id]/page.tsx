'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Navbar from '../../components/Navbar'

type Topic = { id: string; name: string }

export default function SubjectPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const id = params.id as string
  const mode = searchParams.get('mode') || 'practice'

  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [downloaded, setDownloaded] = useState<Record<string, boolean>>({})
  const [downloading, setDownloading] = useState<Record<string, boolean>>({})
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    setIsOffline(!navigator.onLine)
    window.addEventListener('online', () => setIsOffline(false))
    window.addEventListener('offline', () => setIsOffline(true))
  }, [])

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data } = await supabase
        .from('topics')
        .select('id, name')
        .eq('subject_id', id)
      if (data) {
        setTopics(data)
        const status: Record<string, boolean> = {}
        data.forEach((t: Topic) => {
          const cached = localStorage.getItem(`sua-yie-topic-${t.id}`)
          status[t.id] = !!cached
        })
        setDownloaded(status)
      }
      setLoading(false)
    }
    load()
  }, [id])

  async function handleDownload(topicId: string, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setDownloading(prev => ({ ...prev, [topicId]: true }))
    const { data } = await supabase
      .from('questions')
      .select('*')
      .eq('topic_id', topicId)
    if (data) {
      localStorage.setItem(`sua-yie-topic-${topicId}`, JSON.stringify(data))
      setDownloaded(prev => ({ ...prev, [topicId]: true }))
    }
    setDownloading(prev => ({ ...prev, [topicId]: false }))
  }

  if (loading) return (
    <main style={{ minHeight: '100vh', background: '#fafaf9' }}>
      <Navbar />
      <div style={{ padding: '60px 24px', textAlign: 'center' }}>
        <p style={{ color: '#666', fontSize: '15px' }}>Loading...</p>
      </div>
    </main>
  )

  return (
    <main style={{ minHeight: '100vh', background: '#fafaf9' }}>
      <Navbar />

      {isOffline && (
        <div style={{ background: '#FEF9E6', borderBottom: '1px solid #FCD116', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px' }}>📵</span>
          <p style={{ fontSize: '13px', color: '#7A5800', fontWeight: 500 }}>
            You're offline — only downloaded topics are available
          </p>
        </div>
      )}

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

        {topics.length === 0 && (
          <p style={{ color: '#666', fontSize: '15px' }}>No topics yet for this subject.</p>
        )}

        {topics.map((topic) => {
          const isDownloaded = downloaded[topic.id]
          const isDownloading = downloading[topic.id]
          const isLocked = isOffline && !isDownloaded

          return (
            <div
              key={topic.id}
              style={{ marginBottom: '10px', opacity: isLocked ? 0.4 : 1 }}
            >
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: '#fff', border: '0.5px solid #ddd',
                borderRadius: '10px', padding: '14px 16px',
              }}>
                <Link
                  href={isLocked ? '#' : `/topics/${topic.id}?mode=${mode}`}
                  style={{ flex: 1, textDecoration: 'none' }}
                >
                  <div style={{ fontSize: '16px', fontWeight: 500, color: '#111' }}>{topic.name}</div>
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '3px' }}>
                    {isDownloaded ? '✓ Available offline' : 'Needs internet to play'}
                  </div>
                </Link>

                <button
                  onClick={(e) => handleDownload(topic.id, e)}
                  disabled={isDownloaded || isDownloading}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    padding: '7px 12px', borderRadius: '7px', border: 'none',
                    background: isDownloaded ? '#f0f0f0' : '#e8f5ee',
                    color: isDownloaded ? '#888' : '#006B3F',
                    fontSize: '12px', fontWeight: 500,
                    cursor: isDownloaded ? 'default' : 'pointer',
                    marginLeft: '10px', flexShrink: 0,
                  }}
                >
                  {isDownloading ? '...' : isDownloaded ? '✓ Saved' : '↓ Save'}
                </button>
              </div>
            </div>
          )
        })}

        {isOffline && topics.every(t => !downloaded[t.id]) && (
          <div style={{ textAlign: 'center', padding: '30px 0', color: '#888', fontSize: '14px' }}>
            No topics downloaded yet. Connect to the internet to download topics for offline use.
          </div>
        )}
      </div>
    </main>
  )
}