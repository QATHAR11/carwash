import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { RevenueChart } from '@/components/charts/revenue-chart'
import { supabase } from '@/lib/supabase'
import { exportToExcel, exportToPDF, ReportData } from '@/lib/reports'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'

export const Reports: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData[]>([])
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  })
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalSales, setTotalSales] = useState(0)

  useEffect(() => {
    fetchReportData()
  }, [dateRange])

  const fetchReportData = async () => {
    setLoading(true)
    try {
      const { data: salesData, error } = await supabase
        .from('sales')
        .select(`
          *,
          services (name),
          users (name)
        `)
        .gte('date', dateRange.startDate)
        .lte('date', dateRange.endDate)
        .order('date', { ascending: false })

      if (error) throw error

      const formattedData: ReportData[] = salesData?.map((sale: any) => ({
        service: sale.services?.name || 'Unknown Service',
        amount: sale.amount,
        staff: sale.users?.name || 'Unknown Staff',
        date: sale.date
      })) || []

      setReportData(formattedData)

      // Calculate totals
      const revenue = formattedData.reduce((sum, item) => sum + item.amount, 0)
      setTotalRevenue(revenue)
      setTotalSales(formattedData.length)

      // Process chart data
      const serviceMap = new Map()
      formattedData.forEach((sale) => {
        if (serviceMap.has(sale.service)) {
          serviceMap.set(sale.service, {
            name: sale.service,
            revenue: serviceMap.get(sale.service).revenue + sale.amount,
            count: serviceMap.get(sale.service).count + 1
          })
        } else {
          serviceMap.set(sale.service, {
            name: sale.service,
            revenue: sale.amount,
            count: 1
          })
        }
      })

      setChartData(Array.from(serviceMap.values()))
    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportExcel = () => {
    const filename = `CarWash_Report_${format(new Date(), 'yyyy-MM-dd')}`
    exportToExcel(reportData, filename)
  }

  const handleExportPDF = () => {
    const filename = `CarWash_Report_${format(new Date(), 'yyyy-MM-dd')}`
    exportToPDF(reportData, filename)
  }

  const setQuickDateRange = (months: number) => {
    const endDate = new Date()
    const startDate = subMonths(endDate, months)
    setDateRange({
      startDate: format(startOfMonth(startDate), 'yyyy-MM-dd'),
      endDate: format(endOfMonth(endDate), 'yyyy-MM-dd')
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
            Reports & Analytics
          </h1>
          <p className="text-gray-600 mt-2">Comprehensive business insights and data export</p>
        </div>
      </div>

      {/* Filters and Export */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Report Filters & Export</CardTitle>
          <CardDescription>Customize your report parameters and export data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Quick Select</Label>
              <Select onChange={(e) => setQuickDateRange(parseInt(e.target.value))}>
                <option value="">Select Period</option>
                <option value="1">Last Month</option>
                <option value="3">Last 3 Months</option>
                <option value="6">Last 6 Months</option>
                <option value="12">Last Year</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Export Options</Label>
              <div className="flex space-x-2">
                <Button 
                  onClick={handleExportExcel} 
                  variant="outline" 
                  size="sm"
                  disabled={reportData.length === 0}
                  className="flex-1"
                >
                  📊 Excel
                </Button>
                <Button 
                  onClick={handleExportPDF} 
                  variant="outline" 
                  size="sm"
                  disabled={reportData.length === 0}
                  className="flex-1"
                >
                  📄 PDF
                </Button>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <h3 className="text-sm font-medium text-green-800">Total Revenue</h3>
              <p className="text-2xl font-bold text-green-900">KSh {totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <h3 className="text-sm font-medium text-blue-800">Total Sales</h3>
              <p className="text-2xl font-bold text-blue-900">{totalSales}</p>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <h3 className="text-sm font-medium text-purple-800">Average Sale</h3>
              <p className="text-2xl font-bold text-purple-900">
                KSh {totalSales > 0 ? Math.round(totalRevenue / totalSales).toLocaleString() : '0'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Revenue by Service</CardTitle>
              <CardDescription>Service performance comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueChart data={chartData} type="bar" />
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Service Distribution</CardTitle>
              <CardDescription>Revenue share breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueChart data={chartData} type="pie" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Data Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Sales Data</CardTitle>
          <CardDescription>Detailed transaction records</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : reportData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-3 font-semibold text-gray-700">Service</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Amount</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Staff</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3">{item.service}</td>
                      <td className="p-3 font-semibold text-green-600">KSh {item.amount.toLocaleString()}</td>
                      <td className="p-3">{item.staff}</td>
                      <td className="p-3">{format(new Date(item.date), 'MMM dd, yyyy')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>No data found for the selected date range</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}