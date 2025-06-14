"use client"

import type React from "react"
import { createContext, useState, useEffect, useContext } from "react"

interface User {
  id: string
  name: string
  email: string
  phone: string
  role: "admin" | "salesman"
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string, role: "admin" | "salesman") => Promise<boolean>
  loginByName: (name: string) => Promise<boolean>
  autoLoginLastUser: () => Promise<boolean> // Add this line
  logout: () => void
  isAuthenticated: boolean
  users: User[]
  addUser: (userData: Omit<User, "id">, password: string) => User
  getCurrentUser: () => User | null
}

const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const sessionData = localStorage.getItem("wims-session-v4")
      if (sessionData) {
        const parsedSession = JSON.parse(sessionData)
        // Check if session is still valid (7 days)
        const sessionAge = Date.now() - parsedSession.timestamp
        const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 days

        if (sessionAge < maxAge) {
          return parsedSession.user as User
        } else {
          // Session expired, clean up
          localStorage.removeItem("wims-session-v4")
        }
      }
      return null
    } catch (error) {
      console.error("Error loading session:", error)
      localStorage.removeItem("wims-session-v4")
      return null
    }
  })

  const [users, setUsers] = useState<User[]>(() => {
    try {
      const savedUsers = localStorage.getItem("wims-users-v4")
      if (savedUsers) {
        const parsedUsers = JSON.parse(savedUsers)
        return Array.isArray(parsedUsers) ? parsedUsers : []
      }
      return []
    } catch (error) {
      console.error("Error loading users:", error)
      localStorage.removeItem("wims-users-v4")
      return []
    }
  })

  useEffect(() => {
    // Persist user to localStorage on change
    if (user) {
      const sessionData = {
        user: user,
        timestamp: Date.now(),
      }
      try {
        localStorage.setItem("wims-session-v4", JSON.stringify(sessionData))
      } catch (error) {
        console.error("Error saving session:", error)
      }
    } else {
      localStorage.removeItem("wims-session-v4")
    }
  }, [user])

  useEffect(() => {
    // Persist users to localStorage on change
    if (users.length > 0) {
      try {
        localStorage.setItem("wims-users-v4", JSON.stringify(users))
      } catch (error) {
        console.error("Error saving users:", error)
      }
    }
  }, [users])

  const login = async (email: string, password: string, role: "admin" | "salesman"): Promise<boolean> => {
    try {
      // Check against stored users first
      const storedUser = users.find((u) => u.email === email && u.role === role)

      if (storedUser) {
        // In a real app, you'd verify the password hash
        // For demo purposes, we'll accept any password for stored users
        const userData: User = storedUser
        setUser(userData)

        const sessionData = {
          user: userData,
          timestamp: Date.now(),
        }

        try {
          localStorage.setItem("wims-session-v4", JSON.stringify(sessionData))
        } catch (error) {
          console.error("Error saving session:", error)
        }
        return true
      }

      // Fallback to default credentials for demo
      if (
        (role === "admin" && email === "admin@wims.com" && password === "admin123") ||
        (role === "salesman" && email === "salesman@wims.com" && password === "sales123")
      ) {
        const userData: User = {
          id: role === "admin" ? "admin-1" : "salesman-1",
          name: role === "admin" ? "Admin User" : "Sales User",
          email,
          phone: role === "admin" ? "+1234567890" : "+0987654321",
          role,
        }

        setUser(userData)

        const sessionData = {
          user: userData,
          timestamp: Date.now(),
        }

        try {
          localStorage.setItem("wims-session-v4", JSON.stringify(sessionData))
        } catch (error) {
          console.error("Error saving session:", error)
        }
        return true
      }

      // Invalid credentials
      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  // New function to login by name (for salesmen only)
  const loginByName = async (name: string): Promise<boolean> => {
    try {
      if (!name.trim()) {
        return false
      }

      // Check if a salesman with this name exists
      const storedUser = users.find((u) => u.name.toLowerCase() === name.toLowerCase() && u.role === "salesman")

      if (storedUser) {
        // Found the salesman, log them in
        setUser(storedUser)

        const sessionData = {
          user: storedUser,
          timestamp: Date.now(),
        }

        try {
          localStorage.setItem("wims-session-v4", JSON.stringify(sessionData))
        } catch (error) {
          console.error("Error saving session:", error)
        }
        return true
      }

      // Fallback to default salesman for demo
      if (name.toLowerCase() === "sales user") {
        const userData: User = {
          id: "salesman-1",
          name: "Sales User",
          email: "salesman@wims.com",
          phone: "+0987654321",
          role: "salesman",
        }

        setUser(userData)

        const sessionData = {
          user: userData,
          timestamp: Date.now(),
        }

        try {
          localStorage.setItem("wims-session-v4", JSON.stringify(sessionData))
        } catch (error) {
          console.error("Error saving session:", error)
        }
        return true
      }

      // Salesman not found
      return false
    } catch (error) {
      console.error("Login by name error:", error)
      return false
    }
  }

  const autoLoginLastUser = async (): Promise<boolean> => {
    try {
      // Check if there's a recent session (within last 30 days)
      const sessionData = localStorage.getItem("wims-session-v4")
      if (sessionData) {
        const parsedSession = JSON.parse(sessionData)
        const sessionAge = Date.now() - parsedSession.timestamp
        const maxAge = 30 * 24 * 60 * 60 * 1000 // 30 days

        if (sessionAge < maxAge && parsedSession.user) {
          // Verify the user still exists in our users list
          const existingUser = users.find((u) => u.id === parsedSession.user.id)
          if (existingUser) {
            setUser(existingUser)
            // Update session timestamp
            const updatedSession = {
              user: existingUser,
              timestamp: Date.now(),
            }
            localStorage.setItem("wims-session-v4", JSON.stringify(updatedSession))
            return true
          }
        }
      }

      // If no valid session, check if there's only one user and auto-login
      if (users.length === 1) {
        const singleUser = users[0]
        setUser(singleUser)
        const sessionData = {
          user: singleUser,
          timestamp: Date.now(),
        }
        localStorage.setItem("wims-session-v4", JSON.stringify(sessionData))
        return true
      }

      return false
    } catch (error) {
      console.error("Auto-login error:", error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    try {
      localStorage.removeItem("wims-session-v4")
    } catch (error) {
      console.error("Error during logout:", error)
    }
  }

  const addUser = (userData: Omit<User, "id">, password: string): User => {
    // For salesmen, only name is required
    if (userData.role === "salesman") {
      if (!userData.name.trim()) {
        throw new Error("Salesman name is required")
      }

      // Check if salesman with this name already exists
      const existingSalesman = users.find(
        (u) => u.role === "salesman" && u.name.toLowerCase() === userData.name.toLowerCase(),
      )

      if (existingSalesman) {
        throw new Error("A salesman with this name already exists")
      }

      // For salesmen, fill in default values for optional fields
      userData = {
        ...userData,
        email: userData.email || `${userData.name.toLowerCase().replace(/\s+/g, ".")}@wims.com`,
        phone: userData.phone || "",
      }
    } else {
      // For admin role, check if user already exists
      const existingUser = users.find((u) => u.email === userData.email && u.role === userData.role)
      if (existingUser) {
        throw new Error(`An ${userData.role} with this email already exists`)
      }

      // For admin role, require special authorization (you can customize this logic)
      if (userData.role === "admin") {
        // Simple check - in real app, this would be more sophisticated
        if (!password.includes("admin")) {
          throw new Error("Admin registration requires authorized credentials")
        }
      }
    }

    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
    }

    const updatedUsers = [...users, newUser]
    setUsers(updatedUsers)

    try {
      localStorage.setItem("wims-users-v4", JSON.stringify(updatedUsers))
    } catch (error) {
      console.error("Error saving users:", error)
    }

    // Automatically log in the new user
    setUser(newUser)
    const sessionData = {
      user: newUser,
      timestamp: Date.now(),
    }
    try {
      localStorage.setItem("wims-session-v4", JSON.stringify(sessionData))
    } catch (error) {
      console.error("Error saving session:", error)
    }

    // Auto-redirect after a short delay
    setTimeout(() => {
      if (typeof window !== "undefined") {
        if (newUser.role === "admin") {
          window.location.href = "/admin/dashboard"
        } else {
          window.location.href = "/salesman/dashboard"
        }
      }
    }, 500)

    return newUser
  }

  const getCurrentUser = () => {
    return user
  }

  const value = {
    user,
    login,
    loginByName,
    autoLoginLastUser, // Add this line
    logout,
    isAuthenticated: !!user,
    users,
    addUser,
    getCurrentUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
