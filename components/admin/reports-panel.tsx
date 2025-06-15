"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart3, Download, FileText, TrendingUp, Calendar, Filter, RefreshCw } from "lucide-react"

interface Report {
  id: string
  name: string
  type: string
  description: string
  lastGenerated: string
  status: "ready" | "generating" | "error"
  size: string
}

export function ReportsPanel() {
  const [selectedReportType, setSelectedReportType] = useState("")
  const [dateRange, setDateRange] = useState({ from: "", to: "" })
  const [isGenerating, setIsGenerating] = useState(false)

  const [reports] = useState<Report[]>([
    {
      id: "RPT001",
      name: "Sales Summary Report",
      type: "sales",
      description: "Monthly sales performance and trends",
      lastGenerated: "2024-01-15",
      status: "ready",
      size: "2.3 MB",
    },
    {
      id: "RPT002",
      name: "Inventory Report",
      type: "inventory",
      description: "Current stock levels and movements",
      lastGenerated: "2024-01-14",
      status: "ready",
      size: "1.8 MB",
    },
    {
      id: "RPT003",
      name: "Customer Analysis",
      type: "customer",
      description: "Customer behavior and purchase patterns",
      lastGenerated: "2024-01-13",
      status: "generating",
      size: "3.1 MB",
    },
    {
      id: "RPT004",
      name: "Financial Report",
      type: "financial",
      description: "Revenue, expenses, and profit analysis",
      lastGenerated: "2024-01-12",
      status: "ready",
      size: "4.2 MB",
    },
  ])

  const reportTypes = [
    { value: "sales", label: "Sales Report" },
    { value: "inventory", label: "Inventory Report" },
    { value: "customer", label: "Customer Report" },
    { value: "financial", label: "Financial Report" },
    { value: "tax", label: "Tax Report" },
    { value: "profit", label: "Profit & Loss Report" },
  ]

  const handleGenerateReport = async () => {
    if (!selectedReportType) {
      alert("Please select a report type")
      return
    }

    setIsGenerating(true)

    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false)
      alert("Report generated successfully!")
    }, 3000)
  }

  const handleDownloadReport = (reportId: string) => {
    // Simulate download
    alert(`Downloading report ${reportId}...`)
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      ready: "default",
      generating: "secondary",
      error: "destructive",
    } as const

    return <Badge variant={variants[status as keyof typeof variants] || "default"}>{status.toUpperCase()}</Badge>
  }

  const getReportIcon = (type: string) => {
    switch (type) {
      case "sales":
        return <TrendingUp className="w-4 h-4" />
      case "inventory":
        return <BarChart3 className="w-4 h-4" />
      case "customer":
        return <FileText className="w-4 h-4" />
      case "financial":
        return <BarChart3 className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">Generate and download various business reports</p>
        </div>
      </div>

      {/* Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Generate New Report</span>
          </CardTitle>
          <CardDescription>Create custom reports based on your requirements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reportType">Report Type</Label>
              <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateFrom">From Date</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange((prev) => ({ ...prev, from: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateTo">To Date</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange((prev) => ({ ...prev, to: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex space-x-2">
            <Button onClick={handleGenerateReport} disabled={isGenerating} className="flex items-center space-x-2">
              {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
              <span>{isGenerating ? "Generating..." : "Generate Report"}</span>
            </Button>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Advanced Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Sales Report</p>
                <p className="text-sm text-muted-foreground">Monthly performance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Inventory Report</p>
                <p className="text-sm text-muted-foreground">Stock analysis</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Customer Report</p>
                <p className="text-sm text-muted-foreground">Customer insights</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="font-medium">Financial Report</p>
                <p className="text-sm text-muted-foreground">Revenue analysis</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>Previously generated reports available for download</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Last Generated</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getReportIcon(report.type)}
                      <span className="font-medium">{report.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{report.type}</TableCell>
                  <TableCell>{report.description}</TableCell>
                  <TableCell>{report.lastGenerated}</TableCell>
                  <TableCell>{getStatusBadge(report.status)}</TableCell>
                  <TableCell>{report.size}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadReport(report.id)}
                        disabled={report.status !== "ready"}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <FileText className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Report Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Report Usage Analytics</CardTitle>
            <CardDescription>Most frequently generated reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Sales Reports</span>
                <span className="text-sm text-muted-foreground">45%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: "45%" }}></div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Inventory Reports</span>
                <span className="text-sm text-muted-foreground">30%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: "30%" }}></div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Financial Reports</span>
                <span className="text-sm text-muted-foreground">25%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: "25%" }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Export Options</CardTitle>
            <CardDescription>Available formats for report downloads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 border rounded-lg text-center hover:bg-muted/50 cursor-pointer transition-colors">
                <FileText className="w-8 h-8 mx-auto mb-2 text-red-600" />
                <p className="text-sm font-medium">PDF</p>
                <p className="text-xs text-muted-foreground">Portable Document</p>
              </div>
              <div className="p-3 border rounded-lg text-center hover:bg-muted/50 cursor-pointer transition-colors">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <p className="text-sm font-medium">Excel</p>
                <p className="text-xs text-muted-foreground">Spreadsheet Format</p>
              </div>
              <div className="p-3 border rounded-lg text-center hover:bg-muted/50 cursor-pointer transition-colors">
                <FileText className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <p className="text-sm font-medium">CSV</p>
                <p className="text-xs text-muted-foreground">Comma Separated</p>
              </div>
              <div className="p-3 border rounded-lg text-center hover:bg-muted/50 cursor-pointer transition-colors">
                <Download className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <p className="text-sm font-medium">JSON</p>
                <p className="text-xs text-muted-foreground">Data Format</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
