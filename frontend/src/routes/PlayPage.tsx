import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { api, BeginSessionResponse, FinishResponse, SubmitAnswerResponse } from '../api/client'
import { BatikCorner } from '../components/Batik'

export default function PlayPage() {
  const { sessionId } = useParams({ from: '/play/$sessionId' })
  const navigate = useNavigate()

  const [begin, setBegin] = useState<BeginSessionResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [remainingMs, setRemainingMs] = useState(60000)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const finishingRef = useRef(false)

  // 1) Begin session (also handles resume & timeout)
  useEffect(() => {
    let cancelled = false
    api<BeginSessionResponse>(`/api/sessions/${sessionId}/begin`, { method: 'POST' })
      .then(d => {
        if (cancelled) return
        if (d.isFinished) {
          navigate({ to: '/result/$sessionId', params: { sessionId } })
          return
        }
        setBegin(d)
        setCorrectCount(d.correctCount)
        const firstUnanswered = d.questions.findIndex(q => q.selectedOptionId === null)
        setCurrentIndex(firstUnanswered >= 0 ? firstUnanswered : d.questions.length)
      })
      .catch(e => { if (!cancelled) setError(e.message ?? 'Failed to begin') })
    return () => { cancelled = true }
  }, [sessionId])

  // 2) Timer, synced to server time
  useEffect(() => {
    if (!begin) return
    const totalMs = begin.totalSeconds * 1000
    const startedAtMs = new Date(begin.startedAt).getTime()
    const offsetMs = new Date(begin.serverNow).getTime() - Date.now()

    const tick = () => {
      const rem = Math.max(0, startedAtMs + totalMs - (Date.now() + offsetMs))
      setRemainingMs(rem)
      if (rem <= 0 && !finishingRef.current) {
        finishingRef.current = true
        doFinish()
      }
    }
    tick()
    const t = setInterval(tick, 100)
    return () => clearInterval(t)
  }, [begin])

  async function doFinish() {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await api<FinishResponse>(`/api/sessions/${sessionId}/finish`, { method: 'POST' })
        break
      } catch {
        await new Promise(r => setTimeout(r, 500))
      }
    }
    navigate({ to: '/result/$sessionId', params: { sessionId } })
  }

  async function pick(optionId: string) {
    if (busy || !begin || finishingRef.current) return
    setBusy(true)
    setSelected(optionId)
    try {
      const res = await api<SubmitAnswerResponse>(`/api/sessions/${sessionId}/answer`, {
        method: 'POST',
        body: JSON.stringify({
          questionId: begin.questions[currentIndex].questionId,
          optionId,
        }),
      })
      if (res.isCorrect) setCorrectCount(c => c + 1)
      if (res.answeredCount >= res.totalQuestions) {
        finishingRef.current = true
        await doFinish()
      } else {
        setCurrentIndex(i => i + 1)
        setSelected(null)
        setBusy(false)
      }
    } catch (e: any) {
      const msg = (e.message ?? '').toLowerCase()
      if (msg.includes('time') || msg.includes('not playing') || msg.includes('finished')) {
        finishingRef.current = true
        await doFinish()
      } else {
        setSelected(null)
        setBusy(false)
      }
    }
  }

  if (error) {
    return <div className="page center"><div className="card error">{error}</div></div>
  }
  if (!begin) {
    return <div className="page center"><div className="card">Loading… / 加载中…</div></div>
  }
  if (currentIndex >= begin.questions.length) {
    return <div className="page center"><div className="card">Finishing… / 结算中…</div></div>
  }

  const q = begin.questions[currentIndex]
  const seconds = Math.ceil(remainingMs / 1000)
  const isDanger = remainingMs <= 10000

  return (
    <div className="page">
      <div className="hud">
        <div className={`timer ${isDanger ? 'danger' : ''}`}>{seconds}s</div>
        <div className="progress">
          {[0, 1, 2, 3].map(i => (
            <span key={i} className={`dot ${i < correctCount ? 'filled' : ''}`} />
          ))}
        </div>
        <div className="muted small">Q {currentIndex + 1}/{begin.questions.length}</div>
      </div>

      <div className="card card-play">
  <BatikCorner position="tl" />
  <BatikCorner position="tr" />
  <BatikCorner position="bl" />
  <BatikCorner position="br" />

  <div className="qimg-wrap">
    <img className="qimg" src={q.imageUrl} alt="" />
  </div>
  <h2 className="q-en">{q.textEn}</h2>
  <p className="q-zh">{q.textZh}</p>
  <div className="options">
    {q.options.map(o => (
      <button
        key={o.optionId}
        className={`opt ${selected === o.optionId ? 'selected' : ''}`}
        disabled={busy || remainingMs <= 0}
        onClick={() => pick(o.optionId)}
      >
        <span className="opt-en">{o.textEn}</span>
        <span className="opt-zh">{o.textZh}</span>
      </button>
    ))}
  </div>
</div>
    </div>
  )
}