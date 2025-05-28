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

interface LoginFormProps {
  role: "admin" | "salesman"
}

export function LoginForm({ role }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const { loginUser } = useAuth()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Basic validation
    if (!email.trim()) {
      setError("Please enter your email address")
      setIsLoading(false)
      return
    }

    if (!password.trim()) {
      setError("Please enter your password")
      setIsLoading(false)
      return
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address")
      setIsLoading(false)
      return
    }

    // Simulate loading delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Attempt login
    const loginSuccess = loginUser(email.trim(), password, role)

    if (loginSuccess) {
      // Clear form and redirect
      setEmail("")
      setPassword("")
      router.push(`/${role}/dashboard`)
    } else {
      setError("Invalid email or password. Please check your credentials and try again.")
    }

    setIsLoading(false)
  }

  const roleConfig = {
    admin: {
      title: "Admin Login",
      description: "Access your administrator dashboard",
      icon: Shield,
      color: "indigo",
    },
    salesman: {
      title: "Salesman Login",
      description: "Access your sales dashboard",
      icon: Briefcase,
      color: "green",
    },
  }

  const config = roleConfig[role]
  const Icon = config.icon

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
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (error) setError("") // Clear error when user starts typing
                  }}
                  disabled={isLoading}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (error) setError("") // Clear error when user starts typing
                    }}
                    disabled={isLoading}
                    autoComplete="current-password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className={`w-full bg-${config.color}-600 hover:bg-${config.color}-700`}
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  href={`/${role}/signup`}
                  className={`text-${config.color}-600 hover:text-${config.color}-700 font-medium`}
                >
                  Register here
                </Link>
              </p>
            </div>

            {/* Security Notice */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 text-center">
                🔒 Your credentials are securely encrypted and protected
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
