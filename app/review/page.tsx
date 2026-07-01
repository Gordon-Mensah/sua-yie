'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Navbar from '../components/Navbar'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type WrongAnswer = {
  id: string
  selected_option: string
  created_at: string
  questions: {
    question_text: string
    option_a: string
    option_b: string
    option_c: string
    option_d: string
    correct_option: string
    explanation: string | null
    topics: { name: string } | null
  } | null
}

export default function ReviewPage() {
  const router = useRouter()
  const [wrongAnswers, setWrongAnswers] = useState<WrongAnswer[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data } = await supabase
        .from('wrong_answers')
        .select(`
          id,
          selected_option,
          created_at,
          questions (
            question_text,
            option_a,
            option_b,
            option_c,
            option_d,
            correct_option,
            explanation,
            topics ( name )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (data) setWrongAnswers(data as WrongAnswer[])
      setLoading(false)
    }
    load()
  }, [])

  function getOption(q: NonNullable<WrongAnswer['questions']>, key: string) {
    if (key === 'A') return q.option_a
    if (key === 'B') return q.option_b
    if (key === 'C') return q.option_c
    return q.option_d
  }

  return (
    <main style={{ minHeight: '100vh', background: '#fafaf9' }}>
      <Navbar />
      <div style={{ background: 'var(--green)', padding: '28px 24px 36px' }}>
        <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: 500, marginBottom: '4px' }}>
          Wrong answer review
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
          Questions you got wrong — study these carefully
        </p>
      </div>
      <div style={{ height: '4px', background: 'var(--gold)' }} />

      <div style={{ padding: '24px 16px', maxWidth: '640px', margin: '0 auto' }}>

        {loading && (
          <p style={{ color: '#666', fontSize: '15px', textAlign: 'center', padding: '40px 0' }}>
            Loading...
          </p>
        )}

        {!loading && wrongAnswers.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
            <h2 style={{ fontSize: '18px', fontWeight: 500, color: '#111', marginBottom: '8px' }}>
              No wrong answers yet!
            </h2>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>
              Complete a quiz to see questions you got wrong here.
            </p>
            <Link href="/" style={{ background: 'var(--green)', color: '#fff', padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 500 }}>
              Start practicing
            </Link>
          </div>
        )}

        {!loading && wrongAnswers.length > 0 && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <p style={{ fontSize: '12px', color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {wrongAnswers.length} question{wrongAnswers.length !== 1 ? 's' : ''} to review
              </p>
              <Link href="/" style={{ fontSize: '13px', color: 'var(--green)', fontWeight: 500 }}>
                Practice now →
              </Link>
            </div>

            {wrongAnswers.map((wa) => {
              const q = wa.questions
              if (!q) return null
              const isOpen = expanded === wa.id

              return (
                <div
                  key={wa.id}
                  style={{ background: '#fff', border: '0.5px solid #ddd', borderRadius: '10px', marginBottom: '10px', overflow: 'hidden' }}
                >
                  <button
                    onClick={() => setExpanded(isOpen ? null : wa.id)}
                    style={{
                      width: '100%', textAlign: 'left', padding: '14px 16px',
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                        {Array.isArray(q.topics) ? q.topics[0]?.name : (q.topics as any)?.name || 'Unknown topic'}
                      </div>
                      <div style={{ fontSize: '15px', color: '#111', fontWeight: 500, lineHeight: 1.4 }}>
                        {q.question_text}
                      </div>
                      <div style={{ marginTop: '6px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '5px', background: '#fde8ea', color: '#7a0010' }}>
                          You answered: {wa.selected_option}. {getOption(q, wa.selected_option)}
                        </span>
                      </div>
                    </div>
                    <span style={{ color: '#888', fontSize: '16px', flexShrink: 0, marginTop: '2px' }}>
                      {isOpen ? '▲' : '▼'}
                    </span>
                  </button>

                  {isOpen && (
                    <div style={{ padding: '0 16px 16px', borderTop: '0.5px solid #eee' }}>
                      <div style={{ paddingTop: '14px' }}>
                        {['A', 'B', 'C', 'D'].map(key => {
                          const isCorrect = key === q.correct_option
                          const isWrong = key === wa.selected_option
                          return (
                            <div
                              key={key}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                padding: '10px 12px', borderRadius: '8px', marginBottom: '6px',
                                background: isCorrect ? '#e8f5ee' : isWrong ? '#fde8ea' : '#fafaf9',
                                border: isCorrect ? '1px solid #006B3F' : isWrong ? '1px solid #CE1126' : '1px solid #eee',
                              }}
                            >
                              <div style={{
                                width: '24px', height: '24px', borderRadius: '50%',
                                background: isCorrect ? '#006B3F' : isWrong ? '#CE1126' : '#e0e0e0',
                                color: isCorrect || isWrong ? '#fff' : '#666',
                                fontSize: '12px', fontWeight: 500,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                              }}>
                                {key}
                              </div>
                              <span style={{ fontSize: '14px', color: '#111' }}>
                                {getOption(q, key)}
                              </span>
                              {isCorrect && (
                                <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#006B3F', fontWeight: 500 }}>
                                  Correct
                                </span>
                              )}
                            </div>
                          )
                        })}

                        {q.explanation && (
                          <div style={{ marginTop: '12px', padding: '12px 14px', background: '#e8f5ee', borderRadius: '8px', fontSize: '14px', color: '#004D2E', lineHeight: 1.6 }}>
                            💡 {q.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </>
        )}
      </div>
    </main>
  )
}