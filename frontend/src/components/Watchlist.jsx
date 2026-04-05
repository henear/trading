import { useState, useCallback } from 'react'
import { getQuote } from '../api/stockApi'

function formatPrice(price) {
  return price?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatVolume(vol) {
  if (!vol) return '--'
  if (vol >= 1_000_000) return (vol / 1_000_000).toFixed(1) + 'M'
  if (vol >= 1_000) return (vol / 1_000).toFixed(0) + 'K'
  return vol.toString()
}

export default function Watchlist({ onSelectSymbol, selectedSymbol }) {
  const [input, setInput] = useState('')
  const [stocks, setStocks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const addSymbol = useCallback(async () => {
    const symbol = input.trim().toUpperCase()
    if (!symbol) return
    if (stocks.find(s => s.symbol === symbol)) {
      setError(`${symbol} already in watchlist`)
      return
    }

    setLoading(true)
    setError('')
    try {
      const res = await getQuote(symbol)
      setStocks(prev => [...prev, res.data])
      setInput('')
      onSelectSymbol(res.data.symbol)
    } catch {
      setError(`Could not find symbol: ${symbol}`)
    } finally {
      setLoading(false)
    }
  }, [input, stocks, onSelectSymbol])

  const refreshAll = useCallback(async () => {
    if (!stocks.length) return
    const updated = await Promise.all(
      stocks.map(s => getQuote(s.symbol).then(r => r.data).catch(() => s))
    )
    setStocks(updated)
  }, [stocks])

  const removeSymbol = useCallback((symbol, e) => {
    e.stopPropagation()
    setStocks(prev => prev.filter(s => s.symbol !== symbol))
    if (selectedSymbol === symbol) onSelectSymbol(null)
  }, [selectedSymbol, onSelectSymbol])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') addSymbol()
  }

  return (
    <div className="watchlist-panel">
      <div className="panel-title">Watchlist</div>

      <div className="add-symbol-form">
        <input
          value={input}
          onChange={e => setInput(e.target.value.toUpperCase())}
          onKeyDown={handleKeyDown}
          placeholder="Enter symbol (e.g. AAPL)"
          maxLength={10}
        />
        <button className="btn btn-primary" onClick={addSymbol} disabled={loading || !input.trim()}>
          {loading ? <span className="loading-spinner" /> : '+'}
        </button>
      </div>

      {error && <div className="error-text" style={{ marginBottom: 12 }}>{error}</div>}

      {stocks.length === 0 ? (
        <div className="empty-watchlist">Add a stock symbol to get started</div>
      ) : (
        <>
          {stocks.map(stock => {
            const isPositive = stock.changePercent >= 0
            const changeClass = isPositive ? 'positive' : 'negative'
            const sign = isPositive ? '+' : ''
            return (
              <div
                key={stock.symbol}
                className={`stock-card ${selectedSymbol === stock.symbol ? 'active' : ''}`}
                onClick={() => onSelectSymbol(stock.symbol)}
              >
                <div className="stock-card-left">
                  <div className="symbol">{stock.symbol}</div>
                  <div className="currency">{stock.currency}</div>
                </div>
                <div className="stock-card-right">
                  <div className="price">${formatPrice(stock.price)}</div>
                  <div className={`change-badge ${changeClass}`}>
                    {sign}{formatPrice(stock.change)} ({sign}{stock.changePercent?.toFixed(2)}%)
                  </div>
                </div>
                <button className="btn-danger" onClick={e => removeSymbol(stock.symbol, e)} title="Remove">×</button>
              </div>
            )
          })}
          <button className="btn btn-secondary" style={{ width: '100%', marginTop: 8 }} onClick={refreshAll}>
            Refresh All
          </button>
        </>
      )}
    </div>
  )
}
