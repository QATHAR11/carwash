import React from 'react'
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StatsCard } from '@/components/ui/stats-card'
import { RevenueChart } from '@/components/charts/revenue-chart'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import { Sale, User } from '@/types'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { getCurrentUser } from '@/lib/auth'

interface DashboardProps {
  user?: User
}

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [stats, setStats] = useState({
    dailyRevenue: 0,
    monthlyRevenue: 0,
    totalSales: 0,
    averageTransaction: 0
  })
  const [chartData, setChartData] = useState<any[]>([])
  const [recentSales, setRecentSales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isRecordSaleModalOpen, setIsRecordSaleModalOpen] = useState(false)
  const [services, setServices] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [saleFormData, setSaleFormData] = useState({
    service_id: '',
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd')
  })

  useEffect(() => {
    fetchDashboardData()
    fetchServices()
    loadCurrentUser()
  }, [])

  const loadCurrentUser = async () => {
    const user = await getCurrentUser()
    setCurrentUser(user)
  }

  const fetchServices = async () => {
    try {
      const { data } = await supabase
        .from('services')
        .select('*')
        .order('name')
      
      setServices(data || [])
    } catch (error) {
      console.error('Error fetching services:', error)
    }
  }
  const fetchDashboardData = async () => {
    try {
      const today = new Date()
      const startOfToday = format(today, 'yyyy-MM-dd')
      const startOfCurrentMonth = format(startOfMonth(today), 'yyyy-MM-dd')
      const endOfCurrentMonth = format(endOfMonth(today), 'yyyy-MM-dd')

      // Check if user is admin to determine data scope
      const user = await getCurrentUser()
      const isAdmin = user?.role === 'admin'

      // Fetch daily revenue
      let dailySalesQuery = supabase
        .from('sales')
        .select('amount')
        .eq('date', startOfToday)
      
      if (!isAdmin) {
        dailySalesQuery = dailySalesQuery.eq('staff_id', user?.id)
      }
      
      const { data: dailySales } = await dailySalesQuery

      // Fetch monthly revenue
      let monthlySalesQuery = supabase
        .from('sales')
        .select('amount')
        .gte('date', startOfCurrentMonth)
        .lte('date', endOfCurrentMonth)
      
      if (!isAdmin) {
        monthlySalesQuery = monthlySalesQuery.eq('staff_id', user?.id)
      }
      
      const { data: monthlySales } = await monthlySalesQuery

      // Fetch service-wise revenue for charts
      let serviceRevenueQuery = supabase
        .from('sales')
        .select(`
          amount,
          services (name)
        `)
        .gte('date', startOfCurrentMonth)
        .lte('date', endOfCurrentMonth)
      
      if (!isAdmin) {
        serviceRevenueQuery = serviceRevenueQuery.eq('staff_id', user?.id)
      }
      
      const { data: serviceRevenue } = await serviceRevenueQuery

      // Fetch recent sales
      let recentSalesQuery = supabase
        .from('sales')
        .select(`
          *,
          services (name),
          users (name)
        `)
        .order('created_at', { ascending: false })
        .limit(5)
      
      if (!isAdmin) {
        recentSalesQuery = recentSalesQuery.eq('staff_id', user?.id)
      }
      
      const { data: recentSalesData } = await recentSalesQuery

      // Calculate stats
      const dailyTotal = dailySales?.reduce((sum, sale) => sum + sale.amount, 0) || 0
      const monthlyTotal = monthlySales?.reduce((sum, sale) => sum + sale.amount, 0) || 0
      const totalSalesCount = monthlySales?.length || 0
      const averageTransaction = totalSalesCount > 0 ? monthlyTotal / totalSalesCount : 0

      setStats({
        dailyRevenue: dailyTotal,
        monthlyRevenue: monthlyTotal,
        totalSales: totalSalesCount,
        averageTransaction
      })

      // Process chart data
      const serviceMap = new Map()
      serviceRevenue?.forEach((sale: any) => {
        const serviceName = sale.services?.name || 'Unknown'
        if (serviceMap.has(serviceName)) {
          serviceMap.set(serviceName, {
            name: serviceName,
            revenue: serviceMap.get(serviceName).revenue + sale.amount,
            count: serviceMap.get(serviceName).count + 1
          })
        } else {
          serviceMap.set(serviceName, {
            name: serviceName,
            revenue: sale.amount,
            count: 1
          })
        }
      })

      setChartData(Array.from(serviceMap.values()))
      setRecentSales(recentSalesData || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRecordSale = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const { error } = await supabase
        .from('sales')
        .insert({
          service_id: saleFormData.service_id,
          staff_id: currentUser?.id,
          amount: parseFloat(saleFormData.amount),
          date: saleFormData.date
        })

      if (error) throw error

      // Reset form and close modal
      setSaleFormData({
        service_id: '',
        amount: '',
        date: format(new Date(), 'yyyy-MM-dd')
      })
      setIsRecordSaleModalOpen(false)
      
      // Refresh dashboard data
      fetchDashboardData()
    } catch (error) {
      console.error('Error recording sale:', error)
      alert('Error recording sale. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              {currentUser?.role === 'admin' ? 'Business overview and management' : 'Your sales performance'}
            </p>
          </div>
          {currentUser?.role === 'staff' && (
            <Button onClick={() => setIsRecordSaleModalOpen(true)} className="bg-green-600 hover:bg-green-700">
              Record Sale
            </Button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title={currentUser?.role === 'admin' ? "Today's Revenue" : "My Today's Sales"}
          value={`KSh ${stats.dailyRevenue.toLocaleString()}`}
          icon={<span>💰</span>}
          className="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
        />
        
        <StatsCard
          title={currentUser?.role === 'admin' ? "Monthly Revenue" : "My Monthly Sales"}
          value={`KSh ${stats.monthlyRevenue.toLocaleString()}`}
          icon={<span>📈</span>}
          className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
        />
        
        <StatsCard
          title={currentUser?.role === 'admin' ? "Total Sales" : "My Total Sales"}
          value={stats.totalSales}
          icon={<span>🛒</span>}
          className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
        />
        
        <StatsCard
          title={currentUser?.role === 'admin' ? "Average Transaction" : "My Average Sale"}
          value={`KSh ${Math.round(stats.averageTransaction).toLocaleString()}`}
          icon={<span>💳</span>}
          className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200"
        />
      </div>

      {/* Charts Section - Only for Admin/Owner */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">
                {currentUser?.role === 'admin' ? 'Revenue by Service' : 'My Sales by Service'}
              </CardTitle>
              <CardDescription>
                {currentUser?.role === 'admin' ? 'Monthly revenue breakdown by service type' : 'Your monthly sales breakdown'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueChart data={chartData} type="bar" />
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">
                {currentUser?.role === 'admin' ? 'Service Distribution' : 'My Service Distribution'}
              </CardTitle>
              <CardDescription>
                {currentUser?.role === 'admin' ? 'Revenue share by service category' : 'Your sales distribution'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueChart data={chartData} type="pie" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800">
              {currentUser?.role === 'admin' ? 'Recent Sales' : 'My Recent Sales'}
            </CardTitle>
            <CardDescription>
              {currentUser?.role === 'admin' ? 'Latest transactions in your system' : 'Your latest transactions'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSales.map((sale: any) => (
                <div key={sale.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                  <div>
                    <p className="font-semibold text-gray-900">{sale.services?.name || 'Unknown Service'}</p>
                    {currentUser?.role === 'admin' && (
                      <p className="text-sm text-gray-600">by {sale.users?.name || 'Unknown Staff'}</p>
                    )}
                    <p className="text-xs text-gray-500">{format(new Date(sale.date), 'MMM dd, yyyy')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-green-600">KSh {sale.amount.toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {recentSales.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No recent sales found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800">
              {currentUser?.role === 'admin' ? 'Top Services' : 'My Top Services'}
            </CardTitle>
            <CardDescription>
              {currentUser?.role === 'admin' ? 'Best performing services this month' : 'Your best performing services'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {chartData.slice(0, 5).map((service, index) => (
                <div key={service.name} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-lg border border-gray-200">
                  <div>
                    <p className="font-semibold text-gray-900">{service.name}</p>
                    <p className="text-sm text-gray-600">{service.count} sales • KSh {service.revenue.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-blue-600">#{index + 1}</span>
                  </div>
                </div>
              ))}
              {chartData.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No service data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Record Sale Modal */}
      <Modal
        isOpen={isRecordSaleModalOpen}
        onClose={() => setIsRecordSaleModalOpen(false)}
        title="Record New Sale"
        className="max-w-md"
      >
        <form onSubmit={handleRecordSale} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="service_id">Service</Label>
            <Select
              id="service_id"
              value={saleFormData.service_id}
              onChange={(e) => setSaleFormData({ ...saleFormData, service_id: e.target.value })}
              required
            >
              <option value="">Select a service</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (KSh)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={saleFormData.amount}
              onChange={(e) => setSaleFormData({ ...saleFormData, amount: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={saleFormData.date}
              onChange={(e) => setSaleFormData({ ...saleFormData, date: e.target.value })}
              required
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
              Record Sale
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsRecordSaleModalOpen(false)} 
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}