import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/layout/layout'
import { Login } from '@/pages/login'
import { Dashboard } from '@/pages/dashboard'
import { Services } from '@/pages/services'
import { Customers } from '@/pages/customers'
import { Bookings } from '@/pages/bookings'
import { User } from '@/types'

function App() {
  const [user, setUser] = useState<User | null>(null)

  const handleLogin = (email: string, password: string) => {
    // Simple mock authentication
    if (email === 'admin@carwash.com' && password === 'admin123') {
      setUser({
        id: '1',
        email: 'admin@carwash.com',
        name: 'Admin User',
        role: 'admin'
      })
    } else {
      alert('Invalid credentials. Use admin@carwash.com / admin123')
    }
  }

  const handleLogout = () => {
    setUser(null)
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
        </Routes>
      </Layout>
    </Router>
  )
}

export default App