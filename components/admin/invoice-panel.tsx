"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FileText, Plus, Trash2, Download, Send } from "lucide-react"

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  rate: number
  amount: number
}

interface Invoice {
  id: string
  customerName: string
  customerEmail: string
  customerAddress: string
  invoiceDate: string
  dueDate: string
  items: InvoiceItem[]
  subtotal: number
  tax: number
  total: number
  notes: string
  status: "draft" | "sent" | "paid" | "overdue"
}

export function InvoicePanel() {
  const [invoice, setInvoice] = useState<Invoice>({
    id: `INV-${Date.now()}`,
    customerName: "",
    customerEmail: "",
    customerAddress: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    items: [{ id: "1", description: "", quantity: 1, rate: 0, amount: 0 }],
    subtotal: 0,
    tax: 0,
    total: 0,
    notes: "",
    status: "draft",
  })

  const [recentInvoices] = useState<Invoice[]>([
    {
      id: "INV-001",
      customerName: "John Doe",
      customerEmail: "john@example.com",
      customerAddress: "123 Main St, City, State",
      invoiceDate: "2024-01-15",
      dueDate: "2024-02-15",
      items: [],
      subtotal: 1000,
      tax: 100,
      total: 1100,
      notes: "",
      status: "sent",
    },
    {
      id: "INV-002",
      customerName: "Jane Smith",
      customerEmail: "jane@example.com",
      customerAddress: "456 Oak Ave, City, State",
      invoiceDate: "2024-01-14",
      dueDate: "2024-02-14",
      items: [],
      subtotal: 750,
      tax: 75,
      total: 825,
      notes: "",
      status: "paid",
    },
  ])

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      rate: 0,
      amount: 0,
    }
    setInvoice((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }))
  }

  const removeItem = (id: string) => {
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }))
  }

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value }
          if (field === "quantity" || field === "rate") {
            updatedItem.amount = updatedItem.quantity * updatedItem.rate
          }
          return updatedItem
        }
        return item
      }),
    }))
  }

  const calculateTotals = () => {
    const subtotal = invoice.items.reduce((sum, item) => sum + item.amount, 0)
    const tax = subtotal * 0.1 // 10% tax
    const total = subtotal + tax

    setInvoice((prev) => ({
      ...prev,
      subtotal,
      tax,
      total,
    }))
  }

  const handleSaveInvoice = () => {
    calculateTotals()
    alert("Invoice saved successfully!")
  }

  const handleSendInvoice = () => {
    calculateTotals()
    alert("Invoice sent to customer!")
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: "secondary",
      sent: "default",
      paid: "default",
      overdue: "destructive",
    } as const

    return <Badge variant={variants[status as keyof typeof variants] || "default"}>{status.toUpperCase()}</Badge>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Invoice Management</h1>
          <p className="text-muted-foreground">Create and manage invoices for your customers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Create New Invoice</span>
              </CardTitle>
              <CardDescription>Fill in the details to generate a new invoice</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Customer Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    value={invoice.customerName}
                    onChange={(e) => setInvoice((prev) => ({ ...prev, customerName: e.target.value }))}
                    placeholder="Enter customer name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Customer Email</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={invoice.customerEmail}
                    onChange={(e) => setInvoice((prev) => ({ ...prev, customerEmail: e.target.value }))}
                    placeholder="Enter customer email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerAddress">Customer Address</Label>
                <Textarea
                  id="customerAddress"
                  value={invoice.customerAddress}
                  onChange={(e) => setInvoice((prev) => ({ ...prev, customerAddress: e.target.value }))}
                  placeholder="Enter customer address"
                  rows={3}
                />
              </div>

              {/* Invoice Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoiceId">Invoice ID</Label>
                  <Input
                    id="invoiceId"
                    value={invoice.id}
                    onChange={(e) => setInvoice((prev) => ({ ...prev, id: e.target.value }))}
                    placeholder="Invoice ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoiceDate">Invoice Date</Label>
                  <Input
                    id="invoiceDate"
                    type="date"
                    value={invoice.invoiceDate}
                    onChange={(e) => setInvoice((prev) => ({ ...prev, invoiceDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={invoice.dueDate}
                    onChange={(e) => setInvoice((prev) => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
              </div>

              {/* Invoice Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-semibold">Invoice Items</Label>
                  <Button onClick={addItem} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Input
                            value={item.description}
                            onChange={(e) => updateItem(item.id, "description", e.target.value)}
                            placeholder="Item description"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, "quantity", Number.parseInt(e.target.value) || 0)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.rate}
                            onChange={(e) => updateItem(item.id, "rate", Number.parseFloat(e.target.value) || 0)}
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">₹{(item.quantity * item.rate).toFixed(2)}</span>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            disabled={invoice.items.length === 1}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Totals */}
              <div className="space-y-2">
                <Separator />
                <div className="flex justify-end space-y-2">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{invoice.items.reduce((sum, item) => sum + item.quantity * item.rate, 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (10%):</span>
                      <span>
                        ₹{(invoice.items.reduce((sum, item) => sum + item.quantity * item.rate, 0) * 0.1).toFixed(2)}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span>
                        ₹{(invoice.items.reduce((sum, item) => sum + item.quantity * item.rate, 0) * 1.1).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={invoice.notes}
                  onChange={(e) => setInvoice((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes or terms"
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <Button onClick={handleSaveInvoice}>
                  <FileText className="w-4 h-4 mr-2" />
                  Save Draft
                </Button>
                <Button onClick={handleSendInvoice} variant="default">
                  <Send className="w-4 h-4 mr-2" />
                  Send Invoice
                </Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Invoices */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
              <CardDescription>Your latest invoice activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentInvoices.map((inv) => (
                  <div key={inv.id} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{inv.id}</span>
                      {getStatusBadge(inv.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>{inv.customerName}</p>
                      <p>₹{inv.total.toFixed(2)}</p>
                      <p>{inv.invoiceDate}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <FileText className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
