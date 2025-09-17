import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import { format } from 'date-fns'

export interface ReportData {
  service: string
  amount: number
  staff: string
  date: string
}

export const exportToExcel = (data: ReportData[], filename: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data.map(item => ({
    'Service': item.service,
    'Amount (KSh)': `KSh ${item.amount.toLocaleString()}`,
    'Staff Member': item.staff,
    'Date': format(new Date(item.date), 'dd/MM/yyyy')
  })))

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales Report')

  // Auto-size columns
  const colWidths = [
    { wch: 20 }, // Service
    { wch: 15 }, // Amount
    { wch: 20 }, // Staff
    { wch: 12 }  // Date
  ]
  worksheet['!cols'] = colWidths

  XLSX.writeFile(workbook, `${filename}.xlsx`)
}

export const exportToPDF = (data: ReportData[], filename: string) => {
  const doc = new jsPDF()
  
  // Header
  doc.setFontSize(20)
  doc.text('CarWash Pro - Sales Report', 20, 20)
  
  doc.setFontSize(12)
  doc.text(`Generated on: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 20, 35)
  
  // Table headers
  const headers = ['Service', 'Amount (KSh)', 'Staff Member', 'Date']
  let y = 55
  
  doc.setFontSize(10)
  doc.setFont(undefined, 'bold')
  headers.forEach((header, index) => {
    doc.text(header, 20 + (index * 45), y)
  })
  
  // Table data
  doc.setFont(undefined, 'normal')
  y += 10
  
  data.forEach((item) => {
    if (y > 270) { // New page if needed
      doc.addPage()
      y = 20
    }
    
    doc.text(item.service, 20, y)
    doc.text(item.amount.toLocaleString(), 65, y)
    doc.text(item.staff, 110, y)
    doc.text(format(new Date(item.date), 'dd/MM/yyyy'), 155, y)
    y += 8
  })
  
  // Total
  const total = data.reduce((sum, item) => sum + item.amount, 0)
  y += 10
  doc.setFont(undefined, 'bold')
  doc.text(`Total Revenue: KSh ${total.toLocaleString()}`, 20, y)
  
  doc.save(`${filename}.pdf`)
}