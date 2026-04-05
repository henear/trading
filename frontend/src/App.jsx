import { useState } from 'react'
import Watchlist from './components/Watchlist'
import StockDetail from './components/StockDetail'

export default function App() {
  const [selectedSymbol, setSelectedSymbol] = useState(null)

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>Trading Dashboard</h1>
          <div className="subtitle">Real-time prices · AI-powered investment strategies</div>
        </div>
      </header>

      <main className="main-layout">
        <Watchlist onSelectSymbol={setSelectedSymbol} selectedSymbol={selectedSymbol} />
        <StockDetail symbol={selectedSymbol} />
      </main>
    </div>
  )
}
