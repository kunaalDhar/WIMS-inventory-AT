"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, ArrowLeft, Shield, Briefcase } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

interface SignupFormProps {
  role: "admin" | "salesman"
}

export function SignupForm({ role }: SignupFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const { addUser, users } = useAuth()
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
    setError("")
  }

  // Update the validateForm function to include admin-specific messaging
  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Name is required")
      return false
    }
    if (!formData.email.trim()) {
      setError("Email is required")
      return false
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email")
      return false
    }
    if (!formData.phone.trim()) {
      setError("Phone number is required")
      return false
    }
    if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      setError("Please enter a valid 10-digit phone number")
      return false
    }
    if (!formData.password) {
      setError("Password is required")
      return false
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return false
    }

    // Check if user already exists (for both admin and salesman)
    const existingUser = users.find((u) => u.email === formData.email && u.role === role)
    if (existingUser) {
      setError(`A ${role} with this email already exists`)
      return false
    }

    return true
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      // Create user account with password validation for admin
      const newUser = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role,
      }

      // Pass password for validation (especially important for admin role)
      const createdUser = addUser(newUser, formData.password)

      setSuccess("Account created successfully! Redirecting to login...")
      setTimeout(() => {
        router.push(`/${role}/login`)
      }, 2000)
    } catch (error) {
      // Handle unauthorized admin registration
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("Failed to create account. Please try again.")
      }
    }
  }

  const roleConfig = {
    admin: {
      title: "Admin Registration",
      description: "Create your administrator account",
      icon: Shield,
      color: "indigo",
    },
    salesman: {
      title: "Salesman Registration",
      description: "Create your sales account",
      icon: Briefcase,
      color: "green",
    },
  }

  // Add admin authorization notice in the form
  // Update the CardDescription for admin role
  const config = roleConfig[role]
  const Icon = config.icon

  // Add authorization notice for admin registration
  const getAdminNotice = () => {
    if (role === "admin") {
      return (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-800">Admin Registration Notice</span>
          </div>
          <p className="text-xs text-amber-700 mt-1">
            Admin registration requires authorized credentials. Only personnel with valid authorization can create admin
            accounts.
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Home
          </Link>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div
              className={`w-16 h-16 bg-${config.color}-100 rounded-full flex items-center justify-center mx-auto mb-4`}
            >
              <Icon className={`w-8 h-8 text-${config.color}-600`} />
            </div>
            <CardTitle className="text-2xl">{config.title}</CardTitle>
            <CardDescription>{config.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Add admin authorization notice for admin role */}
            {role === "admin" && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-800">Admin Registration Notice</span>
                </div>
                <p className="text-xs text-amber-700 mt-1">
                  Admin registration requires authorized credentials. Only personnel with valid authorization can create
                  admin accounts.
                </p>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

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

              <Button type="submit" className={`w-full bg-${config.color}-600 hover:bg-${config.color}-700`}>
                Create Account
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  href={`/${role}/login`}
                  className={`text-${config.color}-600 hover:text-${config.color}-700 font-medium`}
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
