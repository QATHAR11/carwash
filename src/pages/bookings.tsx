import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Modal } from '@/components/ui/modal'
import { mockBookings, mockServices, mockCustomers } from '@/data/mockData'
import { Booking } from '@/types'

export const Bookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>(mockBookings)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [formData, setFormData] = useState({
    customerId: '',
    serviceId: '',
    staffMember: '',
    date: '',
    time: '',
    status: 'pending' as Booking['status'],
    price: '',
    notes: ''
  })

  const filteredBookings = bookings.filter(booking => 
    filterStatus === 'all' || booking.status === filterStatus
  )

  const getServiceName = (serviceId: string) => {
    return mockServices.find(s => s.id === serviceId)?.name || 'Unknown Service'
  }

  const getCustomerName = (customerId: string) => {
    return mockCustomers.find(c => c.id === customerId)?.name || 'Unknown Customer'
  }

  const getServicePrice = (serviceId: string) => {
    return mockServices.find(s => s.id === serviceId)?.price || 0
  }

  const handleOpenModal = (booking?: Booking) => {
    if (booking) {
      setEditingBooking(booking)
      setFormData({
        customerId: booking.customerId,
        serviceId: booking.serviceId,
        staffMember: booking.staffMember,
        date: booking.date,
        time: booking.time,
        status: booking.status,
        price: booking.price.toString(),
        notes: booking.notes || ''
      })
    } else {
      setEditingBooking(null)
      setFormData({
        customerId: '',
        serviceId: '',
        staffMember: '',
        date: new Date().toISOString().split('T')[0],
        time: '',
        status: 'pending',
        price: '',
        notes: ''
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingBooking(null)
  }

  const handleServiceChange = (serviceId: string) => {
    const price = getServicePrice(serviceId)
    setFormData({ 
      ...formData, 
      serviceId, 
      price: price.toString() 
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const bookingData: Booking = {
      id: editingBooking?.id || Date.now().toString(),
      customerId: formData.customerId,
      serviceId: formData.serviceId,
      staffMember: formData.staffMember,
      date: formData.date,
      time: formData.time,
      status: formData.status,
      price: parseFloat(formData.price),
      notes: formData.notes || undefined
    }

    if (editingBooking) {
      setBookings(bookings.map(b => b.id === editingBooking.id ? bookingData : b))
    } else {
      setBookings([...bookings, bookingData])
    }

    handleCloseModal()
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this booking?')) {
      setBookings(bookings.filter(b => b.id !== id))
    }
  }

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in-progress': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const staffMembers = ['Alex Rodriguez', 'Maria Garcia', 'James Wilson', 'Sarah Chen', 'Mike Johnson']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-600">Manage service appointments and bookings</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          New Booking
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Label htmlFor="status-filter">Filter by status:</Label>
          <Select
            id="status-filter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-40"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredBookings.map((booking) => (
          <Card key={booking.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{getCustomerName(booking.customerId)}</CardTitle>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                  {booking.status}
                </span>
              </div>
              <CardDescription>{getServiceName(booking.serviceId)}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Date & Time:</span>
                  <span className="font-medium">{booking.date} at {booking.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Staff:</span>
                  <span className="font-medium">{booking.staffMember}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Price:</span>
                  <span className="font-medium">${booking.price}</span>
                </div>
                {booking.notes && (
                  <div className="mt-2">
                    <span className="text-sm text-gray-600">Notes:</span>
                    <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{booking.notes}</p>
                  </div>
                )}
              </div>
              <div className="flex space-x-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenModal(booking)}
                  className="flex-1"
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(booking.id)}
                  className="flex-1"
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBookings.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No bookings found for the selected status.</p>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingBooking ? 'Edit Booking' : 'New Booking'}
        className="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customerId">Customer</Label>
            <Select
              id="customerId"
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              required
            >
              <option value="">Select a customer</option>
              {mockCustomers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} - {customer.licensePlate}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="serviceId">Service</Label>
            <Select
              id="serviceId"
              value={formData.serviceId}
              onChange={(e) => handleServiceChange(e.target.value)}
              required
            >
              <option value="">Select a service</option>
              {mockServices.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} - ${service.price}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="staffMember">Staff Member</Label>
            <Select
              id="staffMember"
              value={formData.staffMember}
              onChange={(e) => setFormData({ ...formData, staffMember: e.target.value })}
              required
            >
              <option value="">Select staff member</option>
              {staffMembers.map((staff) => (
                <option key={staff} value={staff}>
                  {staff}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Booking['status'] })}
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any special instructions or notes..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="submit" className="flex-1">
              {editingBooking ? 'Update Booking' : 'Create Booking'}
            </Button>
            <Button type="button" variant="outline" onClick={handleCloseModal} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}