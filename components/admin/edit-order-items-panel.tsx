import React, { useState } from "react"
import { useOrders } from "@/contexts/order-context"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Input } from "@/components/ui/input"

export function EditOrderItemsPanel() {
  const { orders, updateOrder, availableItems } = useOrders()
  const [selectedOrderId, setSelectedOrderId] = useState(orders[0]?.id || "")
  const selectedOrder = orders.find(o => o.id === selectedOrderId)
  const [editItems, setEditItems] = useState(selectedOrder ? [...selectedOrder.items] : [])
  const [selectedItemId, setSelectedItemId] = useState("")
  const [newQuantity, setNewQuantity] = useState(1)
  const [newUnitPrice, setNewUnitPrice] = useState(0)

  React.useEffect(() => {
    const order = orders.find(o => o.id === selectedOrderId)
    setEditItems(order ? [...order.items] : [])
  }, [selectedOrderId, orders])

  // Add item from availableItems
  const handleAddItem = () => {
    if (!selectedItemId) return
    const item = availableItems.find(i => i.id === selectedItemId)
    if (!item) return
    // Prevent duplicate
    if (editItems.some(i => i.id === item.id)) return
    setEditItems(items => [
      ...items,
      {
        ...item,
        requestedQuantity: newQuantity,
        unitPrice: newUnitPrice || item.unitPrice || 0,
        lineTotal: (newUnitPrice || item.unitPrice || 0) * newQuantity,
      },
    ])
    setSelectedItemId("")
    setNewQuantity(1)
    setNewUnitPrice(0)
  }

  // Edit quantity or price
  const handleItemChange = (index: number, field: "requestedQuantity" | "unitPrice", value: number) => {
    setEditItems(items => {
      const updated = [...items]
      updated[index] = {
        ...updated[index],
        [field]: value,
        lineTotal:
          field === "unitPrice"
            ? value * updated[index].requestedQuantity
            : updated[index].unitPrice! * value,
      }
      return updated
    })
  }

  // Remove item
  const handleRemoveItem = (itemId: string) => {
    setEditItems(items => items.filter(i => i.id !== itemId))
  }

  // Save changes
  const handleSave = () => {
    updateOrder(selectedOrderId, { items: editItems })
    alert("Order items updated!")
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Edit Items in Order</CardTitle>
        <select value={selectedOrderId} onChange={e => setSelectedOrderId(e.target.value)} className="mt-2 p-2 border rounded">
          {orders.map(order => (
            <option key={order.id} value={order.id}>
              {order.orderNumber || order.id} - {order.clientName}
            </option>
          ))}
        </select>
      </CardHeader>
      <CardContent>
        {selectedOrder ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Volume</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Line Total</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {editItems.map((item, idx) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.volume}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.requestedQuantity}
                        min={1}
                        onChange={e => handleItemChange(idx, "requestedQuantity", Number(e.target.value))}
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.unitPrice || 0}
                        min={0}
                        onChange={e => handleItemChange(idx, "unitPrice", Number(e.target.value))}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>{((item.unitPrice || 0) * item.requestedQuantity).toFixed(2)}</TableCell>
                    <TableCell>
                      <Button variant="destructive" size="sm" onClick={() => handleRemoveItem(item.id)}>
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex gap-2 mt-4 items-end">
              <select
                value={selectedItemId}
                onChange={e => setSelectedItemId(e.target.value)}
                className="p-2 border rounded"
              >
                <option value="">Select item to add</option>
                {availableItems
                  .filter(ai => !editItems.some(ei => ei.id === ai.id))
                  .map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.volume})
                    </option>
                  ))}
              </select>
              <Input
                type="number"
                min={1}
                value={newQuantity}
                onChange={e => setNewQuantity(Number(e.target.value))}
                placeholder="Qty"
                className="w-20"
              />
              <Input
                type="number"
                min={0}
                value={newUnitPrice}
                onChange={e => setNewUnitPrice(Number(e.target.value))}
                placeholder="Unit Price"
                className="w-24"
              />
              <Button onClick={handleAddItem}>Add Item</Button>
            </div>
            <Button className="mt-4" onClick={handleSave}>Save Changes</Button>
          </>
        ) : (
          <div>No order selected.</div>
        )}
      </CardContent>
    </Card>
  )
} 