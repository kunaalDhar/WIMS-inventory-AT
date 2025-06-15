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
import type { Client } from "@/contexts/order-context"

interface ClientFormData {
  clientName: string
  email: string
  contactNumber: string
  address: string
  contactPerson: string
  gstNumber: string
  city: string
  area: string
}

export function ClientsPanel() {
  const { clients, addClient, updateClient, deleteClient } = useOrders()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [formData, setFormData] = useState<ClientFormData>({
    clientName: "",
    email: "",
    contactNumber: "",
    address: "",
    contactPerson: "",
    gstNumber: "",
    city: "",
    area: "",
  })

  // Check if form is valid (only Client Name is required)
  const isFormValid = formData.clientName.trim().length > 0

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Validate required field
    if (!formData.clientName.trim()) {
      alert("Client Name is required")
      return
    }

    if (editingClient) {
      updateClient(editingClient.id, {
        ...formData,
        clientName: formData.clientName.trim(),
        email: formData.email.trim(),
        contactNumber: formData.contactNumber.trim(),
        address: formData.address.trim(),
        contactPerson: formData.contactPerson.trim(),
        gstNumber: formData.gstNumber.trim(),
        city: formData.city.trim(),
        area: formData.area.trim(),
        partyName: formData.clientName.trim(),
      })
      setEditingClient(null)
    } else {
      addClient({
        ...formData,
        clientName: formData.clientName.trim(),
        email: formData.email.trim(),
        contactNumber: formData.contactNumber.trim(),
        address: formData.address.trim(),
        contactPerson: formData.contactPerson.trim(),
        gstNumber: formData.gstNumber.trim(),
        city: formData.city.trim(),
        area: formData.area.trim(),
        partyName: formData.clientName.trim(), // for compatibility
        createdBy: "admin", // or get from context if available
      })
      setIsAddDialogOpen(false)
    }

    // Reset form
    setFormData({
      clientName: "",
      email: "",
      contactNumber: "",
      address: "",
      contactPerson: "",
      gstNumber: "",
      city: "",
      area: "",
    })
  }

  const handleEdit = (client: Client) => {
    setEditingClient(client)
    setFormData({
      clientName: client.clientName || client.name || "",
      email: client.email || "",
      contactNumber: client.contactNumber || client.phone || "",
      address: client.address || "",
      contactPerson: client.contactPerson || "",
      gstNumber: client.gstNumber || "",
      city: client.city || "",
      area: client.area || "",
    })
  }

  const handleDelete = (clientId: string) => {
    if (confirm("Are you sure you want to delete this client?")) {
      deleteClient(clientId)
    }
  }

  const resetForm = () => {
    setFormData({
      clientName: "",
      email: "",
      contactNumber: "",
      address: "",
      contactPerson: "",
      gstNumber: "",
      city: "",
      area: "",
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
                  value={formData.clientName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, clientName: e.target.value }))}
                  placeholder="Enter client company name"
                  className={`${
                    formData.clientName.trim().length === 0 ? "border-red-300 focus:border-red-500" : "border-green-300"
                  }`}
                  required
                />
                {formData.clientName.trim().length === 0 && (
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
                  value={formData.contactNumber}
                  onChange={(e) => setFormData((prev) => ({ ...prev, contactNumber: e.target.value }))}
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
                  <CardTitle>{client.clientName || client.name}</CardTitle>
                  <CardDescription>
                    {client.contactPerson && `Contact: ${client.contactPerson}`}
                    {client.email && ` • ${client.email}`}
                    {(client.contactNumber || client.phone) && ` • ${client.contactNumber || client.phone}`}
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
                            value={formData.clientName}
                            onChange={(e) => setFormData((prev) => ({ ...prev, clientName: e.target.value }))}
                            placeholder="Enter client company name"
                            className={`${
                              formData.clientName.trim().length === 0
                                ? "border-red-300 focus:border-red-500"
                                : "border-green-300"
                            }`}
                            required
                          />
                          {formData.clientName.trim().length === 0 && (
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
                            value={formData.contactNumber}
                            onChange={(e) => setFormData((prev) => ({ ...prev, contactNumber: e.target.value }))}
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
