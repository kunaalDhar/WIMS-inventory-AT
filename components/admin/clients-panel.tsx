"use client"

import { useState } from "react"
import { useOrders } from "@/contexts/order-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Users, Edit, Trash2 } from "lucide-react"

export function ClientsPanel() {
  const { clients, addClient, updateClient, deleteClient } = useOrders()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    contactPerson: "",
    gstNumber: "",
  })

  // Check if form is valid (only Client Name is required)
  const isFormValid = formData.name.trim().length > 0

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate required field
    if (!formData.name.trim()) {
      alert("Client Name is required")
      return
    }

    if (editingClient) {
      updateClient(editingClient.id, {
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        contactPerson: formData.contactPerson.trim(),
        gstNumber: formData.gstNumber.trim(),
      })
      setEditingClient(null)
    } else {
      addClient({
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        contactPerson: formData.contactPerson.trim(),
        gstNumber: formData.gstNumber.trim(),
      })
      setIsAddDialogOpen(false)
    }

    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      contactPerson: "",
      gstNumber: "",
    })
  }

  const handleEdit = (client) => {
    setEditingClient(client)
    setFormData({
      name: client.name || "",
      email: client.email || "",
      phone: client.phone || "",
      address: client.address || "",
      contactPerson: client.contactPerson || "",
      gstNumber: client.gstNumber || "",
    })
  }

  const handleDelete = (clientId) => {
    if (confirm("Are you sure you want to delete this client?")) {
      deleteClient(clientId)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      contactPerson: "",
      gstNumber: "",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Clients Management</h2>
          <p className="text-gray-600">Manage your client database</p>
        </div>
        <Dialog
          open={isAddDialogOpen}
          onOpenChange={(open) => {
            setIsAddDialogOpen(open)
            if (!open) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
              <DialogDescription>
                Enter client information. Client Name is required, all other fields are optional.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium">
                  Client Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter client company name"
                  className={`${
                    formData.name.trim().length === 0 ? "border-red-300 focus:border-red-500" : "border-green-300"
                  }`}
                  required
                />
                {formData.name.trim().length === 0 && (
                  <p className="text-xs text-red-500 mt-1">Client Name is required</p>
                )}
              </div>

              <div>
                <Label htmlFor="contactPerson" className="text-sm font-medium">
                  Contact Person <span className="text-gray-400">(Optional)</span>
                </Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData((prev) => ({ ...prev, contactPerson: e.target.value }))}
                  placeholder="Enter contact person name"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-medium">
                  Client Email <span className="text-gray-400">(Optional)</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="client@example.com"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm font-medium">
                  Client Phone <span className="text-gray-400">(Optional)</span>
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="+91 98765 43210"
                />
              </div>

              <div>
                <Label htmlFor="address" className="text-sm font-medium">
                  Client Address <span className="text-gray-400">(Optional)</span>
                </Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter client address"
                />
              </div>

              <div>
                <Label htmlFor="gstNumber" className="text-sm font-medium">
                  Client GST Number <span className="text-gray-400">(Optional)</span>
                </Label>
                <Input
                  id="gstNumber"
                  value={formData.gstNumber}
                  onChange={(e) => setFormData((prev) => ({ ...prev, gstNumber: e.target.value }))}
                  placeholder="Enter GST number"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={!isFormValid}
                  className={`${
                    !isFormValid
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  Add Client
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
              </div>

              {!isFormValid && (
                <div className="text-center">
                  <p className="text-xs text-gray-500">Please enter the Client Name to enable the Add Client button</p>
                </div>
              )}
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {clients.map((client) => (
          <Card key={client.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{client.name}</CardTitle>
                  <CardDescription>
                    {client.contactPerson && `Contact: ${client.contactPerson}`}
                    {client.email && ` • ${client.email}`}
                    {client.phone && ` • ${client.phone}`}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Dialog
                    open={editingClient?.id === client.id}
                    onOpenChange={(open) => {
                      if (!open) {
                        setEditingClient(null)
                        resetForm()
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(client)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Client</DialogTitle>
                        <DialogDescription>
                          Update client information. Client Name is required, all other fields are optional.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="edit-name" className="text-sm font-medium">
                            Client Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="edit-name"
                            value={formData.name}
                            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                            placeholder="Enter client company name"
                            className={`${
                              formData.name.trim().length === 0
                                ? "border-red-300 focus:border-red-500"
                                : "border-green-300"
                            }`}
                            required
                          />
                          {formData.name.trim().length === 0 && (
                            <p className="text-xs text-red-500 mt-1">Client Name is required</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="edit-contactPerson" className="text-sm font-medium">
                            Contact Person <span className="text-gray-400">(Optional)</span>
                          </Label>
                          <Input
                            id="edit-contactPerson"
                            value={formData.contactPerson}
                            onChange={(e) => setFormData((prev) => ({ ...prev, contactPerson: e.target.value }))}
                            placeholder="Enter contact person name"
                          />
                        </div>

                        <div>
                          <Label htmlFor="edit-email" className="text-sm font-medium">
                            Client Email <span className="text-gray-400">(Optional)</span>
                          </Label>
                          <Input
                            id="edit-email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                            placeholder="client@example.com"
                          />
                        </div>

                        <div>
                          <Label htmlFor="edit-phone" className="text-sm font-medium">
                            Client Phone <span className="text-gray-400">(Optional)</span>
                          </Label>
                          <Input
                            id="edit-phone"
                            value={formData.phone}
                            onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                            placeholder="+91 98765 43210"
                          />
                        </div>

                        <div>
                          <Label htmlFor="edit-address" className="text-sm font-medium">
                            Client Address <span className="text-gray-400">(Optional)</span>
                          </Label>
                          <Input
                            id="edit-address"
                            value={formData.address}
                            onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                            placeholder="Enter client address"
                          />
                        </div>

                        <div>
                          <Label htmlFor="edit-gstNumber" className="text-sm font-medium">
                            Client GST Number <span className="text-gray-400">(Optional)</span>
                          </Label>
                          <Input
                            id="edit-gstNumber"
                            value={formData.gstNumber}
                            onChange={(e) => setFormData((prev) => ({ ...prev, gstNumber: e.target.value }))}
                            placeholder="Enter GST number"
                          />
                        </div>

                        <div className="flex gap-2 pt-4">
                          <Button
                            type="submit"
                            disabled={!isFormValid}
                            className={`${
                              !isFormValid
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 text-white"
                            }`}
                          >
                            Update Client
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setEditingClient(null)
                              resetForm()
                            }}
                          >
                            Cancel
                          </Button>
                        </div>

                        {!isFormValid && (
                          <div className="text-center">
                            <p className="text-xs text-gray-500">
                              Please enter the Client Name to enable the Update Client button
                            </p>
                          </div>
                        )}
                      </form>
                    </DialogContent>
                  </Dialog>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(client.id)}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {client.address && (
                  <p>
                    <strong>Address:</strong> {client.address}
                  </p>
                )}
                {client.gstNumber && (
                  <p>
                    <strong>GST:</strong> {client.gstNumber}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {clients.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No clients found</p>
              <p className="text-sm text-gray-400">Add your first client to get started</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
