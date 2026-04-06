import { useState, useEffect, useCallback } from 'react'
import { getQuote, getNews, getAnalysis } from '../api/stockApi'

function formatPrice(price) {
  return price?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatVolume(vol) {
  if (!vol) return '--'
  if (vol >= 1_000_000) return (vol / 1_000_000).toFixed(2) + 'M'
  if (vol >= 1_000) return (vol / 1_000).toFixed(0) + 'K'
  return vol.toString()
}

function renderAnalysis(text) {
  // Convert markdown-style bold (**text**) to <strong>
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    return part
  })
}

export default function StockDetail({ symbol }) {
  const [quote, setQuote] = useState(null)
  const [news, setNews] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [loadingQuote, setLoadingQuote] = useState(false)
  const [loadingNews, setLoadingNews] = useState(false)
  const [loadingAnalysis, setLoadingAnalysis] = useState(false)
  const [quoteError, setQuoteError] = useState('')
  const [newsError, setNewsError] = useState('')
  const [analysisError, setAnalysisError] = useState('')

  const fetchQuote = useCallback(async () => {
    if (!symbol) return
    setLoadingQuote(true)
    setQuoteError('')
    try {
      const res = await getQuote(symbol)
      setQuote(res.data)
    } catch {
      setQuoteError('Failed to load quote')
    } finally {
      setLoadingQuote(false)
    }
  }, [symbol])

  const fetchNews = useCallback(async () => {
    if (!symbol) return
    setLoadingNews(true)
    setNewsError('')
    try {
      const res = await getNews(symbol)
      setNews(res.data)
    } catch {
      setNewsError('Failed to load news')
    } finally {
      setLoadingNews(false)
    }
  }, [symbol])

  const fetchAnalysis = useCallback(async () => {
    if (!symbol) return
    if (!news || news.length === 0) {
      setAnalysisError("Can't analyze: no sufficient info offered. Please fetch news first.")
      return
    }
    setLoadingAnalysis(true)
    setAnalysisError('')
    try {
      const res = await getAnalysis(symbol)
      setAnalysis(res.data)
    } catch {
      setAnalysisError('Failed to run analysis. Check your DeepSeek API key.')
    } finally {
      setLoadingAnalysis(false)
    }
  }, [symbol, news])

  useEffect(() => {
    if (symbol) {
      setQuote(null)
      setNews(null)
      setAnalysis(null)
      fetchQuote()
    }
  }, [symbol])

  if (!symbol) {
    return (
      <div className="detail-panel">
        <div className="detail-empty">Select a stock from your watchlist to see details</div>
      </div>
    )
  }

  const isPositive = quote && quote.changePercent >= 0
  const changeClass = quote ? (isPositive ? 'positive' : 'negative') : 'neutral'
  const sign = isPositive ? '+' : ''

  return (
    <div className="detail-panel">
      {/* Header */}
      <div className="detail-header">
        <div>
          <div className="detail-symbol">{symbol}</div>
          {quote && (
            <div className="detail-stats">
              <div className="stat">
                <span className="stat-label">Day High</span>
                <span className="stat-value">${formatPrice(quote.dayHigh)}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Day Low</span>
                <span className="stat-value">${formatPrice(quote.dayLow)}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Volume</span>
                <span className="stat-value">{formatVolume(quote.volume)}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Currency</span>
                <span className="stat-value">{quote.currency}</span>
              </div>
            </div>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          {loadingQuote ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <span className="loading-spinner" /> Loading...
            </div>
          ) : quoteError ? (
            <div className="error-text">{quoteError}</div>
          ) : quote ? (
            <>
              <div className="detail-price">${formatPrice(quote.price)}</div>
              <div className={`detail-change ${changeClass}`}>
                {sign}{formatPrice(quote.change)} ({sign}{quote.changePercent?.toFixed(2)}%)
              </div>
            </>
          ) : null}
          <button
            className="btn btn-secondary"
            style={{ marginTop: 10, fontSize: '0.8rem', padding: '5px 12px' }}
            onClick={fetchQuote}
            disabled={loadingQuote}
          >
            Refresh Price
          </button>
        </div>
      </div>

      {/* News Section */}
      <div className="section-title">
        Latest News
      </div>

      <div className="analyze-btn-row">
        <button className="refresh-btn" onClick={fetchNews} disabled={loadingNews}>
          {loadingNews
            ? <><span className="loading-spinner" /> Fetching...</>
            : news ? 'Refresh News' : 'Fetch News'}
        </button>
      </div>

      {newsError && <div className="error-text" style={{ marginBottom: 14 }}>{newsError}</div>}

      {news && !loadingNews && (
        news.length > 0 ? (
          <div className="news-list">
            {news.map((item, i) => (
              <div className="news-item" key={i}>
                <a href={item.link} target="_blank" rel="noopener noreferrer">
                  {item.title}
                </a>
                <div className="news-meta">
                  <div className="publisher">{item.publisher}</div>
                  <div className="date">{item.publishedAt}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: '#484f58', fontSize: '0.85rem', textAlign: 'center', padding: '12px 0' }}>
            No recent news found for this symbol.
          </div>
        )
      )}

      {!news && !loadingNews && (
        <div style={{ color: '#484f58', fontSize: '0.85rem', textAlign: 'center', padding: '12px 0' }}>
          Click "Fetch News" to load recent headlines
        </div>
      )}

      {/* AI Analysis Section */}
      <div className="section-title" style={{ marginTop: 24 }}>
        AI Investment Strategy
        <span className="tag">Powered by DeepSeek</span>
      </div>

      <div className="analyze-btn-row">
        <button className="refresh-btn" onClick={fetchAnalysis} disabled={loadingAnalysis}>
          {loadingAnalysis
            ? <><span className="loading-spinner" /> Analyzing...</>
            : analysis ? 'Re-analyze' : 'Analyze with AI'}
        </button>
        {analysis && (
          <span className="analyzed-at">Last analyzed: {analysis.analyzedAt}</span>
        )}
      </div>

      {analysisError && <div className="error-text" style={{ marginBottom: 14 }}>{analysisError}</div>}

      {analysis && !loadingAnalysis && (
        <div className="analysis-box">
          {renderAnalysis(analysis.analysis)}
        </div>
      )}

      {!analysis && !loadingAnalysis && !analysisError && (
        <div style={{ color: '#484f58', fontSize: '0.85rem', textAlign: 'center', padding: '24px 0' }}>
          Click "Analyze with AI" to get an investment strategy based on latest news
        </div>
      )}
    </div>
  )
}
