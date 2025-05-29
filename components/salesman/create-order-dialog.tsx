"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useOrders } from "@/contexts/order-context"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, ShoppingCart, CheckCircle, IndianRupee, Clock, Calculator } from "lucide-react"

interface CreateOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface OrderLineItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  totalAmount: number
  gstBill: "yes" | "no"
  gstNumber?: string
}

export function CreateOrderDialog({ open, onOpenChange }: CreateOrderDialogProps) {
  const { currentUser } = useAuth()
  const { vendors, availableItems, addOrder } = useOrders()

  // Form state
  const [selectedVendor, setSelectedVendor] = useState("")
  const [selectedProduct, setSelectedProduct] = useState("")
  const [quantity, setQuantity] = useState("")
  const [unitPrice, setUnitPrice] = useState("")
  const [gstBill, setGstBill] = useState<"yes" | "no">("no")
  const [gstNumber, setGstNumber] = useState("")
  const [orderItems, setOrderItems] = useState<OrderLineItem[]>([])
  const [notes, setNotes] = useState("")

  // UI state
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [placedOrderId, setPlacedOrderId] = useState("")

  // Calculate total amount in real-time
  const calculateTotalAmount = (qty: number, price: number) => {
    return qty * price
  }

  // Get current total amount for display
  const getCurrentTotalAmount = () => {
    const qty = Number.parseFloat(quantity) || 0
    const price = Number.parseFloat(unitPrice) || 0
    return calculateTotalAmount(qty, price)
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  // Validate current line item
  const validateLineItem = () => {
    if (!selectedProduct) {
      setError("Please select a product")
      return false
    }
    if (!quantity || Number.parseFloat(quantity) <= 0) {
      setError("Please enter a valid quantity")
      return false
    }
    if (!unitPrice || Number.parseFloat(unitPrice) <= 0) {
      setError("Please enter a valid unit price")
      return false
    }
    if (gstBill === "yes" && !gstNumber.trim()) {
      setError("Please enter GST number when GST Bill is Yes")
      return false
    }
    return true
  }

  // Add item to order
  const handleAddItem = () => {
    if (!validateLineItem()) return

    const product = availableItems.find((item) => item.id === selectedProduct)
    if (!product) {
      setError("Selected product not found")
      return
    }

    const qty = Number.parseFloat(quantity)
    const price = Number.parseFloat(unitPrice)
    const total = calculateTotalAmount(qty, price)

    const newItem: OrderLineItem = {
      id: `item-${Date.now()}`,
      productId: selectedProduct,
      productName: product.name,
      quantity: qty,
      unitPrice: price,
      totalAmount: total,
      gstBill,
      gstNumber: gstBill === "yes" ? gstNumber : undefined,
    }

    setOrderItems((prev) => [...prev, newItem])

    // Reset form
    setSelectedProduct("")
    setQuantity("")
    setUnitPrice("")
    setGstBill("no")
    setGstNumber("")
    setError("")
  }

  // Remove item from order
  const handleRemoveItem = (itemId: string) => {
    setOrderItems((prev) => prev.filter((item) => item.id !== itemId))
  }

  // Calculate order totals
  const getOrderTotals = () => {
    const subtotal = orderItems.reduce((sum, item) => sum + item.totalAmount, 0)
    return {
      subtotal,
      itemCount: orderItems.length,
      totalQuantity: orderItems.reduce((sum, item) => sum + item.quantity, 0),
    }
  }

  // Validate complete order
  const validateOrder = () => {
    if (!selectedVendor) {
      setError("Please select a vendor")
      return false
    }
    if (orderItems.length === 0) {
      setError("Please add at least one item to the order")
      return false
    }
    setError("")
    return true
  }

  // Place order
  const handlePlaceOrder = async () => {
    if (!validateOrder() || !currentUser) return

    setIsPlacingOrder(true)
    setError("")

    try {
      const vendor = vendors.find((v) => v.id === selectedVendor)
      if (!vendor) {
        setError("Selected vendor not found")
        setIsPlacingOrder(false)
        return
      }

      const orderId = `ORD-${Date.now()}`
      const totals = getOrderTotals()

      // Convert order items to order format
      const orderItemsFormatted = orderItems.map((item) => {
        const product = availableItems.find((p) => p.id === item.productId)!
        return {
          ...product,
          requestedQuantity: item.quantity,
          salesmanPrice: item.unitPrice,
          gstBill: item.gstBill,
          gstNumber: item.gstNumber,
        }
      })

      const newOrder = {
        salesmanId: currentUser.id,
        salesmanName: currentUser.name,
        vendorId: vendor.id,
        vendorName: vendor.name,
        items: orderItemsFormatted,
        status: "pending" as const,
        totalItems: totals.totalQuantity,
        notes,
        salesmanPricing: {
          subtotal: totals.subtotal,
          total: totals.subtotal,
          itemPrices: orderItems.reduce(
            (acc, item) => {
              acc[item.productId] = item.unitPrice
              return acc
            },
            {} as Record<string, number>,
          ),
        },
      }

      addOrder(newOrder)

      setOrderPlaced(true)
      setPlacedOrderId(orderId)
      setSuccess("Order placed successfully! Waiting for admin to set official pricing.")

      setTimeout(() => {
        handleResetForm()
        onOpenChange(false)
      }, 3000)
    } catch (error) {
      setError("Failed to place order. Please try again.")
      console.error("Order placement error:", error)
    } finally {
      setIsPlacingOrder(false)
    }
  }

  // Reset form
  const handleResetForm = () => {
    setSelectedVendor("")
    setSelectedProduct("")
    setQuantity("")
    setUnitPrice("")
    setGstBill("no")
    setGstNumber("")
    setOrderItems([])
    setNotes("")
    setError("")
    setSuccess("")
    setOrderPlaced(false)
    setPlacedOrderId("")
    setIsPlacingOrder(false)
  }

  // Handle dialog close
  const handleDialogClose = (open: boolean) => {
    if (!open && !isPlacingOrder) {
      handleResetForm()
    }
    onOpenChange(open)
  }

  // Check if current line item can be added
  const canAddItem =
    selectedProduct &&
    quantity &&
    unitPrice &&
    Number.parseFloat(quantity) > 0 &&
    Number.parseFloat(unitPrice) > 0 &&
    (gstBill === "no" || (gstBill === "yes" && gstNumber.trim()))

  // Check if order can be placed
  const canPlaceOrder = selectedVendor && orderItems.length > 0 && !isPlacingOrder && !orderPlaced

  // Success state UI
  if (orderPlaced) {
    const totals = getOrderTotals()
    return (
      <Dialog open={open} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="w-6 h-6" />
              <span>Order Submitted Successfully!</span>
            </DialogTitle>
            <DialogDescription>Your order is pending admin pricing</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Order ID:</span>
                  <span className="text-yellow-700">{placedOrderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    <Clock className="w-3 h-3 mr-1" />
                    Pending Admin Pricing
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Items:</span>
                  <span>{totals.itemCount} types</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Total Quantity:</span>
                  <span>{totals.totalQuantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Your Total:</span>
                  <span className="text-yellow-700 font-bold">{formatCurrency(totals.subtotal)}</span>
                </div>
              </div>
            </div>

            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription className="text-sm">
                ⏳ Order submitted to admin for official pricing
                <br />🚫 Invoice generation disabled until admin sets prices
                <br />📧 You'll be notified when pricing is complete
              </AlertDescription>
            </Alert>

            <div className="flex justify-center">
              <Button onClick={() => handleDialogClose(false)} className="w-full">
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5" />
            <span>Create New Order</span>
          </DialogTitle>
          <DialogDescription>
            Select vendor and add products with pricing details. Admin will set official pricing after submission.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Vendor Selection */}
          <div className="space-y-2">
            <Label htmlFor="vendor">Select Vendor *</Label>
            <Select value={selectedVendor} onValueChange={setSelectedVendor} disabled={isPlacingOrder}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a vendor" />
              </SelectTrigger>
              <SelectContent>
                {vendors.map((vendor) => (
                  <SelectItem key={vendor.id} value={vendor.id}>
                    {vendor.name} - {vendor.contactPerson}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {vendors.length === 0 && (
              <p className="text-sm text-muted-foreground">No vendors available. Please create a vendor first.</p>
            )}
          </div>

          {/* Add Item Section */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Add Items to Order</Label>

            <div className="p-4 border rounded-lg bg-muted/20 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Product Selection */}
                <div className="space-y-2">
                  <Label htmlFor="product">Product *</Label>
                  <Select value={selectedProduct} onValueChange={setSelectedProduct} disabled={isPlacingOrder}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableItems.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} ({item.volume})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Quantity */}
                <div className="space-y-2">
                  <Label htmlFor="quantity">Qty *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Enter quantity"
                    min="1"
                    step="1"
                    disabled={isPlacingOrder}
                  />
                </div>

                {/* Unit Price */}
                <div className="space-y-2">
                  <Label htmlFor="unitPrice">Unit Price (Inclusive GST) *</Label>
                  <div className="flex items-center space-x-1">
                    <IndianRupee className="w-4 h-4 text-green-600" />
                    <Input
                      id="unitPrice"
                      type="number"
                      step="0.01"
                      value={unitPrice}
                      onChange={(e) => setUnitPrice(e.target.value)}
                      placeholder="0.00"
                      min="0"
                      disabled={isPlacingOrder}
                    />
                  </div>
                </div>
              </div>

              {/* Total Amount Display */}
              {quantity && unitPrice && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calculator className="w-4 h-4 text-green-600" />
                      <span className="font-medium">Total Amount:</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">{formatCurrency(getCurrentTotalAmount())}</span>
                  </div>
                </div>
              )}

              {/* GST Bill Section */}
              <div className="space-y-3">
                <Label>GST Bill *</Label>
                <RadioGroup value={gstBill} onValueChange={(value: "yes" | "no") => setGstBill(value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="gst-yes" />
                    <Label htmlFor="gst-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="gst-no" />
                    <Label htmlFor="gst-no">No</Label>
                  </div>
                </RadioGroup>

                {/* GST Number (conditional) */}
                {gstBill === "yes" && (
                  <div className="space-y-2">
                    <Label htmlFor="gstNumber">GST Number *</Label>
                    <Input
                      id="gstNumber"
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value)}
                      placeholder="Enter GST number"
                      disabled={isPlacingOrder}
                    />
                  </div>
                )}
              </div>

              {/* Add Item Button */}
              <div className="flex justify-end">
                <Button
                  onClick={handleAddItem}
                  disabled={!canAddItem || isPlacingOrder}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item to Order
                </Button>
              </div>
            </div>
          </div>

          {/* Order Items Table */}
          {orderItems.length > 0 && (
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Order Items</Label>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>S.No.</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Unit Price (₹)</TableHead>
                      <TableHead>Total Amount (₹)</TableHead>
                      <TableHead>GST Bill</TableHead>
                      <TableHead>GST Number</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderItems.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell className="font-medium text-green-600">{formatCurrency(item.totalAmount)}</TableCell>
                        <TableCell>
                          <Badge variant={item.gstBill === "yes" ? "default" : "secondary"}>
                            {item.gstBill === "yes" ? "Yes" : "No"}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.gstNumber || "-"}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-600 hover:text-red-700"
                            disabled={isPlacingOrder}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Order Summary */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Order Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Total Items:</span>
                    <p className="font-semibold">{getOrderTotals().itemCount}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Quantity:</span>
                    <p className="font-semibold">{getOrderTotals().totalQuantity}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Grand Total:</span>
                    <p className="font-semibold text-green-600 text-lg">{formatCurrency(getOrderTotals().subtotal)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Order Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Order Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any special instructions or notes for this order..."
              rows={3}
              disabled={isPlacingOrder}
            />
          </div>

          {/* Error/Success Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => handleDialogClose(false)} disabled={isPlacingOrder}>
              Cancel
            </Button>
            <Button
              onClick={handlePlaceOrder}
              disabled={!canPlaceOrder}
              className={`${
                canPlaceOrder
                  ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              } transition-all duration-200`}
            >
              {isPlacingOrder ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting Order...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Place Order
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
