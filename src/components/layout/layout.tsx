import React from 'react'
import { Sidebar } from './sidebar'
import { Header } from './header'

interface LayoutProps {
  children: React.ReactNode
  user?: { name: string; email: string }
  onLogout: () => void
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} onLogout={onLogout} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}