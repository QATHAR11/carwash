import React from 'react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User } from '@/types'
import { supabase } from '@/lib/supabase'

interface HeaderProps {
  user: User
  onLogout: () => void
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [profileData, setProfileData] = useState({
    name: user.name,
    email: user.email,
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Update user profile in public.users table
      const { error: profileError } = await supabase
        .from('users')
        .update({
          name: profileData.name,
          email: profileData.email
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      // Update password if provided
      if (profileData.newPassword) {
        if (profileData.newPassword !== profileData.confirmPassword) {
          throw new Error('New passwords do not match')
        }

        const { error: passwordError } = await supabase.auth.updateUser({
          password: profileData.newPassword
        })

        if (passwordError) throw passwordError
      }

      // Update email in auth if changed
      if (profileData.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: profileData.email
        })

        if (emailError) throw emailError
      }

      alert('Profile updated successfully!')
      setIsProfileModalOpen(false)
      
      // Reset password fields
      setProfileData({
        ...profileData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error: any) {
      alert(error.message || 'Error updating profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Welcome back, {user.name}
            </h2>
            <p className="text-sm text-gray-600">{user.email} • <span className="capitalize text-blue-600">{user.role}</span></p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold hover:from-blue-600 hover:to-blue-700 transition-all cursor-pointer"
            >
              {user.name.charAt(0).toUpperCase()}
            </button>
            <Button variant="outline" onClick={onLogout} className="hover:bg-red-50 hover:text-red-600 hover:border-red-300">
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Profile Update Modal */}
      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title="Update Profile"
        className="max-w-md"
      >
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              required
            />
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Change Password (Optional)</h3>
            
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={profileData.newPassword}
                onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })}
                placeholder="Leave blank to keep current password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={profileData.confirmPassword}
                onChange={(e) => setProfileData({ ...profileData, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Updating...' : 'Update Profile'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsProfileModalOpen(false)} 
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}