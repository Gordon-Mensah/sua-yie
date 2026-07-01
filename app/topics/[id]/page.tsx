'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Navbar from '../../components/Navbar'

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

const TIME_PER_QUESTION = 60

export default function TopicPage() {
  const params = useParams()
  const topicId = params.id as string

  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [saved, setSaved] = useState(false)
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION)
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('questions').select('*').eq('topic_id', topicId)
      if (data) setQuestions(data)
    }
    load()
  }, [topicId])

  const isFinished = questions.length > 0 && currentIndex >= questions.length

  const moveNext = useCallback(() => {
    setSelected(null)
    setTimedOut(false)
    setTimeLeft(TIME_PER_QUESTION)
    setCurrentIndex(i => i + 1)
  }, [])

  useEffect(() => {
    if (isFinished || selected || questions.length === 0) return
    if (timeLeft <= 0) { setTimedOut(true); return }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(timer)
  }, [timeLeft, selected, isFinished, questions.length])

  useEffect(() => {
    if (timedOut) {
      const pause = setTimeout(() => moveNext(), 1500)
      return () => clearTimeout(pause)
    }
  }, [timedOut, moveNext])

  useEffect(() => {
    async function saveScore() {
      if (!isFinished || saved) return
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: topic } = await supabase.from('topics').select('subject_id').eq('id', topicId).single()
      await supabase.from('sessions').insert({ user_id: user.id, subject_id: topic?.subject_id, score, finished_at: new Date().toISOString() })
      setSaved(true)
    }
    saveScore()
  }, [isFinished])

  if (questions.length === 0) {
    return (
      <main style={{ minHeight: '100vh', background: '#fafaf9' }}>
        <Navbar />
        <div style={{ padding: '60px 24px', textAlign: 'center' }}>
          <p style={{ color: '#666', fontSize: '15px' }}>Loading questions...</p>
        </div>
      </main>
    )
  }

  const question = questions[currentIndex]
  const progress = Math.round((currentIndex / questions.length) * 100)
  const timerPercent = (timeLeft / TIME_PER_QUESTION) * 100
  const timerColor = timeLeft <= 15 ? '#CE1126' : timeLeft <= 30 ? '#FCD116' : '#006B3F'

  const options = [
    { key: 'A', text: question?.option_a },
    { key: 'B', text: question?.option_b },
    { key: 'C', text: question?.option_c },
    { key: 'D', text: question?.option_d },
  ]

  function handleSelect(key: string) {
    if (selected || timedOut) return
    setSelected(key)
    if (key === question.correct_option) setScore(s => s + 1)
  }

  function getOptionStyle(key: string): React.CSSProperties {
    const base: React.CSSProperties = {
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '13px 14px', borderRadius: '8px', marginBottom: '8px',
      border: '1px solid #ddd', background: '#fff', width: '100%',
      textAlign: 'left', cursor: selected || timedOut ? 'default' : 'pointer',
    }
    if (timedOut) {
      if (key === question.correct_option) return { ...base, background: '#e8f5ee', border: '1px solid #006B3F' }
      return { ...base, opacity: 0.45 }
    }
    if (!selected) return base
    if (key === question.correct_option) return { ...base, background: '#e8f5ee', border: '1px solid #006B3F' }
    if (key === selected) return { ...base, background: '#fde8ea', border: '1px solid #CE1126' }
    return { ...base, opacity: 0.45 }
  }

  function getKeyStyle(key: string): React.CSSProperties {
    const base: React.CSSProperties = {
      width: '28px', height: '28px', borderRadius: '50%',
      background: '#f0f0f0', color: '#111',
      fontSize: '13px', fontWeight: 500,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }
    if (timedOut) {
      if (key === question.correct_option) return { ...base, background: '#006B3F', color: '#fff' }
      return base
    }
    if (!selected) return base
    if (key === question.correct_option) return { ...base, background: '#006B3F', color: '#fff' }
    if (key === selected) return { ...base, background: '#CE1126', color: '#fff' }
    return base
  }

  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100)
    const feedback = percentage >= 80 ? 'Excellent work!' : percentage >= 60 ? 'Good effort — keep practicing.' : 'Keep going, you\'ll improve!'

    return (
      <main style={{ minHeight: '100vh', background: '#fafaf9' }}>
        <Navbar />
        <div style={{ height: '4px', background: 'var(--gold)' }} />
        <div style={{ padding: '40px 24px', maxWidth: '480px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: '#e8f5ee', border: '3px solid #006B3F', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <span style={{ fontSize: '22px', fontWeight: 500, color: '#006B3F' }}>{score}/{questions.length}</span>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 500, color: '#111', marginBottom: '8px' }}>Quiz complete!</h1>
          <p style={{ fontSize: '16px', color: '#444', marginBottom: '4px' }}>You scored {score} out of {questions.length} ({percentage}%)</p>
          <p style={{ fontSize: '14px', color: '#006B3F', fontWeight: 500, marginBottom: '8px' }}>{feedback}</p>
          {saved && <p style={{ fontSize: '13px', color: '#888', marginBottom: '28px' }}>✓ Score saved to your account</p>}
          <Link href="/" style={{ display: 'block', padding: '14px 24px', background: '#111', color: '#fff', borderRadius: '8px', fontSize: '15px', fontWeight: 500, maxWidth: '320px', margin: '0 auto' }}>
            Practice another subject
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', background: '#fff' }}>
      <nav style={{ background: 'var(--green)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px' }}>← Back</Link>
        <span style={{ color: 'var(--gold)', fontSize: '14px', fontWeight: 500 }}>
          {currentIndex + 1} / {questions.length}
        </span>
      </nav>

      <div style={{ height: '4px', background: '#eee' }}>
        <div style={{ height: '4px', background: 'var(--green)', width: `${progress}%`, transition: 'width 0.3s ease' }} />
      </div>

      <div style={{ padding: '16px', maxWidth: '600px', margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', color: '#888' }}>Time remaining</span>
          <span style={{ fontSize: '14px', fontWeight: 600, color: timerColor }}>
            {timeLeft}s
          </span>
        </div>
        <div style={{ height: '6px', background: '#eee', borderRadius: '3px', marginBottom: '20px' }}>
          <div style={{ height: '6px', background: timerColor, borderRadius: '3px', width: `${timerPercent}%`, transition: 'width 1s linear, background 0.5s ease' }} />
        </div>

        {timedOut && (
          <div style={{ padding: '12px 14px', background: '#fff3cd', border: '1px solid #FCD116', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', color: '#7A5800', fontWeight: 500 }}>
            ⏱ Time's up! The correct answer was {question.correct_option}.
          </div>
        )}

        <h2 style={{ fontSize: '18px', fontWeight: 500, color: '#111', lineHeight: 1.55, marginBottom: '22px' }}>
          {question.question_text}
        </h2>

        {options.map(opt => (
          <button key={opt.key} onClick={() => handleSelect(opt.key)} style={getOptionStyle(opt.key)}>
            <div style={getKeyStyle(opt.key)}>{opt.key}</div>
            <span style={{ fontSize: '15px', color: '#111' }}>{opt.text}</span>
          </button>
        ))}

        {selected && question.explanation && (
          <div style={{ marginTop: '14px', padding: '13px 14px', background: '#e8f5ee', borderRadius: '8px', fontSize: '14px', color: '#004D2E', lineHeight: 1.55 }}>
            {question.explanation}
          </div>
        )}

        {(selected || timedOut) && (
          <button onClick={moveNext} style={{ marginTop: '20px', width: '100%', padding: '14px', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 500, cursor: 'pointer' }}>
            Next question →
          </button>
        )}
      </div>
    </main>
  )
}