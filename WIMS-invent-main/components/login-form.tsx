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
import { AlertTriangle, CheckCircle, User, Mail, KeyRound } from "lucide-react"

interface LoginFormProps {
  role: "admin" | "salesman"
}

export function LoginForm({ role }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAutoLoggingIn, setIsAutoLoggingIn] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const { login, loginByName, users, autoLoginLastUser, user } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    setSuccess("")

    try {
      let success = false

      if (role === "admin") {
        // Admin still uses email/password
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
        if (role === "salesman" && user && user.isApproved === false) {
          setSuccess("")
          setError("Your account is pending admin approval. Please wait for approval before accessing the dashboard.")
          return
        }
        setSuccess("Welcome back! Redirecting...")
        setTimeout(() => {
          if (user?.role === "admin") {
            router.push("/admin/dashboard")
          } else if (user?.role === "salesman") {
            router.push("/salesman/dashboard")
          }
        }, 1000)
      } else {
        if (role === "admin") {
          setError("Invalid email or password. Please check your credentials.")
        } else {
          const salesmen = users.filter((u) => u.role === "salesman")
          if (salesmen.length === 0) {
            setError("No salesman accounts found. Please register first.")
          } else {
            setError(`Salesman \"${name}\" not found. Available names: ${salesmen.map((s) => s.name).join(", ")}`)
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
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          {role === "admin" ? (
            <>
              <KeyRound className="h-5 w-5 text-primary" />
              Admin Login
            </>
          ) : (
            <>
              <User className="h-5 w-5 text-primary" />
              Salesman Login
            </>
          )}
        </CardTitle>
        <CardDescription>
          {role === "admin"
            ? "Enter your credentials to access the admin dashboard"
            : "Enter your name to access the salesman dashboard"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 text-green-800 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {role === "admin" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-muted-foreground" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
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

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Login"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center border-t p-4">
        <p className="text-sm text-muted-foreground">
          {role === "admin" ? (
            <>
              Don&apos;t have an account?{" "}
              <a href={`/${role}/signup`} className="text-primary hover:underline">
                Sign up
              </a>
            </>
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
  )
}
