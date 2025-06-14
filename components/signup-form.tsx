"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, CheckCircle, UserCheck, User, Mail, Phone, Lock, Star } from "lucide-react"

interface SignupFormProps {
  role: "admin" | "salesman"
}

export function SignupForm({ role }: SignupFormProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [existingUser, setExistingUser] = useState<any>(null)
  const [showOverwriteOption, setShowOverwriteOption] = useState(false)
  const { addUser, users, login, loginByName } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    setSuccess("")
    setExistingUser(null)
    setShowOverwriteOption(false)

    try {
      // Validate inputs
      if (role === "admin") {
        if (!email || !password || !name) {
          setError("Name, email and password are required for admin accounts")
          setIsSubmitting(false)
          return
        }
      } else {
        // For salesman, only name is required
        if (!name.trim()) {
          setError("Name is required")
          setIsSubmitting(false)
          return
        }
      }

      if (role === "admin" && password !== confirmPassword) {
        setError("Passwords do not match")
        setIsSubmitting(false)
        return
      }

      // Check for existing users
      const existingUserByEmail = email ? users.find((u) => u.email === email && u.role === role) : null
      const existingUserByName = users.find((u) => u.name.toLowerCase() === name.toLowerCase() && u.role === role)

      if (existingUserByEmail || existingUserByName) {
        const foundUser = existingUserByEmail || existingUserByName
        setExistingUser(foundUser)
        setShowOverwriteOption(true)
        setError("")
        setIsSubmitting(false)
        return
      }

      // Create user and auto-login
      const newUser = addUser(
        {
          name: name.trim(),
          email: email.trim() || `${name.toLowerCase().replace(/\s+/g, ".")}@wims.com`,
          phone: phone.trim(),
          role,
        },
        password,
      )

      setSuccess(`${role === "admin" ? "Admin" : "Salesman"} account created successfully! Logging you in...`)

      // Auto-login the new user
      setTimeout(async () => {
        try {
          let loginSuccess = false

          if (role === "salesman") {
            loginSuccess = await loginByName(name.trim())
          } else {
            loginSuccess = await login(email.trim(), password, role)
          }

          if (loginSuccess) {
            // Redirect to appropriate dashboard
            if (role === "admin") {
              router.push("/admin/dashboard")
            } else {
              router.push("/salesman/dashboard")
            }
          } else {
            setError("Account created but auto-login failed. Please login manually.")
          }
        } catch (error) {
          console.error("Auto-login error:", error)
          setError("Account created but auto-login failed. Please login manually.")
        }
      }, 1000)
    } catch (error: any) {
      console.error("Signup error:", error)
      setError(error.message || "An error occurred during signup")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLoginExisting = async () => {
    if (!existingUser) return

    setIsSubmitting(true)
    try {
      let success = false

      if (role === "salesman") {
        // For salesman, login by name
        success = await loginByName(existingUser.name)
      } else {
        // For admin, try to login with provided password
        success = await login(existingUser.email, password, role)
      }

      if (success) {
        setSuccess("Welcome back! Logging you in...")
        setTimeout(() => {
          if (role === "admin") {
            router.push("/admin/dashboard")
          } else {
            router.push("/salesman/dashboard")
          }
        }, 1000)
      } else {
        if (role === "admin") {
          setError("Invalid password for existing account")
        } else {
          setError("Failed to login with existing account")
        }
      }
    } catch (error) {
      setError("Failed to login with existing account")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOverwriteAccount = async () => {
    setIsSubmitting(true)
    try {
      // Remove existing user from localStorage
      const updatedUsers = users.filter((u) => u.id !== existingUser.id)
      localStorage.setItem("wims-users-v4", JSON.stringify(updatedUsers))

      // Create new user
      const newUser = addUser(
        {
          name,
          email,
          phone,
          role,
        },
        password,
      )

      setSuccess(`${role === "admin" ? "Admin" : "Salesman"} account updated successfully! Logging you in...`)
      setShowOverwriteOption(false)
      setExistingUser(null)

      // Auto-login after overwrite
      setTimeout(async () => {
        try {
          let loginSuccess = false

          if (role === "salesman") {
            loginSuccess = await loginByName(name.trim())
          } else {
            loginSuccess = await login(email.trim(), password, role)
          }

          if (loginSuccess) {
            if (role === "admin") {
              router.push("/admin/dashboard")
            } else {
              router.push("/salesman/dashboard")
            }
          }
        } catch (error) {
          console.error("Auto-login after overwrite error:", error)
        }
      }, 1000)
    } catch (error: any) {
      console.error("Overwrite error:", error)
      setError(error.message || "An error occurred while updating account")
    } finally {
      setIsSubmitting(false)
    }
  }

  const clearData = () => {
    // Clear all stored data for fresh start
    localStorage.removeItem("wims-users-v4")
    localStorage.removeItem("wims-session-v4")
    setSuccess("All data cleared! You can now create a new account.")
    setShowOverwriteOption(false)
    setExistingUser(null)
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg mx-auto shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
            <User className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {role === "admin" ? "Admin Registration" : "Salesman Registration"}
          </CardTitle>
          <CardDescription className="text-lg text-gray-600 mt-2">
            {role === "admin"
              ? "Create an admin account to manage the system"
              : "Join our sales team - only your name is required!"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-50 text-green-800 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            {showOverwriteOption && existingUser && (
              <Alert className="bg-blue-50 text-blue-800 border-blue-200">
                <UserCheck className="h-4 w-4 text-blue-600" />
                <AlertDescription>
                  <div className="space-y-3">
                    <p>
                      A {role} account already exists with this {existingUser.email === email ? "email" : "name"}:
                    </p>
                    <div className="bg-white p-3 rounded-lg border border-blue-200">
                      <p className="font-medium">
                        <strong>Name:</strong> {existingUser.name}
                      </p>
                      <p className="font-medium">
                        <strong>Email:</strong> {existingUser.email}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleLoginExisting}
                        disabled={isSubmitting}
                        className="bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100"
                      >
                        Login to Existing Account
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleOverwriteAccount}
                        disabled={isSubmitting}
                        className="bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                      >
                        Update Existing Account
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={clearData}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Clear All Data & Start Fresh
                      </Button>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Name Field - Required */}
            <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <Label htmlFor="name" className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                    Full Name
                    <Star className="h-4 w-4 text-red-500 fill-current" />
                  </Label>
                </div>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="border-blue-300 focus:border-blue-500 focus:ring-blue-500 text-lg py-3"
                />
                <p className="text-sm text-blue-600 mt-2 font-medium">✓ Required field</p>
              </CardContent>
            </Card>

            {/* Email Field */}
            <Card
              className={`border-2 ${role === "admin" ? "border-orange-200 bg-gradient-to-r from-orange-50 to-red-50" : "border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50"}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-8 h-8 ${role === "admin" ? "bg-orange-500" : "bg-gray-400"} rounded-full flex items-center justify-center`}
                  >
                    <Mail className="h-4 w-4 text-white" />
                  </div>
                  <Label
                    htmlFor="email"
                    className={`text-lg font-semibold ${role === "admin" ? "text-orange-800" : "text-gray-700"} flex items-center gap-2`}
                  >
                    Email Address
                    {role === "admin" && <Star className="h-4 w-4 text-red-500 fill-current" />}
                  </Label>
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required={role === "admin"}
                  className={`${role === "admin" ? "border-orange-300 focus:border-orange-500 focus:ring-orange-500" : "border-gray-300 focus:border-gray-500 focus:ring-gray-500"} text-lg py-3`}
                />
                <p className={`text-sm mt-2 font-medium ${role === "admin" ? "text-orange-600" : "text-gray-500"}`}>
                  {role === "admin" ? "✓ Required for admin accounts" : "○ Optional - we'll create one if needed"}
                </p>
              </CardContent>
            </Card>

            {/* Phone Field */}
            <Card className="border-2 border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                    <Phone className="h-4 w-4 text-white" />
                  </div>
                  <Label htmlFor="phone" className="text-lg font-semibold text-gray-700">
                    Phone Number
                  </Label>
                </div>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="border-gray-300 focus:border-gray-500 focus:ring-gray-500 text-lg py-3"
                />
                <p className="text-sm text-gray-500 mt-2 font-medium">○ Optional - for contact purposes</p>
              </CardContent>
            </Card>

            {/* Password Fields - Only for Admin */}
            {role === "admin" && (
              <>
                <Card className="border-2 border-red-200 bg-gradient-to-r from-red-50 to-pink-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                        <Lock className="h-4 w-4 text-white" />
                      </div>
                      <Label htmlFor="password" className="text-lg font-semibold text-red-800 flex items-center gap-2">
                        Password
                        <Star className="h-4 w-4 text-red-500 fill-current" />
                      </Label>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a secure password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="border-red-300 focus:border-red-500 focus:ring-red-500 text-lg py-3"
                    />
                    <p className="text-sm text-red-600 mt-2 font-medium">✓ Required for security</p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-red-200 bg-gradient-to-r from-red-50 to-pink-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                        <Lock className="h-4 w-4 text-white" />
                      </div>
                      <Label
                        htmlFor="confirmPassword"
                        className="text-lg font-semibold text-red-800 flex items-center gap-2"
                      >
                        Confirm Password
                        <Star className="h-4 w-4 text-red-500 fill-current" />
                      </Label>
                    </div>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="border-red-300 focus:border-red-500 focus:ring-red-500 text-lg py-3"
                    />
                    <p className="text-sm text-red-600 mt-2 font-medium">✓ Must match your password</p>
                  </CardContent>
                </Card>
              </>
            )}

            {!showOverwriteOption && (
              <Button
                type="submit"
                className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating account...
                  </div>
                ) : (
                  `Create ${role === "admin" ? "Admin" : "Salesman"} Account`
                )}
              </Button>
            )}
          </form>
        </CardContent>

        <CardFooter className="flex justify-center border-t bg-gray-50/50 p-6">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <a
              href={`/${role}/login`}
              className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors"
            >
              Log in here
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

export default SignupForm
