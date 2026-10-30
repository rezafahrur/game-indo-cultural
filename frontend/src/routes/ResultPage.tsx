import { useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from '@tanstack/react-router'
import html2canvas from 'html2canvas'
import { api, FinishResponse } from '../api/client'
import { BatikCorner, BatikDivider } from '../components/Batik'

function resizeImage(file: File, maxSize = 400): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height
            height = maxSize
          }
        }
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.onerror = reject
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function ResultPage() {
  const { sessionId } = useParams({ from: '/result/$sessionId' })
  const { data, isLoading, error } = useQuery({
    queryKey: ['result', sessionId],
    queryFn: () => api<FinishResponse>(`/api/sessions/${sessionId}/result`),
  })

  const cardRef = useRef<HTMLDivElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)

  if (isLoading) {
    return <div className="page center"><div className="card">Loading… / 加载中…</div></div>
  }
  if (error || !data) {
    return <div className="page center"><div className="card error">Result unavailable / 无法获取结果</div></div>
  }

  const seconds = (data.durationMs / 1000).toFixed(1)
  const perfect = data.score === data.total

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
      const file = e.target.files?.[0]
      if (!file) return
      try {
        const resized = await resizeImage(file, 400)
        setPhotoUrl(resized)
      } catch (err) {
        console.error(err)
      } finally {
        if (photoInputRef.current) photoInputRef.current.value = ''
      }
    }

  async function saveImage() {
    if (!cardRef.current || !data) return
    setSaving(true)
    setIsCapturing(true)

    try {
      // 1) Tunggu font selesai dimuat
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready
      }

      // 2) Beri waktu React untuk apply class .capturing
      await new Promise(r => setTimeout(r, 350))

      // 3) Render dengan html2canvas
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#fbf5e6',
        scale: Math.min(window.devicePixelRatio || 1, 2), // Maksimal 2 agar tidak OOM
        useCORS: true,
        logging: false,
        onclone: (clonedDoc) => {
          // Pastikan class capturing tetap ada di clone DOM
          const card = clonedDoc.querySelector('.share-card') as HTMLElement | null
          if (card) card.classList.add('capturing')
        }
      })

      const dataUrl = canvas.toDataURL('image/png')
      setPreviewUrl(dataUrl)
      setShowPreview(true)
    } catch (e) {
      console.error(e)
      alert('Gagal membuat gambar. / 生成图片失败。')
    } finally {
      setIsCapturing(false)
      setSaving(false)
    }
  }

  const safeName = data.name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g, '_') || 'player'
  const filename = `indonesian-challenge-${safeName}.png`

  return (
    <div className="page">
      <div className="share-card" ref={cardRef}>
        <BatikCorner position="tl" />
        <BatikCorner position="tr" />
        <BatikCorner position="bl" />
        <BatikCorner position="br" />

        <div
            className={`photo-frame ${photoUrl ? 'has-photo' : 'is-empty'}`}
            onClick={() => photoInputRef.current?.click()}
            role="button"
            aria-label="Add photo / 添加照片"
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') photoInputRef.current?.click()
            }}
          >
            {photoUrl ? (
              <img src={photoUrl} alt="Your photo" />
            ) : (
              <span className="photo-placeholder">🇮🇩</span>
            )}
            {!isCapturing && (
              <div className="photo-badge">
                {photoUrl ? '✎' : '+'}
              </div>
            )}
          </div>

          {!isCapturing && (
            <p className={`photo-hint ${photoUrl ? 'has-photo' : ''}`}>
              {photoUrl
                ? '✎ Tap to change photo · 点击更换照片'
                : '👆 Tap the circle to add your photo · 点击圆圈添加照片'}
            </p>
          )}

            <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhoto}
            style={{ display: 'none' }}
            />

        <p className="share-eyebrow">🇮🇩 INDONESIA · 印度尼西亚</p>
        <h2 className="share-title">
          I Survived the<br />Indonesian Batik Challenge
        </h2>
        <p className="share-name">{data.name}</p>
        <p className="share-id">ID · {data.studentId}</p>

        <BatikDivider />

        <div className="batik-grid">
          {[0, 1, 2, 3].map(i => {
            const revealed = i < data.score
            return (
              <div key={i} className={`batik-cell ${revealed ? 'revealed' : ''}`}>
                {!revealed && <span className="lock">🔒</span>}
              </div>
            )
          })}
        </div>

        <div className="share-stats">
          <div className="share-stat">
            <span className="share-stat-num">{data.score}</span>
            <span className="share-stat-label">/ {data.total} correct</span>
          </div>
          <div className="share-stat-divider" />
          <div className="share-stat">
            <span className="share-stat-num">{seconds}</span>
            <span className="share-stat-label">seconds</span>
          </div>
        </div>

        <p className="share-hint">
          {isCapturing
            ? (perfect
                ? '🎉 Perfect score! 全对！'
                : '🙏 Thank you! 感谢参与！ Terima Kasih!')
            : (perfect
                ? '🎉 Perfect score! 全对！'
                : '📸 Save & share to Moments! 保存并分享到朋友圈！')}
        </p>
      </div>

      <button
        className="btn save-btn"
        onClick={saveImage}
        disabled={saving}
        style={{ width: '100%', marginTop: 16 }}
      >
        {saving ? 'Menyiapkan… / 处理中…' : '💾 Save Card / 保存卡片'}
      </button>

      <p className="muted small save-hint">
        Tap to save · long-press the image to save to album<br />
        点击保存 · 长按图片保存到相册
      </p>

      <div className="steps-banner">
        <div className="step">
            <span className="step-num">1</span>
            <span className="step-text">
            Tap the circle<br />点击圆圈
            </span>
        </div>
        <div className="step-arrow">→</div>
        <div className="step">
            <span className="step-num">2</span>
            <span className="step-text">
            Save Card<br />保存卡片
            </span>
        </div>
        <div className="step-arrow">→</div>
        <div className="step">
            <span className="step-num">3</span>
            <span className="step-text">
            Long-press to save<br />长按保存
            </span>
        </div>
     </div>

      <div className="card mt">
        <h3 className="detail-title">Your answers / 你的答案</h3>
        <ul className="results">
          {data.results.map((r, i) => (
            <li key={r.questionId} className={r.isCorrect ? 'ok' : 'bad'}>
              <div className="result-icon">{r.isCorrect ? '✓' : '✕'}</div>
              <div>
                <div><b>Q{i + 1}.</b> {r.textEn}</div>
                <div className="muted small">{r.textZh}</div>
              </div>
            </li>
          ))}
        </ul>

        <div className="actions">
          <Link to="/leaderboard" className="btn">Leaderboard / 排行榜</Link>
          <Link to="/" className="btn ghost">Back / 返回</Link>
        </div>
      </div>

      {showPreview && previewUrl && (
        <div className="modal-backdrop" onClick={() => setShowPreview(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <p className="modal-hint">
              📱 <b>Long-press the image</b> to save to album<br />
              手机上<b>长按图片</b>保存到相册
            </p>
            <img src={previewUrl} alt="Challenge card" />
            <div className="modal-actions">
              <a href={previewUrl} download={filename} className="btn">
                Download / 下载
              </a>
              <button
                onClick={() => setShowPreview(false)}
                className="btn ghost"
                style={{ marginTop: 0 }}
              >
                Close / 关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}