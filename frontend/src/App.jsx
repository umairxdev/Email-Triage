import { useState } from 'react'

const CATEGORY_COLORS = {
  spam: '#ef4444',
  promotions: '#f59e0b',
  social: '#3b82f6',
  updates: '#10b981',
  personal: '#8b5cf6'
}

const CATEGORY_ICONS = {
  spam: '⚠️',
  promotions: '🏷️',
  social: '💬',
  updates: '📢',
  personal: '✉️'
}

function App() {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const classify = async () => {
    if (!subject.trim() && !body.trim()) {
      setError('Please enter a subject or body')
      return
    }
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Classification failed')
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const clear = () => {
    setSubject('')
    setBody('')
    setResult(null)
    setError('')
  }

  return (
    <div className="container">
      <header className="header-section">
        <h1 className="app-title">Email Triage</h1>
        <p className="app-subtitle">Paste any email to classify it</p>
      </header>

      <div className="input-card">
        <div className="input-group">
          <label className="input-label">Subject</label>
          <input
            type="text"
            className="input-field"
            placeholder="Enter email subject..."
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label className="input-label">Body</label>
          <textarea
            className="text-area-field"
            placeholder="Paste email content here..."
            rows={5}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>
      </div>

      <div className="button-row">
        <button
          className="btn btn-primary"
          onClick={classify}
          disabled={loading}
        >
          {loading ? 'Classifying...' : 'Classify'}
        </button>
        <button
          className="btn btn-secondary"
          onClick={clear}
        >
          Clear
        </button>
      </div>

      {error && <div className="error-text">{error}</div>}

      {result && (
        <div className="result-card">
          <div className="result-header">
            <span
              className="category-pill"
              style={{ backgroundColor: CATEGORY_COLORS[result.category] + '15', color: CATEGORY_COLORS[result.category] }}
            >
              {CATEGORY_ICONS[result.category]} {result.category}
            </span>
            <span
              className="confidence-display"
              style={{ color: CATEGORY_COLORS[result.category] }}
            >
              {result.confidence}%
            </span>
          </div>

          <div className="scores-grid">
            {Object.entries(result.all_scores).map(([cat, score]) => (
              <div
                key={cat}
                className={`score-row ${cat === result.category ? 'winner' : ''}`}
              >
                <span className="score-name">{cat}</span>
                <div className="score-bar-track">
                  <div
                    className="score-bar-progress"
                    style={{
                      width: `${score}%`,
                      backgroundColor: CATEGORY_COLORS[cat]
                    }}
                  />
                </div>
                <span
                  className="score-value"
                  style={{ color: CATEGORY_COLORS[cat] }}
                >
                  {score}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <footer className="footer-text">
        Powered by machine learning
      </footer>
    </div>
  )
}

export default App