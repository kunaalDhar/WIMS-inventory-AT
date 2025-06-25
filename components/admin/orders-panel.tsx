"use client"

import React, { useState } from "react"
import { useOrders } from "@/contexts/order-context"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

export function OrdersPanel() {
  const { orders, clients, users, addOrder, updateOrder, deleteClient } = useOrders()
  const [showModal, setShowModal] = useState(false)
  const [editOrder, setEditOrder] = useState(null)

  const handleAdd = () => {
    setEditOrder(null)
    setShowModal(true)
  }

  const handleEdit = (order) => {
    setEditOrder(order)
    setShowModal(true)
  }

  const handleDelete = (orderId) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      // You may want to implement a deleteOrder function in your context
      // For now, use updateOrder to mark as deleted or remove from state
      updateOrder(orderId, { status: "deleted" })
    }
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Orders Management</CardTitle>
        <Button onClick={handleAdd} className="mt-2">Add Order</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Salesman</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.filter(o => o.status !== "deleted").map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.orderNumber}</TableCell>
                <TableCell>{order.salesmanName}</TableCell>
                <TableCell>{order.clientName}</TableCell>
                <TableCell>{order.status}</TableCell>
                <TableCell>
                  <Button size="sm" onClick={() => handleEdit(order)}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(order.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      {showModal && (
        <OrderFormModal
          open={showModal}
          onOpenChange={setShowModal}
          order={editOrder}
          clients={clients}
          users={users}
          addOrder={addOrder}
          updateOrder={updateOrder}
        />
      )}
    </Card>
  )
}

function OrderFormModal({ open, onOpenChange, order, clients, users, addOrder, updateOrder }) {
  // Implement form state and logic for adding/editing orders and setting product prices
  // ...
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{order ? "Edit Order" : "Add Order"}</DialogTitle>
        </DialogHeader>
        {/* Form fields for salesman, client, products, prices, etc. */}
        <div>Order form goes here (to be implemented)...</div>
      </DialogContent>
    </Dialog>
  )
}
