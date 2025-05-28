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
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, ShoppingCart, CheckCircle, IndianRupee, Clock } from "lucide-react"

interface CreateOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface SelectedOrderItem {
  id: string
  quantity: number
  unitPrice: number
}

export function CreateOrderDialog({ open, onOpenChange }: CreateOrderDialogProps) {
  const { currentUser } = useAuth()
  const { vendors, availableItems, addOrder } = useOrders()
  const [selectedVendor, setSelectedVendor] = useState("")
  const [selectedItemId, setSelectedItemId] = useState("")
  const [selectedQuantity, setSelectedQuantity] = useState("")
  const [unitPrice, setUnitPrice] = useState("")
  const [selectedItems, setSelectedItems] = useState<SelectedOrderItem[]>([])
  const [notes, setNotes] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [placedOrderId, setPlacedOrderId] = useState("")

  // Generate quantity options (1 to 50 cases)
  const quantityOptions = Array.from({ length: 50 }, (_, i) => i + 1)

  const handleAddItemToOrder = () => {
    if (!selectedItemId || !selectedQuantity || !unitPrice) {
      setError("Please select an item, quantity, and enter unit price")
      return
    }

    const quantity = Number.parseInt(selectedQuantity)
    const price = Number.parseFloat(unitPrice)

    if (quantity <= 0) {
      setError("Quantity must be greater than 0")
      return
    }

    if (price < 0) {
      setError("Unit price cannot be negative")
      return
    }

    // Check if item already exists in the order
    const existingItemIndex = selectedItems.findIndex((item) => item.id === selectedItemId)

    if (existingItemIndex >= 0) {
      // Update existing item
      setSelectedItems((prev) =>
        prev.map((item, index) =>
          index === existingItemIndex ? { ...item, quantity: item.quantity + quantity, unitPrice: price } : item,
        ),
      )
    } else {
      // Add new item
      setSelectedItems((prev) => [...prev, { id: selectedItemId, quantity, unitPrice: price }])
    }

    // Reset form fields
    setSelectedItemId("")
    setSelectedQuantity("")
    setUnitPrice("")
    setError("")
  }

  const handleRemoveItem = (index: number) => {
    setSelectedItems((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpdateItemPrice = (index: number, newPrice: number) => {
    if (newPrice < 0) return
    setSelectedItems((prev) => prev.map((item, i) => (i === index ? { ...item, unitPrice: newPrice } : item)))
  }

  const calculateOrderTotal = () => {
    return selectedItems.reduce((total, item) => {
      return total + item.quantity * item.unitPrice
    }, 0)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const validateOrder = () => {
    if (!selectedVendor) {
      setError("Please select a vendor")
      return false
    }
    if (selectedItems.length === 0) {
      setError("Please add at least one item to the order")
      return false
    }
    setError("")
    return true
  }

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

      const orderItems = selectedItems.map((selectedItem) => {
        const item = availableItems.find((i) => i.id === selectedItem.id)!
        return {
          ...item,
          requestedQuantity: selectedItem.quantity,
          salesmanPrice: selectedItem.unitPrice,
        }
      })

      const orderId = `ORD-${Date.now()}`
      const newOrder = {
        salesmanId: currentUser.id,
        salesmanName: currentUser.name,
        vendorId: vendor.id,
        vendorName: vendor.name,
        items: orderItems,
        status: "pending" as const,
        totalItems: selectedItems.reduce((sum, item) => sum + item.quantity, 0),
        notes,
        salesmanPricing: {
          subtotal: calculateOrderTotal(),
          total: calculateOrderTotal(),
          itemPrices: selectedItems.reduce(
            (acc, item) => {
              acc[item.id] = item.unitPrice
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

  const handleResetForm = () => {
    setSelectedVendor("")
    setSelectedItemId("")
    setSelectedQuantity("")
    setUnitPrice("")
    setSelectedItems([])
    setNotes("")
    setError("")
    setSuccess("")
    setOrderPlaced(false)
    setPlacedOrderId("")
    setIsPlacingOrder(false)
  }

  const handleDialogClose = (open: boolean) => {
    if (!open && !isPlacingOrder) {
      handleResetForm()
    }
    onOpenChange(open)
  }

  const getItemDetails = (itemId: string) => {
    return availableItems.find((item) => item.id === itemId)
  }

  const isOrderValid = selectedVendor && selectedItems.length > 0 && !isPlacingOrder && !orderPlaced
  const canAddItem = selectedItemId && selectedQuantity && unitPrice && Number.parseFloat(unitPrice) >= 0

  // Success state UI
  if (orderPlaced) {
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
                  <span>{selectedItems.length} types</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Total Cases:</span>
                  <span>{selectedItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Your Pricing:</span>
                  <span className="text-yellow-700 font-bold">{formatCurrency(calculateOrderTotal())}</span>
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
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5" />
            <span>Create New Order</span>
          </DialogTitle>
          <DialogDescription>
            Select vendor and add fruit juice items with your pricing. Admin will set official pricing after submission.
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

          {/* Item Selection Section */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Add Items to Order</Label>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/20">
              {/* Item Selection Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="item">Select Item *</Label>
                <Select value={selectedItemId} onValueChange={setSelectedItemId} disabled={isPlacingOrder}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an item" />
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

              {/* Number of Cases Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="quantity">Number of Cases *</Label>
                <Select value={selectedQuantity} onValueChange={setSelectedQuantity} disabled={isPlacingOrder}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select cases" />
                  </SelectTrigger>
                  <SelectContent>
                    {quantityOptions.map((qty) => (
                      <SelectItem key={qty} value={qty.toString()}>
                        {qty} {qty === 1 ? "case" : "cases"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Unit Price Input */}
              <div className="space-y-2">
                <Label htmlFor="unitPrice">Your Price (₹) *</Label>
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
                <p className="text-xs text-muted-foreground">Admin will set official pricing</p>
              </div>

              {/* Add Item Button */}
              <div className="space-y-2">
                <Label>&nbsp;</Label>
                <Button onClick={handleAddItemToOrder} disabled={!canAddItem || isPlacingOrder} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </div>

            {/* Display selected item details */}
            {selectedItemId && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                {(() => {
                  const item = getItemDetails(selectedItemId)
                  return item ? (
                    <div className="text-sm">
                      <p>
                        <strong>Selected:</strong> {item.name} - {item.description}
                      </p>
                      <p>
                        <strong>Specifications:</strong> {item.volume}, {item.bottlesPerCase} bottles per case
                      </p>
                    </div>
                  ) : null
                })()}
              </div>
            )}
          </div>

          {/* Selected Items Table */}
          {selectedItems.length > 0 && (
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Order Items (Pending Admin Pricing)</Label>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>S.No.</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Volume</TableHead>
                      <TableHead>Cases</TableHead>
                      <TableHead>Total Bottles</TableHead>
                      <TableHead>Your Price (₹)</TableHead>
                      <TableHead>Line Total (₹)</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedItems.map((selectedItem, index) => {
                      const item = getItemDetails(selectedItem.id)
                      if (!item) return null

                      const totalBottles = selectedItem.quantity * item.bottlesPerCase
                      const lineTotal = selectedItem.quantity * selectedItem.unitPrice

                      return (
                        <TableRow key={`${selectedItem.id}-${index}`}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-xs text-muted-foreground">{item.category}</p>
                            </div>
                          </TableCell>
                          <TableCell>{item.volume}</TableCell>
                          <TableCell className="font-medium">{selectedItem.quantity}</TableCell>
                          <TableCell>{totalBottles}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <IndianRupee className="w-4 h-4 text-green-600" />
                              <Input
                                type="number"
                                step="0.01"
                                value={selectedItem.unitPrice}
                                onChange={(e) => handleUpdateItemPrice(index, Number.parseFloat(e.target.value) || 0)}
                                className="w-20"
                                min="0"
                                disabled={isPlacingOrder}
                              />
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-green-600">{formatCurrency(lineTotal)}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveItem(index)}
                              className="text-red-600 hover:text-red-700"
                              disabled={isPlacingOrder}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
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

          {/* Order Summary */}
          {selectedItems.length > 0 && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Order Summary (Pending Admin Pricing)</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Cases:</span>
                  <p className="font-semibold">{selectedItems.reduce((sum, item) => sum + item.quantity, 0)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Bottles:</span>
                  <p className="font-semibold">
                    {selectedItems.reduce((total, selectedItem) => {
                      const item = getItemDetails(selectedItem.id)
                      return total + (item ? selectedItem.quantity * item.bottlesPerCase : 0)
                    }, 0)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Product Types:</span>
                  <p className="font-semibold">{selectedItems.length}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Your Total:</span>
                  <p className="font-semibold text-yellow-600 text-lg">{formatCurrency(calculateOrderTotal())}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                * Final pricing will be set by admin. Invoice generation will be available after admin pricing.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => handleDialogClose(false)} disabled={isPlacingOrder}>
              Cancel
            </Button>
            <Button
              onClick={handlePlaceOrder}
              disabled={!isOrderValid}
              className={`${
                isOrderValid
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
                  Submit for Admin Pricing
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
