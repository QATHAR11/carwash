import React from 'react'
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StatsCard } from '@/components/ui/stats-card'
import { RevenueChart } from '@/components/charts/revenue-chart'
import { supabase } from '@/lib/supabase'
import { Sale, User } from '@/types'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'

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

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const today = new Date()
      const startOfToday = format(today, 'yyyy-MM-dd')
      const startOfCurrentMonth = format(startOfMonth(today), 'yyyy-MM-dd')
      const endOfCurrentMonth = format(endOfMonth(today), 'yyyy-MM-dd')

      // Fetch daily revenue
      const { data: dailySales } = await supabase
        .from('sales')
        .select('amount')
        .eq('date', startOfToday)

      // Fetch monthly revenue
      const { data: monthlySales } = await supabase
        .from('sales')
        .select('amount')
        .gte('date', startOfCurrentMonth)
        .lte('date', endOfCurrentMonth)

      // Fetch service-wise revenue for charts
      const { data: serviceRevenue } = await supabase
        .from('sales')
        .select(`
          amount,
          services (name)
        `)
        .gte('date', startOfCurrentMonth)
        .lte('date', endOfCurrentMonth)

      // Fetch recent sales
      const { data: recentSalesData } = await supabase
        .from('sales')
        .select(`
          *,
          services (name),
          users (name)
        `)
        .order('created_at', { ascending: false })
        .limit(5)

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
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-gray-600 mt-2">Welcome to your business overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Today's Revenue"
          value={`KSh ${stats.dailyRevenue.toLocaleString()}`}
          icon={<span>💰</span>}
          className="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
        />
        
        <StatsCard
          title="Monthly Revenue"
          value={`KSh ${stats.monthlyRevenue.toLocaleString()}`}
          icon={<span>📈</span>}
          className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
        />
        
        <StatsCard
          title="Total Sales"
          value={stats.totalSales}
          icon={<span>🛒</span>}
          className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
        />
        
        <StatsCard
          title="Average Transaction"
          value={`KSh ${Math.round(stats.averageTransaction).toLocaleString()}`}
          icon={<span>💳</span>}
          className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200"
        />
      </div>

      {/* Charts Section - Only for Admin/Owner */}
      {(user?.role === 'admin' || user?.role === 'owner') && chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">Revenue by Service</CardTitle>
              <CardDescription>Monthly revenue breakdown by service type</CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueChart data={chartData} type="bar" />
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">Service Distribution</CardTitle>
              <CardDescription>Revenue share by service category</CardDescription>
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
            <CardTitle className="text-xl font-semibold text-gray-800">Recent Sales</CardTitle>
            <CardDescription>Latest transactions in your system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSales.map((sale: any) => (
                <div key={sale.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                  <div>
                    <p className="font-semibold text-gray-900">{sale.services?.name || 'Unknown Service'}</p>
                    <p className="text-sm text-gray-600">by {sale.users?.name || 'Unknown Staff'}</p>
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
            <CardTitle className="text-xl font-semibold text-gray-800">Top Services</CardTitle>
            <CardDescription>Best performing services this month</CardDescription>
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
    </div>
  )
}