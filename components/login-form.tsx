"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, CheckCircle, User, Mail, KeyRound, Shield, Lock } from "lucide-react"

interface LoginFormProps {
  role: "admin" | "salesman"
}

export function LoginForm({ role }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAutoLoggingIn, setIsAutoLoggingIn] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const { login, loginByName, users, autoLoginLastUser } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Try to auto-login when component mounts
    const attemptAutoLogin = async () => {
      setIsAutoLoggingIn(true)
      const success = await autoLoginLastUser()
      if (success) {
        setSuccess("Welcome back! Redirecting...")
        setTimeout(() => {
          if (role === "admin") {
            router.push("/admin/dashboard")
          } else {
            router.push("/salesman/dashboard")
          }
        }, 1000)
      } else {
        // Auto-fill name if there's only one salesman
        if (role === "salesman") {
          const salesmen = users.filter((u) => u.role === "salesman")
          if (salesmen.length === 1) {
            setName(salesmen[0].name)
          }
        }
      }
      setIsAutoLoggingIn(false)
    }

    attemptAutoLogin()
  }, [role, users, autoLoginLastUser, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    setSuccess("")

    try {
      let success = false

      if (role === "admin") {
        // Admin uses secure email/password
        success = await login(email, password, role)
      } else {
        // Salesman uses name-only login
        if (!name.trim()) {
          setError("Please enter your name")
          setIsSubmitting(false)
          return
        }
        success = await loginByName(name.trim())
      }

      if (success) {
        setSuccess("Welcome back! Redirecting...")
        // Redirect to the appropriate dashboard
        setTimeout(() => {
          if (role === "admin") {
            router.push("/admin/dashboard")
          } else {
            router.push("/salesman/dashboard")
          }
        }, 1000)
      } else {
        if (role === "admin") {
          setError("Access Denied! Only authorized admin credentials are accepted.")
        } else {
          const salesmen = users.filter((u) => u.role === "salesman")
          if (salesmen.length === 0) {
            setError("No salesman accounts found. Please register first.")
          } else {
            setError(`Salesman "${name}" not found. Available names: ${salesmen.map((s) => s.name).join(", ")}`)
          }
        }
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("An error occurred during login")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isAutoLoggingIn) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-center text-muted-foreground">Checking for existing session...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-4">
      <Card
        className={`w-full max-w-md mx-auto shadow-2xl border-0 ${role === "admin" ? "bg-gradient-to-br from-red-50 to-orange-50" : "bg-white/80"} backdrop-blur-sm`}
      >
        <CardHeader className="text-center pb-6">
          <div
            className={`mx-auto w-16 h-16 ${role === "admin" ? "bg-gradient-to-r from-red-500 to-orange-600" : "bg-gradient-to-r from-blue-500 to-indigo-600"} rounded-full flex items-center justify-center mb-4 shadow-lg`}
          >
            {role === "admin" ? <Shield className="h-8 w-8 text-white" /> : <User className="h-8 w-8 text-white" />}
          </div>
          <CardTitle
            className={`text-3xl font-bold ${role === "admin" ? "bg-gradient-to-r from-red-600 to-orange-600" : "bg-gradient-to-r from-blue-600 to-indigo-600"} bg-clip-text text-transparent flex items-center justify-center gap-2`}
          >
            {role === "admin" ? (
              <>
                <Lock className="h-6 w-6 text-red-600" />
                Secure Admin Access
              </>
            ) : (
              <>
                <User className="h-5 w-5 text-blue-600" />
                Salesman Login
              </>
            )}
          </CardTitle>
          <CardDescription className="text-lg text-gray-600 mt-2">
            {role === "admin"
              ? "🔒 Authorized Personnel Only - Secure Login Required"
              : "Enter your name to access the salesman dashboard"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive" className="border-red-300 bg-red-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-red-800 font-medium">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-50 text-green-800 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 font-medium">{success}</AlertDescription>
              </Alert>
            )}

            {role === "admin" ? (
              <>
                {/* Secure Admin Login */}
                <Card className="border-2 border-red-200 bg-gradient-to-r from-red-50 to-orange-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                        <Mail className="h-4 w-4 text-white" />
                      </div>
                      <Label htmlFor="email" className="text-lg font-semibold text-red-800 flex items-center gap-2">
                        Admin Email
                        <Shield className="h-4 w-4 text-red-600" />
                      </Label>
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter authorized admin email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="border-red-300 focus:border-red-500 focus:ring-red-500 text-lg py-3"
                    />
                    <p className="text-sm text-red-600 mt-2 font-medium">🔐 Only authorized admin email accepted</p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-red-200 bg-gradient-to-r from-red-50 to-orange-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                        <KeyRound className="h-4 w-4 text-white" />
                      </div>
                      <Label htmlFor="password" className="text-lg font-semibold text-red-800 flex items-center gap-2">
                        Secure Password
                        <Lock className="h-4 w-4 text-red-600" />
                      </Label>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter secure admin password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="border-red-300 focus:border-red-500 focus:ring-red-500 text-lg py-3"
                    />
                    <p className="text-sm text-red-600 mt-2 font-medium">🛡️ High-security authentication required</p>
                  </CardContent>
                </Card>

                {/* Security Notice */}
                <Alert className="bg-yellow-50 border-yellow-200">
                  <Shield className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800 font-medium">
                    <strong>Security Notice:</strong> This is a secure admin portal. Only pre-authorized credentials are
                    accepted. Unauthorized access attempts are logged.
                  </AlertDescription>
                </Alert>
              </>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Salesman Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <Button
              type="submit"
              className={`w-full py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 ${
                role === "admin"
                  ? "bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700"
                  : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {role === "admin" ? "Authenticating..." : "Logging in..."}
                </div>
              ) : (
                <>
                  {role === "admin" ? (
                    <>
                      <Shield className="h-5 w-5 mr-2" />
                      Secure Admin Login
                    </>
                  ) : (
                    "Login"
                  )}
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t bg-gray-50/50 p-4">
          <p className="text-sm text-muted-foreground">
            {role === "admin" ? (
              <span className="text-red-600 font-medium">🔒 Secure Admin Portal - Authorized Access Only</span>
            ) : (
              <>
                First time here?{" "}
                <a href={`/${role}/signup`} className="text-primary hover:underline">
                  Register as Salesman
                </a>
              </>
            )}
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
