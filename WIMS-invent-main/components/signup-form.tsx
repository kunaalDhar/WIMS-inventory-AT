"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, CheckCircle, UserCheck, User, Mail, Phone, Lock } from "lucide-react"

type UserRole = "admin" | "salesman"

interface SignupFormProps {
  role: UserRole
}

export function SignupForm({ role }: SignupFormProps) {
  const router = useRouter()
  const { addUser, users, login, loginByName } = useAuth()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  })
  const [state, setState] = useState({
    isSubmitting: false,
    error: "",
    success: "",
    existingUser: null as any,
    showOverwriteOption: false
  })

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }, [])

  const validateForm = useCallback(() => {
    if (role === "admin") {
      if (!formData.name || !formData.email || !formData.password) {
        return "Name, email and password are required for admin accounts"
      }
      if (formData.password !== formData.confirmPassword) {
        return "Passwords do not match"
      }
    } else {
      if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
        return "Name, email, and phone are required for salesman registration"
      }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email.trim())) {
        return "Please enter a valid email address"
      }
    }
    return ""
  }, [formData, role])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationError = validateForm()
    if (validationError) {
      setState(prev => ({ ...prev, error: validationError }))
      return
    }

    setState(prev => ({
      ...prev,
      isSubmitting: true,
      error: "",
      success: "",
      existingUser: null,
      showOverwriteOption: false
    }))

    try {
      // Check for existing users
      const existingUserByEmail = formData.email 
        ? users.find((u) => u.email === formData.email && u.role === role) 
        : null
      const existingUserByName = users.find(
        (u) => u.name.toLowerCase() === formData.name.toLowerCase() && u.role === role
      )

      if (existingUserByEmail || existingUserByName) {
        const foundUser = existingUserByEmail || existingUserByName
        setState(prev => ({
          ...prev,
          existingUser: foundUser,
          showOverwriteOption: true,
          isSubmitting: false
        }))
        return
      }

      // Create new user
      const newUser = addUser(
        {
          name: formData.name.trim(),
          email: formData.email.trim() || `${formData.name.toLowerCase().replace(/\s+/g, ".")}@wims.com`,
          phone: formData.phone.trim(),
          role,
          ...(role === "salesman" ? { isApproved: false } : {}),
        },
        formData.password,
      )

      if (role === "admin") {
        setState(prev => ({
          ...prev,
          success: "Admin account created successfully! Logging you in..."
        }))
        
        setTimeout(async () => {
          try {
            const loginSuccess = await login(formData.email.trim(), formData.password, role)
            if (loginSuccess) {
              router.push("/admin/dashboard")
            } else {
              setState(prev => ({
                ...prev,
                error: "Account created but auto-login failed. Please login manually."
              }))
            }
          } catch (error) {
            console.error("Auto-login error:", error)
            setState(prev => ({
              ...prev,
              error: "Account created but auto-login failed. Please login manually."
            }))
          }
        }, 1000)
      } else {
        setState(prev => ({
          ...prev,
          success: "Account created! Pending admin approval. Please wait for approval before logging in."
        }))
      }
    } catch (error: any) {
      console.error("Signup error:", error)
      setState(prev => ({
        ...prev,
        error: error.message || "An error occurred during signup"
      }))
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }))
    }
  }

  const handleLoginExisting = async () => {
    if (!state.existingUser) return

    setState(prev => ({ ...prev, isSubmitting: true }))
    
    try {
      let success = false

      if (role === "salesman") {
        success = await loginByName(state.existingUser.name)
      } else {
        success = await login(state.existingUser.email, formData.password, role)
      }

      if (success) {
        setState(prev => ({
          ...prev,
          success: "Welcome back! Logging you in..."
        }))
        
        setTimeout(() => {
          router.push(`/${role}/dashboard`)
        }, 1000)
      } else {
        setState(prev => ({
          ...prev,
          error: role === "admin" 
            ? "Invalid password for existing account" 
            : "Failed to login with existing account"
        }))
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: "Failed to login with existing account"
      }))
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }))
    }
  }

  const handleOverwriteAccount = async () => {
    setState(prev => ({ ...prev, isSubmitting: true }))
    
    try {
      // Remove existing user from localStorage
      const updatedUsers = users.filter((u) => u.id !== state.existingUser.id)
      localStorage.setItem("wims-users-v4", JSON.stringify(updatedUsers))

      // Create new user
      addUser(
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role,
          ...(role === "salesman" ? { isApproved: false } : {}),
        },
        formData.password,
      )

      setState(prev => ({
        ...prev,
        success: `${role === "admin" ? "Admin" : "Salesman"} account updated successfully! Logging you in...`,
        showOverwriteOption: false,
        existingUser: null
      }))

      // Auto-login after overwrite
      setTimeout(async () => {
        try {
          const loginSuccess = role === "salesman"
            ? await loginByName(formData.name.trim())
            : await login(formData.email.trim(), formData.password, role)

          if (loginSuccess) {
            router.push(`/${role}/dashboard`)
          }
        } catch (error) {
          console.error("Auto-login after overwrite error:", error)
        }
      }, 1000)
    } catch (error: any) {
      console.error("Overwrite error:", error)
      setState(prev => ({
        ...prev,
        error: error.message || "An error occurred while updating account"
      }))
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }))
    }
  }

  const clearData = () => {
    localStorage.removeItem("wims-users-v4")
    localStorage.removeItem("wims-session-v4")
    setState(prev => ({
      ...prev,
      success: "All data cleared! You can now create a new account.",
      showOverwriteOption: false,
      existingUser: null
    }))
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-lg rounded-xl overflow-hidden">
        <div className="bg-blue-600 p-6 text-white">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white/20 p-3 rounded-full">
              <User className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            {role === "admin" ? "Admin Registration" : "Sales Team Registration"}
          </CardTitle>
          <CardDescription className="text-blue-100 text-center mt-2">
            {role === "admin"
              ? "Create your administrator account"
              : "Join our sales team to get started"}
          </CardDescription>
        </div>

        <CardContent className="p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {state.error && (
              <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}

            {state.success && (
              <Alert className="bg-green-50 border-green-200 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{state.success}</AlertDescription>
              </Alert>
            )}

            {state.showOverwriteOption && state.existingUser && (
              <Alert className="bg-blue-50 border-blue-200 text-blue-800">
                <UserCheck className="h-4 w-4" />
                <AlertDescription className="space-y-3">
                  <p>
                    A {role} account already exists with this {state.existingUser.email === formData.email ? "email" : "name"}:
                  </p>
                  <div className="bg-white p-3 rounded-lg border border-blue-200">
                    <p className="font-medium">
                      <strong>Name:</strong> {state.existingUser.name}
                    </p>
                    <p className="font-medium">
                      <strong>Email:</strong> {state.existingUser.email}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleLoginExisting}
                      disabled={state.isSubmitting}
                      className="border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      Login to Existing Account
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleOverwriteAccount}
                      disabled={state.isSubmitting}
                      className="border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      Update Existing Account
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={clearData}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      Clear All Data & Start Fresh
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Full Name
                </Label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required={role === "admin"}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Phone Number
                </Label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={handleChange}
                    required={role === "salesman"}
                    className="pl-10"
                  />
                </div>
              </div>

              {role === "salesman" && (
                <>
                  <div>
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Password
                    </Label>
                    <div className="relative mt-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                      Confirm Password
                    </Label>
                    <div className="relative mt-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className="pl-10"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {!state.showOverwriteOption && (
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md shadow-sm"
                disabled={state.isSubmitting}
              >
                {state.isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating account...
                  </div>
                ) : (
                  `Create ${role === "admin" ? "Admin" : "Sales"} Account`
                )}
              </Button>
            )}
          </form>
        </CardContent>

        <CardFooter className="bg-gray-50 px-6 py-4 border-t">
          <p className="text-sm text-gray-600 text-center">
            Already have an account?{" "}
            <a
              href={`/${role}/login`}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

export default SignupForm