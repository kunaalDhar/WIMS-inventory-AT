"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useOrders } from "@/contexts/order-context"
import { Eye, Clock, CheckCircle, XCircle, DollarSign, Edit, Download, AlertTriangle } from "lucide-react"

interface OrderItem {
  id: string
  name: string
  category: string
  volume: string
  bottlesPerCase: number
  requestedQuantity: number
  unit: string
  description?: string
  salesmanPrice?: number
  adminPrice?: number
  finalPrice?: number
}

interface Order {
  id: string
  salesmanId: string
  salesmanName: string
  vendorId: string
  vendorName: string
  items: OrderItem[]
  status: "pending" | "admin_priced" | "salesman_adjusted" | "approved" | "rejected" | "completed"
  totalItems: number
  notes: string
  createdAt: string
  adminPricedAt?: string
  salesmanAdjustedAt?: string
  approvedAt?: string
  adminNotes?: string
  salesmanAdjustmentNotes?: string
  allowPriceAdjustment?: boolean
  priceAdjustmentRange?: { min: number; max: number }
  salesmanPricing?: {
    subtotal: number
    total: number
    itemPrices: Record<string, number>
  }
  adminPricing?: {
    subtotal: number
    tax: number
    total: number
    itemPrices: Record<string, number>
  }
  finalPricing?: {
    subtotal: number
    tax: number
    total: number
    itemPrices: Record<string, number>
    adjustments: Record<string, number>
  }
}

interface OrderStatusCardProps {
  order: Order
}

export function OrderStatusCard({ order }: OrderStatusCardProps) {
  const { setSalesmanAdjustment } = useOrders()
  const [isAdjustmentDialogOpen, setIsAdjustmentDialogOpen] = useState(false)
  const [adjustments, setAdjustments] = useState<Record<string, number>>({})
  const [adjustmentNotes, setAdjustmentNotes] = useState("")
  const [error, setError] = useState("")

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />
      case "admin_priced":
        return <DollarSign className="w-4 h-4 text-blue-600" />
      case "salesman_adjusted":
        return <Edit className="w-4 h-4 text-purple-600" />
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-600" />
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      admin_priced: "default",
      salesman_adjusted: "outline",
      approved: "default",
      rejected: "destructive",
      completed: "default",
    } as const

    const labels = {
      pending: "PENDING PRICING",
      admin_priced: "ADMIN PRICED",
      salesman_adjusted: "ADJUSTED",
      approved: "APPROVED",
      rejected: "REJECTED",
      completed: "COMPLETED",
    }

    return (
      <Badge variant={variants[status as keyof typeof variants] || "default"}>
        {labels[status as keyof typeof labels] || status.toUpperCase()}
      </Badge>
    )
  }

  const getStatusMessage = (status: string) => {
    switch (status) {
      case "pending":
        return "Order submitted - waiting for admin pricing"
      case "admin_priced":
        return order.allowPriceAdjustment
          ? "Admin priced - you can adjust within ₹10-₹15"
          : "Admin priced - ready for approval"
      case "salesman_adjusted":
        return "Price adjusted - waiting for admin approval"
      case "approved":
        return "Order approved and in progress"
      case "rejected":
        return "Order was rejected by admin"
      case "completed":
        return "Order completed successfully"
      default:
        return "Order status unknown"
    }
  }

  const canGenerateInvoice = order.status !== "pending" && order.adminPricing

  const handleAdjustPrices = () => {
    if (!order.allowPriceAdjustment || !order.adminPricing) return

    // Initialize adjustments to 0 for all items
    const initialAdjustments: Record<string, number> = {}
    order.items.forEach((item) => {
      initialAdjustments[item.id] = 0
    })
    setAdjustments(initialAdjustments)
    setAdjustmentNotes("")
    setError("")
    setIsAdjustmentDialogOpen(true)
  }

  const handleAdjustmentChange = (itemId: string, adjustment: number) => {
    const range = order.priceAdjustmentRange
    if (!range) return

    // Validate adjustment range
    if (adjustment < -range.max || adjustment > range.max) {
      setError(`Adjustment must be between -₹${range.max} and +₹${range.max}`)
      return
    }

    setAdjustments((prev) => ({
      ...prev,
      [itemId]: adjustment,
    }))
    setError("")
  }

  const handleSaveAdjustments = () => {
    if (!order.allowPriceAdjustment) return

    // Validate all adjustments
    const range = order.priceAdjustmentRange
    if (!range) return

    const hasInvalidAdjustment = Object.values(adjustments).some((adj) => adj < -range.max || adj > range.max)

    if (hasInvalidAdjustment) {
      setError(`All adjustments must be between -₹${range.max} and +₹${range.max}`)
      return
    }

    setSalesmanAdjustment(order.id, adjustments, adjustmentNotes)
    setIsAdjustmentDialogOpen(false)
  }

  const generateInvoice = () => {
    if (!canGenerateInvoice) return

    const currentPricing = order.finalPricing || order.adminPricing!
    const totalCases = order.items.reduce((sum, item) => sum + item.requestedQuantity, 0)
    const totalBottles = order.items.reduce((sum, item) => sum + item.requestedQuantity * item.bottlesPerCase, 0)

    const pdfContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Order Invoice - ${order.id}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .company-name { font-size: 24px; font-weight: bold; color: #1f2937; }
          .invoice-title { font-size: 18px; color: #6b7280; margin-top: 5px; }
          .order-info { display: flex; justify-content: space-between; margin: 20px 0; }
          .info-section { flex: 1; margin-right: 20px; }
          .info-title { font-weight: bold; color: #374151; margin-bottom: 5px; }
          .info-value { color: #6b7280; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #d1d5db; padding: 12px; text-align: left; }
          th { background-color: #f3f4f6; font-weight: bold; }
          .summary { margin-top: 20px; text-align: right; }
          .summary-row { margin: 5px 0; }
          .total-row { font-weight: bold; font-size: 16px; color: #1f2937; }
          .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px; }
          .status-badge { background-color: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
          .currency { color: #059669; font-weight: bold; }
          .adjustment { color: #7c3aed; font-style: italic; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">WIMS - Ekta Corporation</div>
          <div class="invoice-title">Official Order Invoice</div>
        </div>

        <div class="order-info">
          <div class="info-section">
            <div class="info-title">Order Details</div>
            <div class="info-value">Order ID: ${order.id}</div>
            <div class="info-value">Date: ${new Date(order.createdAt).toLocaleDateString()}</div>
            <div class="info-value">Status: <span class="status-badge">${order.status.toUpperCase()}</span></div>
          </div>
          <div class="info-section">
            <div class="info-title">Salesman Information</div>
            <div class="info-value">Name: ${order.salesmanName}</div>
          </div>
          <div class="info-section">
            <div class="info-title">Vendor Information</div>
            <div class="info-value">Company: ${order.vendorName}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>S.No.</th>
              <th>Product Description</th>
              <th>Volume</th>
              <th>Cases</th>
              <th>Admin Price (₹)</th>
              ${order.finalPricing ? "<th>Adjustment (₹)</th><th>Final Price (₹)</th>" : ""}
              <th>Line Total (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${order.items
              .map(
                (item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${item.name}</td>
                <td>${item.volume}</td>
                <td>${item.requestedQuantity}</td>
                <td class="currency">₹${(order.adminPricing?.itemPrices[item.id] || 0).toFixed(2)}</td>
                ${
                  order.finalPricing
                    ? `
                  <td class="adjustment">₹${(order.finalPricing.adjustments[item.id] || 0).toFixed(2)}</td>
                  <td class="currency">₹${(order.finalPricing.itemPrices[item.id] || 0).toFixed(2)}</td>
                `
                    : ""
                }
                <td class="currency">₹${((order.finalPricing?.itemPrices[item.id] || order.adminPricing?.itemPrices[item.id] || 0) * item.requestedQuantity).toFixed(2)}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>

        <div class="summary">
          <div class="summary-row">Total Product Types: ${order.items.length}</div>
          <div class="summary-row">Total Cases: ${totalCases}</div>
          <div class="summary-row">Total Bottles: ${totalBottles}</div>
          <div class="summary-row">Subtotal: ₹${currentPricing.subtotal.toFixed(2)}</div>
          <div class="summary-row">Tax (10%): ₹${currentPricing.tax.toFixed(2)}</div>
          <div class="summary-row total-row currency">Final Total: ₹${currentPricing.total.toFixed(2)}</div>
        </div>

        ${
          order.adminNotes
            ? `
          <div style="margin-top: 20px;">
            <div class="info-title">Admin Notes:</div>
            <div class="info-value">${order.adminNotes}</div>
          </div>
        `
            : ""
        }

        ${
          order.salesmanAdjustmentNotes
            ? `
          <div style="margin-top: 20px;">
            <div class="info-title">Salesman Adjustment Notes:</div>
            <div class="info-value adjustment">${order.salesmanAdjustmentNotes}</div>
          </div>
        `
            : ""
        }

        <div class="footer">
          <p>This is an official invoice with admin-approved pricing.</p>
          <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `

    const blob = new Blob([pdfContent], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `Official-Invoice-${order.id}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(pdfContent)
      printWindow.document.close()
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 500)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const currentPricing = order.finalPricing || order.adminPricing

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              {getStatusIcon(order.status)}
              <h4 className="font-medium">{order.id}</h4>
            </div>
            {getStatusBadge(order.status)}
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Vendor:</span>
              <span className="font-medium">{order.vendorName}</span>
            </div>
            <div className="flex justify-between">
              <span>Items:</span>
              <span>
                {order.totalItems} cases ({order.items.length} types)
              </span>
            </div>
            <div className="flex justify-between">
              <span>Created:</span>
              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
            {order.salesmanPricing && (
              <div className="flex justify-between">
                <span>Your Price:</span>
                <span className="font-medium text-yellow-600">₹{order.salesmanPricing.total.toFixed(2)}</span>
              </div>
            )}
            {currentPricing && (
              <div className="flex justify-between">
                <span>Official Price:</span>
                <span className="font-medium text-green-600">₹{currentPricing.total.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="mt-3 p-2 bg-muted/50 rounded text-xs">
            <p className="text-muted-foreground">{getStatusMessage(order.status)}</p>
            {order.adminNotes && <p className="text-xs text-blue-600 mt-1">Admin: {order.adminNotes}</p>}
            {order.salesmanAdjustmentNotes && (
              <p className="text-xs text-purple-600 mt-1">Your adjustment: {order.salesmanAdjustmentNotes}</p>
            )}
          </div>

          <div className="flex justify-between items-center mt-3">
            <div className="text-xs text-muted-foreground">
              {order.items
                .slice(0, 2)
                .map((item) => item.name)
                .join(", ")}
              {order.items.length > 2 && ` +${order.items.length - 2} more`}
            </div>
            <div className="flex items-center space-x-2">
              {order.allowPriceAdjustment && order.status === "admin_priced" && (
                <Button variant="ghost" size="sm" onClick={handleAdjustPrices}>
                  <Edit className="w-4 h-4" />
                </Button>
              )}
              {canGenerateInvoice && (
                <Button variant="ghost" size="sm" onClick={generateInvoice}>
                  <Download className="w-4 h-4" />
                </Button>
              )}
              <Button variant="ghost" size="sm">
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price Adjustment Dialog */}
      <Dialog open={isAdjustmentDialogOpen} onOpenChange={setIsAdjustmentDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adjust Prices - {order.id}</DialogTitle>
            <DialogDescription>
              You can adjust prices within ₹{order.priceAdjustmentRange?.min}-₹{order.priceAdjustmentRange?.max} range
              as approved by admin
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {order.adminPricing && (
              <Alert>
                <DollarSign className="h-4 w-4" />
                <AlertDescription>
                  Admin has set official pricing. You can adjust individual item prices within the allowed range.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <Label className="text-lg font-semibold">Price Adjustments</Label>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="p-3 text-left">Item</th>
                      <th className="p-3 text-left">Cases</th>
                      <th className="p-3 text-left">Admin Price</th>
                      <th className="p-3 text-left">Adjustment (₹)</th>
                      <th className="p-3 text-left">Final Price</th>
                      <th className="p-3 text-left">Line Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => {
                      const adminPrice = order.adminPricing?.itemPrices[item.id] || 0
                      const adjustment = adjustments[item.id] || 0
                      const finalPrice = adminPrice + adjustment
                      const lineTotal = finalPrice * item.requestedQuantity

                      return (
                        <tr key={item.id} className="border-t">
                          <td className="p-3">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-xs text-muted-foreground">{item.volume}</p>
                            </div>
                          </td>
                          <td className="p-3">{item.requestedQuantity}</td>
                          <td className="p-3">₹{adminPrice.toFixed(2)}</td>
                          <td className="p-3">
                            <div className="flex items-center space-x-1">
                              <span>₹</span>
                              <Input
                                type="number"
                                step="0.01"
                                value={adjustment}
                                onChange={(e) =>
                                  handleAdjustmentChange(item.id, Number.parseFloat(e.target.value) || 0)
                                }
                                className="w-20"
                                min={-order.priceAdjustmentRange?.max}
                                max={order.priceAdjustmentRange?.max}
                              />
                            </div>
                          </td>
                          <td className="p-3 font-medium">₹{finalPrice.toFixed(2)}</td>
                          <td className="p-3 font-medium">₹{lineTotal.toFixed(2)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adjustmentNotes">Adjustment Notes</Label>
              <Textarea
                id="adjustmentNotes"
                value={adjustmentNotes}
                onChange={(e) => setAdjustmentNotes(e.target.value)}
                placeholder="Explain why you're adjusting the prices..."
                rows={3}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAdjustmentDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveAdjustments}>
                <Edit className="w-4 h-4 mr-2" />
                Save Adjustments
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
