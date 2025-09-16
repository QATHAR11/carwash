import React from 'react'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { User } from '@/types'

interface LayoutProps {
  children: React.ReactNode
  user: User
  onLogout: () => void
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} onLogout={onLogout} />
        <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-gray-50 to-blue-50">
          {children}
        </main>
      </div>
    </div>
  )
}