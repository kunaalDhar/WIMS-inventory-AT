"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calculator, TrendingUp, TrendingDown, DollarSign, CheckCircle } from "lucide-react"

interface PriceAdjustmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: any
  onAdjustPricing: (adjustments: Record<string, number>) => void
}

export function PriceAdjustmentDialog({ open, onOpenChange, order, onAdjustPricing }: PriceAdjustmentDialogProps) {
  const [adjustments, setAdjustments] = useState<Record<string, number>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!order) return null

  const adjustmentRange = order.priceAdjustmentRange || { min: 10, max: 15 }

  const handleAdjustmentChange = (itemId: string, adjustment: number) => {
    // Clamp adjustment to allowed range
    const clampedAdjustment = Math.max(-adjustmentRange.max, Math.min(adjustmentRange.max, adjustment))
    setAdjustments((prev) => ({
      ...prev,
      [itemId]: clampedAdjustment,
    }))
  }

  const calculateNewPricing = () => {
    let newSubtotal = 0
    const newItemPrices: Record<string, number> = {}

    order.items.forEach((item: any) => {
      const basePrice = order.salesmanPricing?.itemPrices[item.id] || item.unitPrice || 0
      const adjustment = adjustments[item.id] || 0
      const newPrice = basePrice + adjustment
      newItemPrices[item.id] = newPrice
      newSubtotal += newPrice * item.requestedQuantity
    })

    const taxRate = order.withGst ? 0.12 : 0
    const newTax = newSubtotal * taxRate
    const newTotal = newSubtotal + newTax

    return { newSubtotal, newTax, newTotal, newItemPrices }
  }

  const { newSubtotal, newTax, newTotal, newItemPrices } = calculateNewPricing()
  const originalTotal = order.salesmanPricing?.total || 0
  const totalDifference = newTotal - originalTotal

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await onAdjustPricing(adjustments)
      onOpenChange(false)
      setAdjustments({})
    } catch (error) {
      console.error("Error adjusting pricing:", error)
      alert("Failed to adjust pricing. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calculator className="w-5 h-5" />
            <span>Adjust Order Pricing - {order.orderNumber}</span>
          </DialogTitle>
          <DialogDescription>
            Adjust item prices within the allowed range of ±₹{adjustmentRange.min} to ±₹{adjustmentRange.max} per item.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Adjustment Range Info */}
          <Alert>
            <DollarSign className="h-4 w-4" />
            <AlertDescription>
              <strong>Price Adjustment Rules:</strong>
              <br />• You can increase or decrease each item price by ₹{adjustmentRange.min} to ₹{adjustmentRange.max}
              <br />• Adjustments will be applied to the final bill automatically
              <br />• {order.withGst ? "12% GST will be calculated on adjusted prices" : "No GST will be applied"}
            </AlertDescription>
          </Alert>

          {/* Items Adjustment */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Item Price Adjustments</Label>
            <div className="space-y-3">
              {order.items.map((item: any) => {
                const basePrice = order.salesmanPricing?.itemPrices[item.id] || item.unitPrice || 0
                const adjustment = adjustments[item.id] || 0
                const newPrice = basePrice + adjustment
                const lineTotalChange = adjustment * item.requestedQuantity

                return (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                        <div>
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {item.category} • {item.volume}
                          </p>
                          <p className="text-xs text-muted-foreground">Qty: {item.requestedQuantity}</p>
                        </div>

                        <div className="text-center">
                          <p className="text-sm font-medium">Base Price</p>
                          <p className="text-lg">{formatCurrency(basePrice)}</p>
                        </div>

                        <div className="text-center">
                          <Label htmlFor={`adjustment-${item.id}`} className="text-sm">
                            Adjustment (₹)
                          </Label>
                          <div className="flex items-center space-x-2 mt-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleAdjustmentChange(item.id, Math.max(-adjustmentRange.max, adjustment - 1))
                              }
                              disabled={adjustment <= -adjustmentRange.max}
                            >
                              -
                            </Button>
                            <Input
                              id={`adjustment-${item.id}`}
                              type="number"
                              value={adjustment}
                              onChange={(e) => handleAdjustmentChange(item.id, Number.parseFloat(e.target.value) || 0)}
                              className="w-20 text-center"
                              min={-adjustmentRange.max}
                              max={adjustmentRange.max}
                              step="0.5"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleAdjustmentChange(item.id, Math.min(adjustmentRange.max, adjustment + 1))
                              }
                              disabled={adjustment >= adjustmentRange.max}
                            >
                              +
                            </Button>
                          </div>
                          {adjustment !== 0 && (
                            <div className="mt-1">
                              {adjustment > 0 ? (
                                <Badge variant="default" className="text-xs">
                                  <TrendingUp className="w-3 h-3 mr-1" />+{formatCurrency(adjustment)}
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs">
                                  <TrendingDown className="w-3 h-3 mr-1" />
                                  {formatCurrency(adjustment)}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="text-center">
                          <p className="text-sm font-medium">New Price</p>
                          <p className="text-lg font-bold text-green-600">{formatCurrency(newPrice)}</p>
                          {lineTotalChange !== 0 && (
                            <p className="text-xs text-muted-foreground">
                              Line change: {lineTotalChange > 0 ? "+" : ""}
                              {formatCurrency(lineTotalChange)}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          <Separator />

          {/* Pricing Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Updated Pricing Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Original Pricing</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(order.salesmanPricing?.subtotal || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST ({order.withGst ? "12%" : "0%"}):</span>
                      <span>{formatCurrency(order.salesmanPricing?.tax || 0)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>{formatCurrency(originalTotal)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">New Pricing</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(newSubtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST ({order.withGst ? "12%" : "0%"}):</span>
                      <span>{formatCurrency(newTax)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total:</span>
                      <span className="text-green-600">{formatCurrency(newTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Difference:</span>
                      <span className={totalDifference >= 0 ? "text-green-600" : "text-red-600"}>
                        {totalDifference >= 0 ? "+" : ""}
                        {formatCurrency(totalDifference)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Applying Adjustments..." : "Apply Price Adjustments"}
              <CheckCircle className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
