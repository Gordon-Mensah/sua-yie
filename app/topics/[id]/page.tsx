'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type Question = {
  id: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: string
  explanation: string | null
  topic_id: string
}

export default function TopicPage() {
  const params = useParams()
  const topicId = params.id as string

  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function loadQuestions() {
      const { data } = await supabase
        .from('questions')
        .select('*')
        .eq('topic_id', topicId)
      if (data) setQuestions(data)
    }
    loadQuestions()
  }, [topicId])

  const isFinished = currentIndex >= questions.length && questions.length > 0

  useEffect(() => {
    async function saveScore() {
      if (!isFinished || saved) return
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: topic } = await supabase
        .from('topics')
        .select('subject_id')
        .eq('id', topicId)
        .single()

      await supabase.from('sessions').insert({
        user_id: user.id,
        subject_id: topic?.subject_id,
        score,
        finished_at: new Date().toISOString(),
      })
      setSaved(true)
    }
    saveScore()
  }, [isFinished])

  if (questions.length === 0) {
    return (
      <main style={{ padding: '40px', fontFamily: 'sans-serif', color: '#111' }}>
        <p>Loading questions...</p>
      </main>
    )
  }

  const question = questions[currentIndex]

  function handleSelect(option: string) {
    if (selected) return
    setSelected(option)
    if (option === question.correct_option) {
      setScore((s) => s + 1)
    }
  }

  function handleNext() {
    setSelected(null)
    setCurrentIndex((i) => i + 1)
  }

  const options = [
    { key: 'A', text: question?.option_a },
    { key: 'B', text: question?.option_b },
    { key: 'C', text: question?.option_c },
    { key: 'D', text: question?.option_d },
  ]

  return (
    <main style={{ padding: '40px', fontFamily: 'sans-serif', backgroundColor: '#fff', color: '#111', minHeight: '100vh', maxWidth: '600px' }}>
      <Link href="/" style={{ color: '#555', textDecoration: 'none' }}>
        ← Back to subjects
      </Link>

      {isFinished ? (
        <div style={{ marginTop: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Quiz complete!</h1>
          <p style={{ marginTop: '12px', fontSize: '18px' }}>
            You scored {score} out of {questions.length}
          </p>
          {saved && (
            <p style={{ marginTop: '8px', color: '#555', fontSize: '14px' }}>
              ✓ Score saved to your account
            </p>
          )}
          <Link
            href="/"
            style={{ display: 'inline-block', marginTop: '20px', padding: '12px 24px', backgroundColor: '#111', color: '#fff', borderRadius: '8px', textDecoration: 'none' }}
          >
            Practice another subject
          </Link>
        </div>
      ) : (
        <div style={{ marginTop: '24px' }}>
          <p style={{ color: '#777', marginBottom: '8px' }}>
            Question {currentIndex + 1} of {questions.length}
          </p>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
            {question.question_text}
          </h2>

          {options.map((opt) => {
            const isCorrect = opt.key === question.correct_option
            const isSelected = opt.key === selected
            let backgroundColor = '#fff'
            if (selected) {
              if (isCorrect) backgroundColor = '#d4f7d4'
              else if (isSelected) backgroundColor = '#f7d4d4'
            }

            return (
              <button
                key={opt.key}
                onClick={() => handleSelect(opt.key)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '14px', marginBottom: '10px',
                  border: '1px solid #ddd', borderRadius: '8px',
                  backgroundColor, cursor: selected ? 'default' : 'pointer',
                  fontSize: '16px',
                }}
              >
                {opt.key}. {opt.text}
              </button>
            )
          })}

          {selected && question.explanation && (
            <p style={{ marginTop: '12px', color: '#555', fontStyle: 'italic' }}>
              💡 {question.explanation}
            </p>
          )}

          {selected && (
            <button
              onClick={handleNext}
              style={{
                marginTop: '20px', padding: '12px 24px',
                backgroundColor: '#111', color: '#fff',
                border: 'none', borderRadius: '8px',
                fontSize: '16px', cursor: 'pointer',
              }}
            >
              Next question →
            </button>
          )}
        </div>
      )}
    </main>
  )
}