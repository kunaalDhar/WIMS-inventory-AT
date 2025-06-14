"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useOrders } from "@/contexts/order-context"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Building2,
  History,
  User,
  Calculator,
} from "lucide-react"
import { PriceAdjustmentDialog } from "./price-adjustment-dialog"

interface CreateOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editOrder?: any
}

interface OrderItem {
  id: string
  name: string
  category: string
  volume: string
  bottlesPerCase: number
  requestedQuantity: number
  unit: string
  description?: string
  unitPrice?: number
  lineTotal?: number
}

export function CreateOrderDialog({ open, onOpenChange, editOrder }: CreateOrderDialogProps) {
  const { user } = useAuth()
  const { clients, availableItems, addOrder, updateOrder, getClientOrderHistory, orderCounter, adjustOrderPricing } =
    useOrders()
  const [selectedClientId, setSelectedClientId] = useState<string>(editOrder?.clientId || "")
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>(editOrder?.items || [])
  const [notes, setNotes] = useState(editOrder?.notes || "")
  const [withGst, setWithGst] = useState(editOrder?.withGst || false)
  const [gstNumber, setGstNumber] = useState(editOrder?.gstNumber || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showPriceAdjustment, setShowPriceAdjustment] = useState(false)
  const [createdOrder, setCreatedOrder] = useState<any>(null)

  const selectedClient = clients.find((client) => client.id === selectedClientId)
  const clientOrderHistory = selectedClient ? getClientOrderHistory(selectedClient.id) : []

  // Sort clients by most recently used and order count
  const sortedClients = [...clients].sort((a, b) => {
    // First sort by last used (most recent first)
    const aLastUsed = new Date(a.lastUsed || a.createdAt).getTime()
    const bLastUsed = new Date(b.lastUsed || b.createdAt).getTime()
    if (bLastUsed !== aLastUsed) {
      return bLastUsed - aLastUsed
    }
    // Then by order count (most orders first)
    return (b.orderCount || 0) - (a.orderCount || 0)
  })

  const handleAddItemFromDropdown = (itemId: string) => {
    const item = availableItems.find((i) => i.id === itemId)
    if (!item) return

    const existingItem = selectedItems.find((selected) => selected.id === item.id)
    if (existingItem) {
      setSelectedItems((prev) =>
        prev.map((selected) =>
          selected.id === item.id ? { ...selected, requestedQuantity: selected.requestedQuantity + 1 } : selected,
        ),
      )
    } else {
      const newItem = {
        ...item,
        requestedQuantity: 1,
        unitPrice: item.unitPrice || 0,
        lineTotal: (item.unitPrice || 0) * 1,
      }
      setSelectedItems((prev) => [...prev, newItem])
    }
  }

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setSelectedItems((prev) => prev.filter((item) => item.id !== itemId))
    } else {
      setSelectedItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? {
                ...item,
                requestedQuantity: quantity,
                lineTotal: (item.unitPrice || 0) * quantity,
              }
            : item,
        ),
      )
    }
  }

  // Ensure price adjustment is available during order creation and editing
  // Update the handleUpdateUnitPrice function to enforce price adjustment limits
  const handleUpdateUnitPrice = (itemId: string, unitPrice: number) => {
    const item = selectedItems.find((item) => item.id === itemId)
    if (!item) return

    const originalItem = availableItems.find((i) => i.id === itemId)
    const basePrice = originalItem?.unitPrice || 0

    // Enforce price adjustment limits (±₹10-15)
    const minPrice = Math.max(0, basePrice - 15)
    const maxPrice = basePrice + 15
    const clampedPrice = Math.max(minPrice, Math.min(maxPrice, unitPrice))

    setSelectedItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              unitPrice: clampedPrice,
              lineTotal: clampedPrice * item.requestedQuantity,
            }
          : item,
      ),
    )
  }

  // Add a helper function to show price adjustment range
  const getPriceAdjustmentRange = (itemId: string) => {
    const originalItem = availableItems.find((i) => i.id === itemId)
    const basePrice = originalItem?.unitPrice || 0
    return {
      min: Math.max(0, basePrice - 15),
      max: basePrice + 15,
    }
  }

  const handleRemoveItem = (itemId: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== itemId))
  }

  const getTotalItems = () => {
    return selectedItems.reduce((total, item) => total + item.requestedQuantity, 0)
  }

  const calculatePricing = () => {
    const subtotal = selectedItems.reduce((sum, item) => sum + (item.lineTotal || 0), 0)
    const taxRate = withGst ? 0.12 : 0 // 12% GST
    const tax = subtotal * taxRate
    const total = subtotal + tax

    return { subtotal, tax, total, taxRate }
  }

  const { subtotal, tax, total, taxRate } = calculatePricing()

  // Initialize form data when editing
  useEffect(() => {
    if (editOrder && open) {
      setSelectedClientId(editOrder.clientId || "")
      setSelectedItems(editOrder.items || [])
      setNotes(editOrder.notes || "")
      setWithGst(editOrder.withGst || false)
      setGstNumber(editOrder.gstNumber || "")
    } else if (!editOrder && open) {
      // Reset form for new order
      setSelectedClientId("")
      setSelectedItems([])
      setNotes("")
      setWithGst(false)
      setGstNumber("")
    }
  }, [editOrder, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedClient) return

    if (selectedItems.length === 0) {
      alert("Please select at least one item")
      return
    }

    if (withGst && !gstNumber.trim()) {
      alert("Please enter GST number when GST is selected")
      return
    }

    setIsSubmitting(true)

    try {
      const itemPrices: Record<string, number> = {}
      selectedItems.forEach((item) => {
        itemPrices[item.id] = item.unitPrice || 0
      })

      const salesmanPricing = {
        subtotal,
        tax,
        total,
        itemPrices,
        withGst,
      }

      const orderData = {
        salesmanId: user.id,
        salesmanName: user.name,
        clientId: selectedClient.id,
        clientName: selectedClient.name,
        items: selectedItems,
        status: "pending" as const,
        totalItems: getTotalItems(),
        notes: notes.trim(),
        withGst,
        gstNumber: withGst ? gstNumber.trim() : undefined,
        salesmanPricing,
        isEditable: true,
      }

      if (editOrder) {
        // Update existing order
        updateOrder(editOrder.id, orderData)
        alert("Order updated successfully!")
        onOpenChange(false)
      } else {
        // Create new order
        const newOrder = addOrder(orderData)
        setCreatedOrder(newOrder)

        // Show success message briefly, then show price adjustment dialog
        setShowSuccess(true)
        setTimeout(() => {
          setShowSuccess(false)
          setShowPriceAdjustment(true)
        }, 2000)
      }

      // Reset form for new orders
      if (!editOrder) {
        setSelectedClientId("")
        setSelectedItems([])
        setNotes("")
        setWithGst(false)
        setGstNumber("")
      }
    } catch (error) {
      console.error("Error saving order:", error)
      alert("Failed to save order. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setShowSuccess(false)
      onOpenChange(false)
    }
  }

  const nextOrderNumber = `OID${String(orderCounter).padStart(3, "0")}`

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5" />
            <span>{editOrder ? `Edit Order ${editOrder.orderNumber}` : `Create New Order (${nextOrderNumber})`}</span>
          </DialogTitle>
          <DialogDescription>
            {editOrder
              ? "Update the order details and pricing below."
              : "Select a client, add items with pricing, and choose GST options to create a new order."}
          </DialogDescription>
        </DialogHeader>

        {showSuccess ? (
          <div className="py-8">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Order Created Successfully!</strong>
                <br />
                Your order <strong>{nextOrderNumber}</strong> has been submitted with salesman pricing.
                <br />
                <br />
                <strong>Order Summary:</strong>
                <br />• Client: {selectedClient?.name}
                <br />• Items: {selectedItems.length} types, {getTotalItems()} total units
                <br />• Total: ₹{total.toFixed(2)} {withGst ? "(with 12% GST)" : "(without GST)"}
                <br />• Status: Pending Admin Review
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Client Selection */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="client">Select Client *</Label>
                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an existing client for this order" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortedClients.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">
                        <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No clients available</p>
                        <p className="text-xs">Add a client first to create orders</p>
                      </div>
                    ) : (
                      sortedClients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{client.name || client.partyName}</span>
                              {(client.orderCount || 0) > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  {client.orderCount} order{(client.orderCount || 0) !== 1 ? "s" : ""}
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {client.contactPerson && `Contact: ${client.contactPerson}`}
                              {client.email && ` • ${client.email}`}
                              {client.phone && ` • ${client.phone}`}
                              {client.city && ` • ${client.city}`}
                              {client.area && ` • ${client.area}`}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Selected Client Info */}
              {selectedClient && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Selected Client Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium">{selectedClient.name}</p>
                        {selectedClient.email && <p className="text-muted-foreground">{selectedClient.email}</p>}
                        {selectedClient.phone && <p className="text-muted-foreground">{selectedClient.phone}</p>}
                      </div>
                      <div>
                        {selectedClient.contactPerson && (
                          <p>
                            <strong>Contact:</strong> {selectedClient.contactPerson}
                          </p>
                        )}
                        {selectedClient.gstNumber && (
                          <p>
                            <strong>GST:</strong> {selectedClient.gstNumber}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <History className="w-3 h-3" />
                          <span className="text-xs text-muted-foreground">
                            {clientOrderHistory.length} previous order{clientOrderHistory.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <Separator />

            {/* Item Selection */}
            <div className="space-y-4">
              <div>
                <Label>Add Items to Order</Label>
                <p className="text-sm text-muted-foreground">
                  Select items from dropdown and set quantities and prices
                </p>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="itemSelect">Select Item</Label>
                  <Select onValueChange={handleAddItemFromDropdown}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an item to add" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableItems.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{item.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {item.category} • {item.volume} • ₹{item.unitPrice}/unit
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Selected Items */}
            {selectedItems.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>Order Items ({selectedItems.length})</Label>
                    <Badge variant="outline">Total: {getTotalItems()} units</Badge>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="p-3 text-left">Item</th>
                          <th className="p-3 text-left">Quantity</th>
                          <th className="p-3 text-left">Unit Price (₹)</th>
                          <th className="p-3 text-left">Line Total (₹)</th>
                          <th className="p-3 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedItems.map((item) => (
                          <tr key={item.id} className="border-t">
                            <td className="p-3">
                              <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {item.category} • {item.volume}
                                </p>
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center space-x-1">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUpdateQuantity(item.id, item.requestedQuantity - 1)}
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <Input
                                  type="number"
                                  value={item.requestedQuantity}
                                  onChange={(e) => handleUpdateQuantity(item.id, Number.parseInt(e.target.value) || 0)}
                                  className="w-16 text-center"
                                  min="1"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUpdateQuantity(item.id, item.requestedQuantity + 1)}
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>
                            </td>
                            <td className="p-3">
                              <div>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={item.unitPrice || 0}
                                  onChange={(e) =>
                                    handleUpdateUnitPrice(item.id, Number.parseFloat(e.target.value) || 0)
                                  }
                                  className="w-24 mb-1"
                                  min={getPriceAdjustmentRange(item.id).min}
                                  max={getPriceAdjustmentRange(item.id).max}
                                />
                                <p className="text-xs text-muted-foreground">
                                  Range: ₹{getPriceAdjustmentRange(item.id).min.toFixed(2)} - ₹
                                  {getPriceAdjustmentRange(item.id).max.toFixed(2)}
                                </p>
                              </div>
                            </td>
                            <td className="p-3 font-medium">₹{(item.lineTotal || 0).toFixed(2)}</td>
                            <td className="p-3">
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRemoveItem(item.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* GST Options */}
            {selectedItems.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <Label className="text-lg font-semibold">GST Options</Label>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="withGst"
                      checked={withGst}
                      onCheckedChange={(checked) => setWithGst(checked as boolean)}
                    />
                    <Label htmlFor="withGst" className="text-sm font-medium">
                      Include GST (12% tax will be applied)
                    </Label>
                  </div>

                  {withGst && (
                    <div>
                      <Label htmlFor="gstNumber">GST Number *</Label>
                      <Input
                        id="gstNumber"
                        value={gstNumber}
                        onChange={(e) => setGstNumber(e.target.value)}
                        placeholder="Enter GST number (e.g., 22AAAAA0000A1Z5)"
                        className="max-w-md"
                      />
                    </div>
                  )}

                  {/* Pricing Summary */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Calculator className="w-4 h-4" />
                        Order Pricing Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>GST ({(taxRate * 100).toFixed(0)}%):</span>
                          <span>₹{tax.toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-semibold text-lg">
                          <span>Total:</span>
                          <span className="text-green-600">₹{total.toFixed(2)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {withGst ? "GST-inclusive pricing" : "GST-exclusive pricing"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Order Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any special instructions or notes for this order..."
                rows={3}
              />
            </div>

            {/* Validation Alert */}
            {clients.length === 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>No Clients Available:</strong> You need to add at least one client before creating an order.
                  Please add a client first.
                </AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !selectedClientId || selectedItems.length === 0}>
                {isSubmitting
                  ? editOrder
                    ? "Updating..."
                    : "Creating Order..."
                  : editOrder
                    ? "Update Order"
                    : "Create Order"}
              </Button>
            </div>
          </form>
        )}
        {/* Price Adjustment Dialog */}
        <PriceAdjustmentDialog
          open={showPriceAdjustment}
          onOpenChange={(open) => {
            setShowPriceAdjustment(open)
            if (!open) {
              onOpenChange(false)
              setCreatedOrder(null)
            }
          }}
          order={createdOrder}
          onAdjustPricing={(adjustments) => {
            if (createdOrder) {
              adjustOrderPricing(createdOrder.id, adjustments)
            }
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
