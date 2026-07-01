'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Navbar from '../components/Navbar'

type Subject = { id: string; name: string }
type Topic = { id: string; name: string }

export default function AdminPage() {
  const [unlocked, setUnlocked] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const [subjects, setSubjects] = useState<Subject[]>([])
  const [topics, setTopics] = useState<Topic[]>([])

  const [newSubject, setNewSubject] = useState('')
  const [newSubjectExamType, setNewSubjectExamType] = useState('both')
  const [newTopic, setNewTopic] = useState('')
  const [selectedSubjectForTopic, setSelectedSubjectForTopic] = useState('')

  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('')
  const [questionText, setQuestionText] = useState('')
  const [optionA, setOptionA] = useState('')
  const [optionB, setOptionB] = useState('')
  const [optionC, setOptionC] = useState('')
  const [optionD, setOptionD] = useState('')
  const [correctOption, setCorrectOption] = useState('A')
  const [explanation, setExplanation] = useState('')

  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const [bulkSubject, setBulkSubject] = useState('')
  const [bulkTopic, setBulkTopic] = useState('')
  const [bulkTopics, setBulkTopics] = useState<Topic[]>([])
  const [bulkText, setBulkText] = useState('')
  const [bulkMessage, setBulkMessage] = useState('')
  const [bulkLoading, setBulkLoading] = useState(false)

  const [aiSubject, setAiSubject] = useState('')
  const [aiTopic, setAiTopic] = useState('')
  const [aiTopics, setAiTopics] = useState<Topic[]>([])
  const [aiText, setAiText] = useState('')
  const [aiMessage, setAiMessage] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiParsed, setAiParsed] = useState<any[]>([])

  useEffect(() => {
    if (unlocked) loadSubjects()
  }, [unlocked])

  useEffect(() => {
    if (selectedSubject) loadTopics(selectedSubject)
  }, [selectedSubject])

  useEffect(() => {
    if (selectedSubjectForTopic) loadTopics(selectedSubjectForTopic)
  }, [selectedSubjectForTopic])

  useEffect(() => {
    if (bulkSubject) {
      supabase.from('topics').select('id, name').eq('subject_id', bulkSubject).order('name')
        .then(({ data }) => { if (data) setBulkTopics(data) })
    }
  }, [bulkSubject])

  useEffect(() => {
    if (aiSubject) {
      supabase.from('topics').select('id, name').eq('subject_id', aiSubject).order('name')
        .then(({ data }) => { if (data) setAiTopics(data) })
    }
  }, [aiSubject])

  async function loadSubjects() {
    const { data } = await supabase.from('subjects').select('id, name').order('name')
    if (data) setSubjects(data)
  }

  async function loadTopics(subjectId: string) {
    const { data } = await supabase.from('topics').select('id, name').eq('subject_id', subjectId).order('name')
    if (data) setTopics(data)
  }

  function handleUnlock() {
    if (password === 'suayie_admin_2024') {
      setUnlocked(true)
      setPasswordError('')
    } else {
      setPasswordError('Incorrect password.')
    }
  }

  async function handleAddSubject() {
    if (!newSubject.trim()) return
    setLoading(true)
    const { error } = await supabase.from('subjects').insert({ name: newSubject.trim(), exam_type: newSubjectExamType })
    if (error) { setMessage('Error: ' + error.message) }
    else { setMessage(`Subject "${newSubject}" added!`); setNewSubject(''); setNewSubjectExamType('both'); loadSubjects() }
    setLoading(false)
  }

  async function handleAddTopic() {
    if (!newTopic.trim() || !selectedSubjectForTopic) return
    setLoading(true)
    const { error } = await supabase.from('topics').insert({ name: newTopic.trim(), subject_id: selectedSubjectForTopic })
    if (error) { setMessage('Error: ' + error.message) }
    else { setMessage(`Topic "${newTopic}" added!`); setNewTopic('') }
    setLoading(false)
  }

  async function handleAddQuestion() {
    if (!questionText.trim() || !selectedTopic || !optionA || !optionB || !optionC || !optionD) {
      setMessage('Please fill in all fields.')
      return
    }
    setLoading(true)
    const { error } = await supabase.from('questions').insert({
      topic_id: selectedTopic,
      question_text: questionText.trim(),
      option_a: optionA.trim(),
      option_b: optionB.trim(),
      option_c: optionC.trim(),
      option_d: optionD.trim(),
      correct_option: correctOption,
      explanation: explanation.trim() || null,
    })
    if (error) { setMessage('Error: ' + error.message) }
    else {
      setMessage('Question added successfully!')
      setQuestionText(''); setOptionA(''); setOptionB('')
      setOptionC(''); setOptionD(''); setExplanation('')
      setCorrectOption('A')
    }
    setLoading(false)
  }

  async function handleBulkImport() {
    if (!bulkTopic || !bulkText.trim()) {
      setBulkMessage('Please select a topic and paste your questions.')
      return
    }
    setBulkLoading(true)
    setBulkMessage('')

    const blocks = bulkText.split('---').map(b => b.trim()).filter(Boolean)
    const parsed: any[] = []
    const errors: string[] = []

    blocks.forEach((block, i) => {
      const lines = block.split('\n').map(l => l.trim()).filter(Boolean)
      try {
        const questionText = lines[0]
        const optionA = lines[1].replace(/^A\.\s*/i, '').trim()
        const optionB = lines[2].replace(/^B\.\s*/i, '').trim()
        const optionC = lines[3].replace(/^C\.\s*/i, '').trim()
        const optionD = lines[4].replace(/^D\.\s*/i, '').trim()
        const answerLine = lines.find(l => l.toUpperCase().startsWith('ANSWER:'))
        const explanationLine = lines.find(l => l.toUpperCase().startsWith('EXPLANATION:'))
        const correct = answerLine?.replace(/^ANSWER:\s*/i, '').trim().toUpperCase()
        const explanation = explanationLine?.replace(/^EXPLANATION:\s*/i, '').trim() || null

        if (!questionText || !optionA || !optionB || !optionC || !optionD || !correct) {
          errors.push(`Question ${i + 1}: missing required fields`)
          return
        }
        if (!['A', 'B', 'C', 'D'].includes(correct)) {
          errors.push(`Question ${i + 1}: ANSWER must be A, B, C or D`)
          return
        }
        parsed.push({
          topic_id: bulkTopic,
          question_text: questionText,
          option_a: optionA,
          option_b: optionB,
          option_c: optionC,
          option_d: optionD,
          correct_option: correct,
          explanation,
        })
      } catch {
        errors.push(`Question ${i + 1}: could not be parsed`)
      }
    })

    if (errors.length > 0) {
      setBulkMessage('Errors: ' + errors.join(' | '))
      setBulkLoading(false)
      return
    }

    const { error } = await supabase.from('questions').insert(parsed)
    if (error) {
      setBulkMessage('Error saving: ' + error.message)
    } else {
      setBulkMessage(`✓ Successfully imported ${parsed.length} question${parsed.length !== 1 ? 's' : ''}!`)
      setBulkText('')
    }
    setBulkLoading(false)
  }

  async function handleAIParse() {
    if (!aiTopic || !aiText.trim()) return
    setAiLoading(true)
    setAiMessage('')
    setAiParsed([])

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama3-70b-8192',
          temperature: 0.1,
          messages: [
            {
              role: 'system',
              content: `You are a question parser for a WASSCE/BECE exam prep app. Extract multiple choice questions from any text format provided.

Return ONLY a valid JSON array with no extra text, no markdown, no code blocks. Each object must have exactly these fields:
- question_text: string (the question)
- option_a: string (option A text only, no letter prefix)
- option_b: string (option B text only, no letter prefix)
- option_c: string (option C text only, no letter prefix)
- option_d: string (option D text only, no letter prefix)
- correct_option: string (must be exactly "A", "B", "C", or "D")
- explanation: string or null (explanation if available, otherwise null)

Rules:
- Remove any numbering from question text (e.g. "1." or "Q1:")
- Remove letter prefixes from options (e.g. "A." or "a)" or "(a)")
- correct_option must be uppercase single letter A, B, C, or D only
- If you cannot determine the correct answer, skip that question
- Only include questions that have exactly 4 options
- Return empty array [] if no valid questions found`,
            },
            {
              role: 'user',
              content: `Parse these questions into JSON:\n\n${aiText}`,
            },
          ],
        }),
      })

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content?.trim()

      if (!content) {
        setAiMessage('Error: No response from AI. Check your Groq API key.')
        setAiLoading(false)
        return
      }

      let parsed
      try {
        parsed = JSON.parse(content)
      } catch {
        const match = content.match(/\[[\s\S]*\]/)
        if (match) {
          parsed = JSON.parse(match[0])
        } else {
          setAiMessage('Error: AI returned unexpected format. Try again.')
          setAiLoading(false)
          return
        }
      }

      if (!Array.isArray(parsed) || parsed.length === 0) {
        setAiMessage('No questions found. Make sure your text contains multiple choice questions.')
        setAiLoading(false)
        return
      }

      const valid = parsed.filter(q =>
        q.question_text && q.option_a && q.option_b && q.option_c && q.option_d &&
        ['A', 'B', 'C', 'D'].includes(q.correct_option)
      )

      if (valid.length === 0) {
        setAiMessage('Error: AI parsed questions but they were missing required fields. Try again.')
        setAiLoading(false)
        return
      }

      setAiParsed(valid)
      setAiMessage(`✓ AI found ${valid.length} question${valid.length !== 1 ? 's' : ''}. Review below then click Import.`)
    } catch {
      setAiMessage('Error: Could not connect to Groq. Check your API key.')
    }

    setAiLoading(false)
  }

  async function handleAIImport() {
    if (aiParsed.length === 0 || !aiTopic) return
    setAiLoading(true)

    const toInsert = aiParsed.map(q => ({
      topic_id: aiTopic,
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_option: q.correct_option,
      explanation: q.explanation || null,
    }))

    const { error } = await supabase.from('questions').insert(toInsert)

    if (error) {
      setAiMessage('Error saving: ' + error.message)
    } else {
      setAiMessage(`✓ Successfully imported ${toInsert.length} questions!`)
      setAiParsed([])
      setAiText('')
    }

    setAiLoading(false)
  }

  const inputStyle: React.CSSProperties = {
    display: 'block', width: '100%', padding: '11px 13px',
    border: '1px solid #ddd', borderRadius: '8px',
    fontSize: '15px', color: '#111', background: '#fff',
    marginBottom: '10px',
  }

  const btnStyle = (color = 'var(--green)'): React.CSSProperties => ({
    padding: '11px 20px', background: color, color: '#fff',
    border: 'none', borderRadius: '8px', fontSize: '14px',
    fontWeight: 500, cursor: 'pointer', marginTop: '4px',
  })

  const sectionStyle: React.CSSProperties = {
    background: '#fff', border: '0.5px solid #ddd',
    borderRadius: '12px', padding: '20px', marginBottom: '20px',
  }

  if (!unlocked) {
    return (
      <main style={{ minHeight: '100vh', background: '#fafaf9' }}>
        <Navbar />
        <div style={{ padding: '60px 24px', maxWidth: '360px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 500, color: '#111', marginBottom: '8px' }}>Admin access</h1>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>Enter the admin password to continue</p>
          <input
            type="password" placeholder="Password" value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleUnlock()}
            style={{ ...inputStyle, textAlign: 'center' }}
          />
          {passwordError && <p style={{ color: '#CE1126', fontSize: '14px', marginBottom: '10px' }}>{passwordError}</p>}
          <button onClick={handleUnlock} style={{ ...btnStyle(), width: '100%', padding: '13px' }}>
            Unlock
          </button>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', background: '#fafaf9' }}>
      <Navbar />
      <div style={{ background: 'var(--green)', padding: '24px' }}>
        <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: 500 }}>Admin panel</h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>Add subjects, topics, and questions</p>
      </div>
      <div style={{ height: '4px', background: 'var(--gold)' }} />

      {message && (
        <div style={{ margin: '16px', padding: '12px 16px', background: message.startsWith('Error') ? '#fde8ea' : '#e8f5ee', borderRadius: '8px', fontSize: '14px', color: message.startsWith('Error') ? '#7a0010' : '#004D2E', fontWeight: 500 }}>
          {message}
        </div>
      )}

      <div style={{ padding: '20px 16px', maxWidth: '640px', margin: '0 auto' }}>

        <div style={sectionStyle}>
          <h2 style={{ fontSize: '16px', fontWeight: 500, color: '#111', marginBottom: '14px' }}>Add a subject</h2>
          <input style={inputStyle} placeholder="e.g. Core Mathematics" value={newSubject} onChange={e => setNewSubject(e.target.value)} />
          <label style={{ fontSize: '13px', color: '#555', display: 'block', marginBottom: '4px' }}>Exam type</label>
          <select style={inputStyle} value={newSubjectExamType} onChange={e => setNewSubjectExamType(e.target.value)}>
            <option value="both">Both WASSCE & BECE</option>
            <option value="wassce">WASSCE only</option>
            <option value="bece">BECE only</option>
          </select>
          <button style={btnStyle()} onClick={handleAddSubject} disabled={loading}>Add subject</button>
        </div>

        <div style={sectionStyle}>
          <h2 style={{ fontSize: '16px', fontWeight: 500, color: '#111', marginBottom: '14px' }}>Add a topic</h2>
          <select style={inputStyle} value={selectedSubjectForTopic} onChange={e => setSelectedSubjectForTopic(e.target.value)}>
            <option value="">Select a subject</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <input style={inputStyle} placeholder="e.g. Algebra" value={newTopic} onChange={e => setNewTopic(e.target.value)} />
          <button style={btnStyle()} onClick={handleAddTopic} disabled={loading}>Add topic</button>
        </div>

        <div style={sectionStyle}>
          <h2 style={{ fontSize: '16px', fontWeight: 500, color: '#111', marginBottom: '14px' }}>Add a question</h2>

          <label style={{ fontSize: '13px', color: '#555', display: 'block', marginBottom: '4px' }}>Subject</label>
          <select style={inputStyle} value={selectedSubject} onChange={e => { setSelectedSubject(e.target.value); setSelectedTopic('') }}>
            <option value="">Select a subject</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>

          <label style={{ fontSize: '13px', color: '#555', display: 'block', marginBottom: '4px' }}>Topic</label>
          <select style={inputStyle} value={selectedTopic} onChange={e => setSelectedTopic(e.target.value)} disabled={!selectedSubject}>
            <option value="">Select a topic</option>
            {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>

          <label style={{ fontSize: '13px', color: '#555', display: 'block', marginBottom: '4px' }}>Question</label>
          <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} placeholder="Type the question here..." value={questionText} onChange={e => setQuestionText(e.target.value)} />

          {(['A', 'B', 'C', 'D'] as const).map(key => (
            <div key={key}>
              <label style={{ fontSize: '13px', color: '#555', display: 'block', marginBottom: '4px' }}>Option {key}</label>
              <input style={inputStyle} placeholder={`Option ${key}`}
                value={key === 'A' ? optionA : key === 'B' ? optionB : key === 'C' ? optionC : optionD}
                onChange={e => {
                  if (key === 'A') setOptionA(e.target.value)
                  else if (key === 'B') setOptionB(e.target.value)
                  else if (key === 'C') setOptionC(e.target.value)
                  else setOptionD(e.target.value)
                }}
              />
            </div>
          ))}

          <label style={{ fontSize: '13px', color: '#555', display: 'block', marginBottom: '4px' }}>Correct answer</label>
          <select style={inputStyle} value={correctOption} onChange={e => setCorrectOption(e.target.value)}>
            {['A', 'B', 'C', 'D'].map(k => <option key={k} value={k}>Option {k}</option>)}
          </select>

          <label style={{ fontSize: '13px', color: '#555', display: 'block', marginBottom: '4px' }}>Explanation (optional)</label>
          <textarea style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} placeholder="Explain why this answer is correct..." value={explanation} onChange={e => setExplanation(e.target.value)} />

          <button style={{ ...btnStyle(), width: '100%', padding: '13px', fontSize: '15px' }} onClick={handleAddQuestion} disabled={loading}>
            {loading ? 'Saving...' : 'Add question'}
          </button>
        </div>

        <div style={sectionStyle}>
          <h2 style={{ fontSize: '16px', fontWeight: 500, color: '#111', marginBottom: '6px' }}>Bulk import questions</h2>
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '14px', lineHeight: 1.6 }}>
            Paste multiple questions at once. Separate each question with <strong>---</strong>
          </p>

          <div style={{ background: '#f5f5f5', borderRadius: '8px', padding: '12px', marginBottom: '14px', fontSize: '12px', color: '#555', fontFamily: 'monospace', lineHeight: 1.8 }}>
            What is the capital of Ghana?<br />
            A. Kumasi<br />
            B. Accra<br />
            C. Tamale<br />
            D. Cape Coast<br />
            ANSWER: B<br />
            EXPLANATION: Accra is the capital city.<br />
            ---
          </div>

          <label style={{ fontSize: '13px', color: '#555', display: 'block', marginBottom: '4px' }}>Subject</label>
          <select style={inputStyle} value={bulkSubject} onChange={e => { setBulkSubject(e.target.value); setBulkTopic('') }}>
            <option value="">Select a subject</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>

          <label style={{ fontSize: '13px', color: '#555', display: 'block', marginBottom: '4px' }}>Topic</label>
          <select style={inputStyle} value={bulkTopic} onChange={e => setBulkTopic(e.target.value)} disabled={!bulkSubject}>
            <option value="">Select a topic</option>
            {bulkTopics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>

          <label style={{ fontSize: '13px', color: '#555', display: 'block', marginBottom: '4px' }}>Paste your questions here</label>
          <textarea
            style={{ ...inputStyle, minHeight: '200px', resize: 'vertical', fontFamily: 'monospace', fontSize: '13px' }}
            placeholder={'What is 1 + 1?\nA. 1\nB. 2\nC. 3\nD. 4\nANSWER: B\nEXPLANATION: 1 + 1 = 2\n---'}
            value={bulkText}
            onChange={e => setBulkText(e.target.value)}
          />

          {bulkMessage && (
            <div style={{ padding: '10px 14px', background: bulkMessage.startsWith('Error') ? '#fde8ea' : '#e8f5ee', borderRadius: '8px', fontSize: '14px', color: bulkMessage.startsWith('Error') ? '#7a0010' : '#004D2E', marginBottom: '10px', fontWeight: 500 }}>
              {bulkMessage}
            </div>
          )}

          <button
            style={{ ...btnStyle(), width: '100%', padding: '13px', fontSize: '15px' }}
            onClick={handleBulkImport}
            disabled={bulkLoading}
          >
            {bulkLoading ? 'Importing...' : 'Import all questions'}
          </button>
        </div>

        <div style={sectionStyle}>
          <h2 style={{ fontSize: '16px', fontWeight: 500, color: '#111', marginBottom: '6px' }}>
            🤖 AI question import
          </h2>
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '14px', lineHeight: 1.6 }}>
            Paste questions in <strong>any format</strong> — copied from a website, PDF, textbook, anything. Groq AI will extract and format them automatically.
          </p>

          <label style={{ fontSize: '13px', color: '#555', display: 'block', marginBottom: '4px' }}>Subject</label>
          <select style={inputStyle} value={aiSubject} onChange={e => { setAiSubject(e.target.value); setAiTopic('') }}>
            <option value="">Select a subject</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>

          <label style={{ fontSize: '13px', color: '#555', display: 'block', marginBottom: '4px' }}>Topic</label>
          <select style={inputStyle} value={aiTopic} onChange={e => setAiTopic(e.target.value)} disabled={!aiSubject}>
            <option value="">Select a topic</option>
            {aiTopics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>

          <label style={{ fontSize: '13px', color: '#555', display: 'block', marginBottom: '4px' }}>
            Paste your questions here (any format)
          </label>
          <textarea
            style={{ ...inputStyle, minHeight: '200px', resize: 'vertical', fontSize: '13px' }}
            placeholder={`Paste questions in any format, e.g:\n\n1. What is the capital of Ghana?\na) Kumasi  b) Accra  c) Tamale  d) Cape Coast\nAnswer: b\n\nOR:\n\nWhich of the following is NOT a prime number?\nA. 2  B. 3  C. 4  D. 5\nCorrect: C\nExplanation: 4 is divisible by 2...`}
            value={aiText}
            onChange={e => setAiText(e.target.value)}
          />

          {aiMessage && (
            <div style={{ padding: '10px 14px', background: aiMessage.startsWith('Error') ? '#fde8ea' : '#e8f5ee', borderRadius: '8px', fontSize: '14px', color: aiMessage.startsWith('Error') ? '#7a0010' : '#004D2E', marginBottom: '12px', fontWeight: 500 }}>
              {aiMessage}
            </div>
          )}

          <button
            style={{ ...btnStyle(), width: '100%', padding: '13px', fontSize: '15px', marginBottom: '16px' }}
            onClick={handleAIParse}
            disabled={aiLoading || !aiTopic || !aiText.trim()}
          >
            {aiLoading ? '🤖 Parsing with AI...' : '🤖 Parse with AI'}
          </button>

          {aiParsed.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: '#111' }}>
                  {aiParsed.length} question{aiParsed.length !== 1 ? 's' : ''} found — review before importing:
                </p>
                <button
                  style={{ ...btnStyle('#111'), padding: '8px 16px', fontSize: '13px' }}
                  onClick={handleAIImport}
                  disabled={aiLoading}
                >
                  {aiLoading ? 'Saving...' : `Import all ${aiParsed.length}`}
                </button>
              </div>

              {aiParsed.map((q, i) => (
                <div key={i} style={{ background: '#fafaf9', border: '0.5px solid #ddd', borderRadius: '8px', padding: '14px', marginBottom: '10px' }}>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: '#111', marginBottom: '8px' }}>
                    {i + 1}. {q.question_text}
                  </p>
                  {['A', 'B', 'C', 'D'].map(key => (
                    <p key={key} style={{
                      fontSize: '13px', padding: '4px 8px', borderRadius: '4px', marginBottom: '3px',
                      background: key === q.correct_option ? '#e8f5ee' : 'transparent',
                      color: key === q.correct_option ? '#004D2E' : '#555',
                      fontWeight: key === q.correct_option ? 500 : 400,
                    }}>
                      {key}. {key === 'A' ? q.option_a : key === 'B' ? q.option_b : key === 'C' ? q.option_c : q.option_d}
                      {key === q.correct_option && ' ✓'}
                    </p>
                  ))}
                  {q.explanation && (
                    <p style={{ fontSize: '12px', color: '#666', marginTop: '6px', fontStyle: 'italic' }}>
                      💡 {q.explanation}
                    </p>
                  )}
                </div>
              ))}

              <button
                style={{ ...btnStyle('#111'), width: '100%', padding: '13px', fontSize: '15px' }}
                onClick={handleAIImport}
                disabled={aiLoading}
              >
                {aiLoading ? 'Saving...' : `Import all ${aiParsed.length} questions`}
              </button>
            </div>
          )}
        </div>

      </div>
    </main>
  )
}