import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabaseClient'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import './styles/App.css'

type DashboardPage = 'home' | 'quiz' | 'facescanner' | 'chemicals' | 'health' | 'profile'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [initialPage, setInitialPage] = useState<DashboardPage>('home')
  const [signupInProgress, setSignupInProgress] = useState(false)

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setIsAuthenticated(true)
      }
    }

    checkSession()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      // Ignore auth state changes during signup process
      if (signupInProgress && event === 'SIGNED_IN') {
        return;
      }
      setIsAuthenticated(!!session)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [signupInProgress])

  const handleLogin = (page: DashboardPage = 'home') => {
    setInitialPage(page)
    setIsAuthenticated(true)
  }

  const handleSignupStart = () => {
    setSignupInProgress(true)
  }

  const handleSignupComplete = () => {
    setSignupInProgress(false)
    setInitialPage('home')
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          isAuthenticated ? 
          <Navigate to="/dashboard" /> : 
          <Login 
            onLogin={() => handleLogin('home')} 
            onSignupStart={handleSignupStart}
            onSignupComplete={handleSignupComplete} 
          />
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          isAuthenticated ? 
          <Dashboard initialPage={initialPage} /> : 
          <Navigate to="/" />
        } 
      />
    </Routes>
  )
}

export default App