import { Service, Customer, Booking, DashboardStats } from '@/types'

export const mockServices: Service[] = [
  {
    id: '1',
    name: 'Basic Car Wash',
    description: 'Exterior wash with soap and rinse',
    price: 15,
    duration: 30,
    category: 'wash'
  },
  {
    id: '2',
    name: 'Premium Car Wash',
    description: 'Exterior wash, wax, and interior cleaning',
    price: 35,
    duration: 60,
    category: 'wash'
  },
  {
    id: '3',
    name: 'Oil Change',
    description: 'Full synthetic oil change with filter',
    price: 45,
    duration: 45,
    category: 'oil'
  },
  {
    id: '4',
    name: 'Tire Rotation',
    description: 'Rotate all four tires for even wear',
    price: 25,
    duration: 30,
    category: 'maintenance'
  },
  {
    id: '5',
    name: 'Full Detail',
    description: 'Complete interior and exterior detailing',
    price: 120,
    duration: 180,
    category: 'wash'
  }
]

export const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '(555) 123-4567',
    carMake: 'Toyota',
    carModel: 'Camry',
    carYear: 2020,
    licensePlate: 'ABC123',
    lastService: '2024-01-15',
    totalVisits: 5
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '(555) 987-6543',
    carMake: 'Honda',
    carModel: 'Civic',
    carYear: 2019,
    licensePlate: 'XYZ789',
    lastService: '2024-01-10',
    totalVisits: 3
  },
  {
    id: '3',
    name: 'Mike Davis',
    email: 'mike.davis@email.com',
    phone: '(555) 456-7890',
    carMake: 'Ford',
    carModel: 'F-150',
    carYear: 2021,
    licensePlate: 'DEF456',
    lastService: '2024-01-12',
    totalVisits: 8
  }
]

export const mockBookings: Booking[] = [
  {
    id: '1',
    customerId: '1',
    serviceId: '2',
    staffMember: 'Alex Rodriguez',
    date: '2024-01-20',
    time: '10:00',
    status: 'completed',
    price: 35,
    notes: 'Customer requested extra attention to wheels'
  },
  {
    id: '2',
    customerId: '2',
    serviceId: '3',
    staffMember: 'Maria Garcia',
    date: '2024-01-20',
    time: '14:00',
    status: 'in-progress',
    price: 45
  },
  {
    id: '3',
    customerId: '3',
    serviceId: '1',
    staffMember: 'James Wilson',
    date: '2024-01-21',
    time: '09:00',
    status: 'pending',
    price: 15
  }
]

export const mockDashboardStats: DashboardStats = {
  dailyRevenue: 285,
  carsServiced: 12,
  pendingBookings: 5,
  completedServices: 8,
  popularService: 'Premium Car Wash'
}