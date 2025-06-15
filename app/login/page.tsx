"use client"

import { useState } from "react"
import { LoginForm } from "@/components/login-form"
import { Button } from "@/components/ui/button"

export default function UnifiedLoginPage() {
  const [role, setRole] = useState<"admin" | "salesman">("admin")

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Welcome to WIMS</h1>
        <p className="text-gray-600">Warehouse Inventory Management System</p>
      </div>
      <div className="flex space-x-4 mb-6">
        <Button
          variant={role === "admin" ? "default" : "outline"}
          onClick={() => setRole("admin")}
          className={role === "admin" ? "font-bold" : ""}
        >
          Admin Login
        </Button>
        <Button
          variant={role === "salesman" ? "default" : "outline"}
          onClick={() => setRole("salesman")}
          className={role === "salesman" ? "font-bold" : ""}
        >
          Salesman Login
        </Button>
      </div>
      <div className="w-full max-w-md">
        <LoginForm role={role} />
      </div>
    </div>
  )
} 