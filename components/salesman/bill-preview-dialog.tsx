"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FileText, Download, Printer, CheckCircle } from "lucide-react"

interface BillPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bill: any
  order: any
}

export function BillPreviewDialog({ open, onOpenChange, bill, order }: BillPreviewDialogProps) {
  if (!bill || !order) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const handlePrint = () => {
    const printContent = document.getElementById("bill-content")
    if (printContent) {
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Invoice - ${bill.orderNumber}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .company-name { font-size: 24px; font-weight: bold; color: #2563eb; }
                .invoice-title { font-size: 20px; margin: 10px 0; }
                .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
                .details-section { border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; }
                .details-title { font-weight: bold; margin-bottom: 10px; color: #374151; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; }
                th { background-color: #f9fafb; font-weight: bold; }
                .text-right { text-align: right; }
                .total-row { background-color: #f0f9ff; font-weight: bold; }
                .gst-badge { background-color: #10b981; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
                .footer { margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px; }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
      }
    }
  }

  const handleDownload = () => {
    const billContent = document.getElementById("bill-content")
    if (billContent) {
      const blob = new Blob([billContent.innerHTML], { type: "text/html" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `Invoice-${bill.orderNumber}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Invoice Preview - {bill.orderNumber}</span>
            {bill.billType === "gst" && <Badge className="bg-green-600">GST Invoice</Badge>}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
          </div>

          {/* Bill Content */}
          <Card>
            <CardContent className="p-6" id="bill-content">
              {/* Header */}
              <div className="header text-center mb-8">
                <h1 className="company-name text-3xl font-bold text-blue-600 mb-2">WIMS Company</h1>
                <p className="text-gray-600">Warehouse Inventory Management System</p>
                <h2 className="invoice-title text-xl font-semibold mt-4">
                  {bill.billType === "gst" ? "TAX INVOICE" : "INVOICE"}
                </h2>
              </div>

              {/* Invoice Details */}
              <div className="details-grid grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="details-section border rounded-lg p-4">
                  <h3 className="details-title font-bold text-gray-700 mb-3">Invoice Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Invoice Number:</span>
                      <span className="font-medium">{bill.orderNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Invoice Date:</span>
                      <span>{new Date(bill.generatedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Salesman:</span>
                      <span>{bill.salesmanName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge variant="secondary">{bill.status.toUpperCase()}</Badge>
                    </div>
                  </div>
                </div>

                <div className="details-section border rounded-lg p-4">
                  <h3 className="details-title font-bold text-gray-700 mb-3">Bill To</h3>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">{bill.clientName}</p>
                    {order.clientId && (
                      <>
                        <p className="text-gray-600">Client ID: {order.clientId}</p>
                        {bill.gstNumber && <p className="text-gray-600">GST Number: {bill.gstNumber}</p>}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-6">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 p-3 text-left">Item Description</th>
                      <th className="border border-gray-300 p-3 text-center">Quantity</th>
                      <th className="border border-gray-300 p-3 text-right">Unit Price</th>
                      <th className="border border-gray-300 p-3 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bill.items.map((item: any, index: number) => (
                      <tr key={index}>
                        <td className="border border-gray-300 p-3">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-600">
                              {item.category} • {item.volume} • {item.bottlesPerCase} bottles/case
                            </p>
                          </div>
                        </td>
                        <td className="border border-gray-300 p-3 text-center">
                          {item.requestedQuantity} {item.unit}
                        </td>
                        <td className="border border-gray-300 p-3 text-right">{formatCurrency(item.unitPrice || 0)}</td>
                        <td className="border border-gray-300 p-3 text-right font-medium">
                          {formatCurrency((item.unitPrice || 0) * item.requestedQuantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end mb-6">
                <div className="w-full max-w-md">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-2">
                      <span>Subtotal:</span>
                      <span className="font-medium">{formatCurrency(bill.subtotal)}</span>
                    </div>
                    {bill.billType === "gst" && (
                      <div className="flex justify-between py-2">
                        <span>GST (12%):</span>
                        <span className="font-medium">{formatCurrency(bill.tax)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="total-row flex justify-between py-3 bg-blue-50 px-3 rounded font-bold text-lg">
                      <span>Total Amount:</span>
                      <span className="text-blue-600">{formatCurrency(bill.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* GST Information */}
              {bill.billType === "gst" && (
                <div className="mb-6 p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800">GST Invoice</span>
                  </div>
                  <p className="text-sm text-green-700">
                    This is a GST-compliant invoice with 12% tax applied as per Indian tax regulations.
                  </p>
                  {bill.gstNumber && (
                    <p className="text-sm text-green-700 mt-1">
                      <strong>GST Number:</strong> {bill.gstNumber}
                    </p>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="footer text-center text-gray-500 text-sm mt-8 pt-4 border-t">
                <p>Thank you for your business!</p>
                <p>This invoice was generated automatically by WIMS on {new Date(bill.generatedAt).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
