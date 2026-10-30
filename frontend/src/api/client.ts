const BASE = (import.meta as any).env?.VITE_API_URL ?? 'http://localhost:5080'

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  })
  if (!res.ok) {
    let msg = res.statusText
    try { const j = await res.json(); msg = j.error ?? msg } catch {}
    throw new Error(msg)
  }
  return res.json() as Promise<T>
}

export interface OptionView { optionId: string; textEn: string; textZh: string }
export interface QuestionView {
  questionId: string; orderIndex: number; imageUrl: string
  textEn: string; textZh: string; selectedOptionId: string | null
  options: OptionView[]
}
export interface StartSessionResponse { sessionId: string }
export interface BeginSessionResponse {
  sessionId: string
  startedAt: string; serverNow: string; totalSeconds: number
  answeredCount: number; correctCount: number; isFinished: boolean
  questions: QuestionView[]
}
export interface SubmitAnswerResponse {
  isCorrect: boolean; answeredCount: number; totalQuestions: number; serverNow: string
}
export interface QuestionResultView {
  questionId: string; textEn: string; textZh: string
  correctOptionId: string; selectedOptionId: string | null; isCorrect: boolean
}
export interface FinishResponse {
  sessionId: string; name: string; studentId: string
  score: number; total: number
  durationMs: number; results: QuestionResultView[]
}
export interface LeaderboardEntry {
  rank: number; name: string; studentIdMasked: string
  score: number; durationMs: number; finishedAt: string
}