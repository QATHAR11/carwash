import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/layout/layout'
import { Login } from '@/pages/login'
import { Dashboard } from '@/pages/dashboard'
import { Services } from '@/pages/services'
import { Customers } from '@/pages/customers'
import { Bookings } from '@/pages/bookings'
import { Reports } from '@/pages/reports'
import { UserManagement } from '@/pages/user-management'
import { User } from '@/types'
import { getCurrentUser, signOut } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    getCurrentUser().then((user) => {
      setUser(user)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const user = await getCurrentUser()
        setUser(user)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogin = async (userData: User) => {
    setUser(userData)
  }

  const handleLogout = async () => {
    try {
      await signOut()
      setUser(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="text-4xl mb-4">🚗</div>
          <p className="text-gray-600">Loading CarWash Pro...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <Router>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/services" element={<Services />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/bookings" element={<Bookings />} />
          {(user.role === 'admin' || user.role === 'owner') && (
            <>
              <Route path="/reports" element={<Reports />} />
              <Route path="/users" element={<UserManagement />} />
            </>
          )}
        </Routes>
      </Layout>
    </Router>
  )
}

export default App