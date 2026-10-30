import { useState } from 'react'

interface AdminSession {
  id: string; studentId: string; name: string
  status: string; score: number; durationMs: number | null
  createdAt: string; startedAt: string | null; finishedAt: string | null
}

const BASE = (import.meta as any).env?.VITE_API_URL ?? 'http://localhost:5080'

export default function AdminPage() {
  const [token, setToken] = useState(localStorage.getItem('adminToken') ?? '')
  const [rows, setRows] = useState<AdminSession[]>([])
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setError(null)
    localStorage.setItem('adminToken', token)
    const res = await fetch(`${BASE}/api/admin/sessions`, {
      headers: { 'X-Admin-Token': token },
    })
    if (!res.ok) { setError('Unauthorized'); setRows([]); return }
    setRows(await res.json())
  }

  return (
    <div className="page">
      <div className="card">
        <h1>Admin</h1>
        <div className="row">
          <input value={token} onChange={e => setToken(e.target.value)} placeholder="Admin token" />
          <button onClick={load}>Load</button>
        </div>
        {error && <div className="error">{error}</div>}
        {rows.length > 0 && (
            <div className="lb-wrap">
                <table className="lb">
                    <thead>
                    <tr><th>Student ID</th><th>Name</th><th>Status</th><th>Score</th><th>Time</th></tr>
                    </thead>
                    <tbody>
                    {rows.map(r => (
                        <tr key={r.id}>
                        <td>{r.studentId}</td>
                        <td>{r.name}</td>
                        <td>{r.status}</td>
                        <td>{r.score}</td>
                        <td>{r.durationMs ? (r.durationMs / 1000).toFixed(1) + 's' : '-'}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>
    </div>
  )
}