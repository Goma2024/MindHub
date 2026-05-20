
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useAppContext } from './context/AppContext'
import { useEffect } from 'react'
import Dashboard from './pages/Dashboard'
import ImportPage from './pages/ImportPage'
import KnowledgePage from './pages/KnowledgePage'
import SearchPage from './pages/SearchPage'
import SettingsPage from './pages/SettingsPage'
import Navbar from './components/Navbar'

function AppContent() {
  const { state } = useAppContext()

  useEffect(() => {
    if (state.darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [state.darkMode])

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Navbar />
        <main className="container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={state.user ? <Dashboard /> : <Navigate to="/" replace />} />
            <Route path="/import" element={state.user ? <ImportPage /> : <Navigate to="/" replace />} />
            <Route path="/knowledge" element={state.user ? <KnowledgePage /> : <Navigate to="/" replace />} />
            <Route path="/search" element={state.user ? <SearchPage /> : <Navigate to="/" replace />} />
            <Route path="/settings" element={state.user ? <SettingsPage /> : <Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

export default App

