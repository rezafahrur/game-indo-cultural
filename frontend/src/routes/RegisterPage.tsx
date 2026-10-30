import { useState } from 'react'
import { useNavigate, Link } from '@tanstack/react-router'
import { api, StartSessionResponse } from '../api/client'
import { BatikCorner, Kawung } from '../components/Batik'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [studentId, setStudentId] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [touched, setTouched] = useState(false)

  const idValid = /^\d{10}$/.test(studentId.trim())
  const nameValid = name.trim().length >= 1 && name.trim().length <= 50
  const canSubmit = idValid && nameValid && !loading

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (!canSubmit) return

    setError(null)
    setLoading(true)
    try {
      const res = await api<StartSessionResponse>('/api/sessions', {
        method: 'POST',
        body: JSON.stringify({ studentId: studentId.trim(), name: name.trim() }),
      })
      navigate({ to: '/play/$sessionId', params: { sessionId: res.sessionId } })
    } catch (e: any) {
      setError(e.message ?? 'Failed to start')
      setLoading(false)
    }
  }

  return (
    <div className="page center">
      <div className="card card-hero">
        <BatikCorner position="tl" />
        <BatikCorner position="tr" />
        <BatikCorner position="bl" />
        <BatikCorner position="br" />

        <div className="hero-kawung">
          <Kawung size={56} />
        </div>

        <h1>60-Second Indonesian Batik Challenge</h1>
        <p className="muted">4 questions · 60 seconds · highest score + fastest time wins</p>
        <p className="muted small">4 道题 · 60 秒 · 得分最高且用时最短者获胜</p>

        <form onSubmit={onSubmit}>
          <label>Student ID / 学号</label>
          <input
            value={studentId}
            onChange={e => setStudentId(e.target.value.replace(/\D/g, '').slice(0, 10))}
            onBlur={() => setTouched(true)}
            inputMode="numeric"
            pattern="\d{10}"
            maxLength={10}
            required
            placeholder="10 digits / 10位数字"
            autoComplete="off"
          />
          {touched && studentId.length > 0 && !idValid && (
            <div className="field-error">
              Must be exactly 10 digits / 必须为10位数字
            </div>
          )}

          <label>Name / 姓名</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onBlur={() => setTouched(true)}
            maxLength={50}
            required
            placeholder="e.g. 小/ Xiao"
            autoComplete="off"
          />
          {touched && name.length > 0 && !nameValid && (
            <div className="field-error">
              Name must be 1–50 characters / 姓名长度必须为1–50个字符
            </div>
          )}

          {error && <div className="error">{error}</div>}

          <button type="submit" disabled={!canSubmit}>
            {loading ? 'Loading…' : 'Start / 开始'}
          </button>
        </form>

        <p className="muted small mt">
          1 attempt per Student ID / 每个学号只能参加一次 ·{' '}
          <Link to="/leaderboard">Leaderboard / 排行榜</Link>
        </p>
      </div>
    </div>
  )
}