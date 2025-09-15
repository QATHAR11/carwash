import React from 'react'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  user?: { name: string; email: string }
  onLogout: () => void
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Welcome back, {user?.name || 'User'}
          </h2>
          <p className="text-sm text-gray-600">{user?.email}</p>
        </div>
        <Button variant="outline" onClick={onLogout}>
          Logout
        </Button>
      </div>
    </header>
  )
}