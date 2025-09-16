import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { User } from '@/types'

const getNavigation = (userRole: string) => [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Services', href: '/services', icon: '🚗' },
  { name: 'Customers', href: '/customers', icon: '👥' },
  { name: 'Bookings', href: '/bookings', icon: '📅' },
  ...(userRole === 'admin' || userRole === 'owner' ? [
    { name: 'Reports', href: '/reports', icon: '📈' },
    { name: 'Users', href: '/users', icon: '👤' },
  ] : [])
]

interface SidebarProps {
  user: User
}

export const Sidebar: React.FC<SidebarProps> = ({ user }) => {
  const location = useLocation()
  const navigation = getNavigation(user.role)

  return (
    <div className="flex flex-col w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-xl">
      <div className="flex items-center justify-center h-16 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🚗</span>
          <h1 className="text-xl font-bold">CarWash Pro</h1>
        </div>
      </div>
      
      <div className="px-4 py-3 bg-gray-800 border-b border-gray-700">
        <p className="text-sm text-gray-300">Welcome back,</p>
        <p className="font-semibold text-white">{user.name}</p>
        <p className="text-xs text-blue-300 capitalize">{user.role}</p>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105',
              location.pathname === item.href
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white hover:shadow-md'
            )}
          >
            <span className="mr-3 text-lg">{item.icon}</span>
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  )
}