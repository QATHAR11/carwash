export interface Service {
  id: string
  name: string
  description: string
  price: number
  duration: number // in minutes
  category: 'wash' | 'oil' | 'maintenance' | 'other'
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  carMake: string
  carModel: string
  carYear: number
  licensePlate: string
  lastService?: string
  totalVisits: number
}

export interface Booking {
  id: string
  customerId: string
  serviceId: string
  staffMember: string
  date: string
  time: string
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled'
  price: number
  notes?: string
}

export interface DashboardStats {
  dailyRevenue: number
  carsServiced: number
  pendingBookings: number
  completedServices: number
  popularService: string
}

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'staff'
}