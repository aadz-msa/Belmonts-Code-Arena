import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { EntryPage } from './pages/EntryPage'
import { ArenaPage } from './pages/ArenaPage'
import { LeaderboardPage } from './pages/LeaderboardPage'
import { ResultsPage } from './pages/ResultsPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EntryPage />} />
        <Route path="/arena" element={<ArenaPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
