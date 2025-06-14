"use client"

import React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useOrders } from "@/contexts/order-context"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Building2, CheckCircle, AlertTriangle, Database } from "lucide-react"

interface CreateClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const clientMasterData = [
  {
    partyName: "Aashirwad Karyana Store",
    contactPerson: "Rajesh Kumar",
    contactNumber: "9876543210",
    city: "Chandigarh",
    area: "Daria",
    address: "Shop No. 12, Daria Market",
    gstNumber: "03ABCDE1234F1Z5",
    email: "aashirwad@gmail.com",
  },
  {
    partyName: "Aggarwal Grocers",
    contactPerson: "Vikram Aggarwal",
    contactNumber: "9988776655",
    city: "Chandigarh",
    area: "Sector 56",
    address: "#1263, Sector 56, Chandigarh",
    gstNumber: "03FGHIJ5678K2A6",
    email: "aggarwal.grocers@gmail.com",
  },
  {
    partyName: "Bhatia General Store",
    contactPerson: "Meera Bhatia",
    contactNumber: "9876543211",
    city: "Chandigarh",
    area: "Bhaskar Colony",
    address: "House No. 567, Bhaskar Colony",
    gstNumber: "03LMNOP9012L3B7",
    email: "bhatia.store@gmail.com",
  },
  {
    partyName: "Chandigarh Super Market",
    contactPerson: "Ravi Gupta",
    contactNumber: "9988776656",
    city: "Chandigarh",
    area: "Sector 22",
    address: "SCO 45, Sector 22, Chandigarh",
    gstNumber: "03QRSTU3456M4C8",
    email: "supermarket.chd@gmail.com",
  },
  {
    partyName: "Daria Provision Store",
    contactPerson: "Kavita Jain",
    contactNumber: "9876543212",
    city: "Chandigarh",
    area: "Daria",
    address: "Shop No. 89, Daria Market",
    gstNumber: "03VWXYZ7890N5D9",
    email: "daria.provision@gmail.com",
  },
]

export function CreateClientDialog({ open, onOpenChange }: CreateClientDialogProps) {
  const { user } = useAuth()
  const { addClient, checkClientExists } = useOrders()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [duplicateError, setDuplicateError] = useState<string>("")
  const [formData, setFormData] = useState({
    partyName: "",
    contactPerson: "",
    contactNumber: "",
    city: "",
    area: "",
    address: "",
    gstNumber: "",
    email: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear duplicate error when user starts typing
    if (duplicateError && (field === "partyName" || field === "email")) {
      setDuplicateError("")
    }
  }

  // Check if form is valid (only Party Name is required)
  const isFormValid = formData.partyName.trim().length > 0 && !duplicateError

  // Real-time duplicate checking
  const checkForDuplicates = () => {
    if (formData.partyName.trim() || formData.email.trim()) {
      const existingClient = checkClientExists(formData.partyName.trim(), formData.email.trim())
      if (existingClient) {
        const duplicateField =
          existingClient.name?.toLowerCase() === formData.partyName.trim().toLowerCase() ? "partyName" : "email"
        setDuplicateError(
          `A client with this ${duplicateField} already exists: ${existingClient.name}${
            existingClient.email ? ` (${existingClient.email})` : ""
          }`,
        )
      } else {
        setDuplicateError("")
      }
    }
  }

  // Check for duplicates when name or email changes
  React.useEffect(() => {
    const timeoutId = setTimeout(checkForDuplicates, 500) // Debounce for 500ms
    return () => clearTimeout(timeoutId)
  }, [formData.partyName, formData.email])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !isFormValid) return

    setIsSubmitting(true)

    try {
      // Final validation
      if (!formData.partyName.trim()) {
        alert("Party Name is required")
        return
      }

      // Check for duplicates one more time
      const existingClient = checkClientExists(formData.partyName.trim(), formData.email.trim())
      if (existingClient) {
        setDuplicateError(
          `Client already exists: ${existingClient.name}${existingClient.email ? ` (${existingClient.email})` : ""}`,
        )
        return
      }

      // Add client with trimmed data
      const newClient = addClient({
        name: formData.partyName.trim(),
        partyName: formData.partyName.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        area: formData.area.trim(),
        contactPerson: formData.contactPerson.trim(),
        phone: formData.contactNumber.trim(),
        gstNumber: formData.gstNumber.trim(),
        email: formData.email.trim(),
        createdBy: user.id,
      })

      console.log("✅ Client created successfully:", newClient.name)

      // Show success message
      setShowSuccess(true)

      // Reset form
      setFormData({
        partyName: "",
        contactPerson: "",
        contactNumber: "",
        city: "",
        area: "",
        address: "",
        gstNumber: "",
        email: "",
      })
      setDuplicateError("")

      // Close dialog after a short delay
      setTimeout(() => {
        setShowSuccess(false)
        onOpenChange(false)
      }, 2000)
    } catch (error) {
      console.error("Error creating client:", error)
      if (error instanceof Error) {
        setDuplicateError(error.message)
      } else {
        alert("Failed to create client. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePSDClick = () => {
    // Add all pre-populated clients to the system
    clientMasterData.forEach((clientData) => {
      try {
        const existingClient = checkClientExists(clientData.partyName, clientData.email)
        if (!existingClient && user) {
          addClient({
            name: clientData.partyName,
            partyName: clientData.partyName,
            address: clientData.address,
            city: clientData.city,
            area: clientData.area,
            contactPerson: clientData.contactPerson,
            phone: clientData.contactNumber,
            gstNumber: clientData.gstNumber,
            email: clientData.email,
            createdBy: user.id,
          })
        }
      } catch (error) {
        console.error("Error adding pre-populated client:", error)
      }
    })
    
    alert(`✅ PSD Complete! ${clientMasterData.length} clients permanently saved to system.`)
    onOpenChange(false)
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setShowSuccess(false)
      setDuplicateError("")
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-white z-10 pb-4">
          <DialogTitle className="flex items-center space-x-2">
            <Building2 className="w-5 h-5" />
            <span>Add New Client</span>
          </DialogTitle>
          <DialogDescription>
            Select client details from dropdowns or use PSD to load all clients permanently.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pb-4">
          {showSuccess ? (
            <div className="py-8">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Success!</strong> Client has been selected successfully and is now available for creating
                  orders.
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* PSD Button */}
              <div className="flex justify-center pb-4">
                <Button
                  type="button"
                  onClick={handlePSDClick}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                >
                  <Database className="w-4 h-4" />
                  PSD (Permanently Saved Data)
                </Button>
              </div>

              {/* Duplicate Error Alert */}
              {duplicateError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{duplicateError}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 gap-4">
                {/* Party Name Dropdown */}
                <div>
                  <Label htmlFor="partyName" className="text-sm font-medium">
                    Select Party Name <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="partyName"
                    value={formData.partyName}
                    onChange={(e) => {
                      const selectedParty = e.target.value
                      const partyData = clientMasterData.find((p) => p.partyName === selectedParty)
                      if (partyData) {
                        setFormData({
                          partyName: partyData.partyName,
                          contactPerson: partyData.contactPerson,
                          contactNumber: partyData.contactNumber,
                          city: partyData.city,
                          area: partyData.area,
                          address: partyData.address,
                          gstNumber: partyData.gstNumber,
                          email: partyData.email || "",
                        })
                      } else {
                        handleInputChange("partyName", selectedParty)
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a party...</option>
                    <option value="Aashirwad Karyana Store">Aashirwad Karyana Store</option>
                    <option value="Aggarwal Grocers">Aggarwal Grocers</option>
                    <option value="Bhatia General Store">Bhatia General Store</option>
                    <option value="Chandigarh Super Market">Chandigarh Super Market</option>
                    <option value="Daria Provision Store">Daria Provision Store</option>
                    <option value="Elite Grocery Hub">Elite Grocery Hub</option>
                    <option value="Fresh Mart Chandigarh">Fresh Mart Chandigarh</option>
                    <option value="Golden Grocery Store">Golden Grocery Store</option>
                    <option value="Happy Foods Retail">Happy Foods Retail</option>
                    <option value="Indira Market Store">Indira Market Store</option>
                    <option value="Janta Store Sector 22">Janta Store Sector 22</option>
                    <option value="Kiran General Store">Kiran General Store</option>
                    <option value="Lucky Provision Store">Lucky Provision Store</option>
                    <option value="Modern Grocery Mart">Modern Grocery Mart</option>
                    <option value="New Punjab Store">New Punjab Store</option>
                    <option value="Om Sai Grocery">Om Sai Grocery</option>
                    <option value="Punjab Grocery Store">Punjab Grocery Store</option>
                    <option value="Quick Mart Chandigarh">Quick Mart Chandigarh</option>
                    <option value="Raj Provision Store">Raj Provision Store</option>
                    <option value="Sharma General Store">Sharma General Store</option>
                    <option value="Tridev Grocery Store">Tridev Grocery Store</option>
                    <option value="Unity Grocery Hub">Unity Grocery Hub</option>
                    <option value="Vishnu General Store">Vishnu General Store</option>
                    <option value="Welcome Grocery Store">Welcome Grocery Store</option>
                    <option value="Xtreme Grocery Mart">Xtreme Grocery Mart</option>
                  </select>
                </div>

                {/* Contact Person Dropdown */}
                <div>
                  <Label htmlFor="contactPerson" className="text-sm font-medium">
                    Contact Person
                  </Label>
                  <select
                    id="contactPerson"
                    value={formData.contactPerson}
                    onChange={(e) => handleInputChange("contactPerson", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select contact person...</option>
                    <option value="Rajesh Kumar">Rajesh Kumar</option>
                    <option value="Priya Sharma">Priya Sharma</option>
                    <option value="Amit Singh">Amit Singh</option>
                    <option value="Sunita Devi">Sunita Devi</option>
                    <option value="Vikram Aggarwal">Vikram Aggarwal</option>
                    <option value="Meera Bhatia">Meera Bhatia</option>
                    <option value="Ravi Gupta">Ravi Gupta</option>
                    <option value="Kavita Jain">Kavita Jain</option>
                    <option value="Suresh Chand">Suresh Chand</option>
                    <option value="Pooja Verma">Pooja Verma</option>
                  </select>
                </div>

                {/* Contact Number Dropdown */}
                <div>
                  <Label htmlFor="contactNumber" className="text-sm font-medium">
                    Contact Number
                  </Label>
                  <select
                    id="contactNumber"
                    value={formData.contactNumber}
                    onChange={(e) => handleInputChange("contactNumber", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select contact number...</option>
                    <option value="9876543210">9876543210</option>
                    <option value="9988776655">9988776655</option>
                    <option value="9876543211">9876543211</option>
                    <option value="9988776656">9988776656</option>
                    <option value="9876543212">9876543212</option>
                    <option value="9988776657">9988776657</option>
                    <option value="9876543213">9876543213</option>
                    <option value="9988776658">9988776658</option>
                    <option value="9876543214">9876543214</option>
                    <option value="9988776659">9988776659</option>
                  </select>
                </div>

                {/* City and Area Dropdowns */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city" className="text-sm font-medium">
                      City
                    </Label>
                    <select
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select city...</option>
                      <option value="Chandigarh">Chandigarh</option>
                      <option value="Mohali">Mohali</option>
                      <option value="Panchkula">Panchkula</option>
                      <option value="Zirakpur">Zirakpur</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="area" className="text-sm font-medium">
                      Area/Locality
                    </Label>
                    <select
                      id="area"
                      value={formData.area}
                      onChange={(e) => handleInputChange("area", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select area...</option>
                      <option value="Daria">Daria</option>
                      <option value="Bhaskar Colony">Bhaskar Colony</option>
                      <option value="Sector 22">Sector 22</option>
                      <option value="Sector 34">Sector 34</option>
                      <option value="Sector 56">Sector 56</option>
                      <option value="Industrial Area">Industrial Area</option>
                      <option value="Manimajra\">Manimajra</
