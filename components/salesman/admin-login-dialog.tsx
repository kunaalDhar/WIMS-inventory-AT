"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Shield } from "lucide-react"

interface AdminLoginDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdminLoginDialog({ open, onOpenChange }: AdminLoginDialogProps) {
  const { loginUser } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Basic validation
    if (!email.trim()) {
      setError("Please enter admin email address")
      setIsLoading(false)
      return
    }

    if (!password.trim()) {
      setError("Please enter admin password")
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

    // Simulate loading delay
    await new Promise((resolve) => setTimeout(resolve, 600))

    // Attempt admin login
    const loginSuccess = loginUser(email.trim(), password, "admin")

    if (loginSuccess) {
      handleClose()
      router.push("/admin/dashboard")
    } else {
      setError("Invalid admin credentials. Please check your email and password.")
    }

    setIsLoading(false)
  }

  const handleClose = () => {
    setEmail("")
    setPassword("")
    setError("")
    setShowPassword(false)
    setIsLoading(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            <span>Admin Access Required</span>
          </DialogTitle>
          <DialogDescription>Please enter your admin credentials to access the full Admin Dashboard</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="adminEmail">Admin Email</Label>
            <Input
              id="adminEmail"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (error) setError("") // Clear error when user starts typing
              }}
              placeholder="Enter admin email"
              disabled={isLoading}
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminPassword">Admin Password</Label>
            <div className="relative">
              <Input
                id="adminPassword"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (error) setError("") // Clear error when user starts typing
                }}
                placeholder="Enter admin password"
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

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700">
              {isLoading ? "Verifying..." : "Login as Admin"}
            </Button>
          </div>
        </form>

        {/* Security Notice */}
        <div className="mt-2 p-2 bg-indigo-50 rounded text-xs text-indigo-700 text-center">
          🔒 Secure admin authentication required
        </div>
      </DialogContent>
    </Dialog>
  )
}
