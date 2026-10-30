import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { api, LeaderboardEntry } from '../api/client'
import { BatikCorner } from '../components/Batik'

export default function LeaderboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => api<LeaderboardEntry[]>('/api/leaderboard?take=20'),
    refetchInterval: 10000,
  })

  return (
    <div className="page">
      <div className="card">
        <BatikCorner position="tl" />
        <BatikCorner position="tr" />
        <BatikCorner position="bl" />
        <BatikCorner position="br" />

        <h1>🏆 Leaderboard / 排行榜</h1>
        <p className="muted small">Score DESC, then fastest time</p>
        {isLoading && <p>Loading… / 加载中…</p>}
        {data && (
            <div className="lb-wrap">
                <table className="lb">
                    <thead>
                    <tr><th>#</th><th>Name</th><th>ID</th><th>Score</th><th>Time</th></tr>
                    </thead>
                    <tbody>
                    {data.map(e => (
                        <tr key={e.rank} className={e.rank === 1 ? 'top' : ''}>
                        <td>{e.rank === 1 ? '🥇' : e.rank === 2 ? '🥈' : e.rank === 3 ? '🥉' : e.rank}</td>
                        <td>{e.name}</td>
                        <td className="muted">{e.studentIdMasked}</td>
                        <td><b>{e.score}</b></td>
                        <td>{(e.durationMs / 1000).toFixed(1)}s</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
          </div>
        )}
        <div className="actions">
          <Link to="/" className="btn ghost">Back / 返回</Link>
        </div>
      </div>
    </div>
  )
}