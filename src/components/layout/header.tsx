import React from 'react'
import { Button } from '@/components/ui/button'
import { User } from '@/types'

interface HeaderProps {
  user: User
  onLogout: () => void
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-white shadow-lg border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Welcome back, {user.name}
          </h2>
          <p className="text-sm text-gray-600">{user.email} • <span className="capitalize text-blue-600">{user.role}</span></p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <Button variant="outline" onClick={onLogout} className="hover:bg-red-50 hover:text-red-600 hover:border-red-300">
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}