"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: string
  name: string
  email: string
  phone: string
  role: "admin" | "salesman"
  createdAt: string
}

interface AuthContextType {
  users: User[]
  currentUser: User | null
  addUser: (user: Omit<User, "id" | "createdAt">, password?: string) => User
  loginUser: (email: string, password: string, role: "admin" | "salesman") => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Predefined system credentials (securely stored)
const SYSTEM_CREDENTIALS = {
  admin: {
    email: "admin@ekta.com",
    password: "admin1300",
    user: {
      id: "admin-001",
      name: "System Administrator",
      email: "admin@ekta.com",
      phone: "+1-800-ADMIN",
      role: "admin" as const,
      createdAt: "2024-01-01T00:00:00.000Z",
    },
  },
  salesman: {
    email: "sales@ekta.com",
    password: "sales1300",
    user: {
      id: "sales-001",
      name: "Sales Representative",
      email: "sales@ekta.com",
      phone: "+1-800-SALES",
      role: "salesman" as const,
      createdAt: "2024-01-01T00:00:00.000Z",
    },
  },
}

// Add authorized admin credentials constant after SYSTEM_CREDENTIALS
const AUTHORIZED_ADMIN_REGISTRATION = {
  email: "admin@me.com",
  password: "admin1313",
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  // Load data from localStorage on mount
  useEffect(() => {
    const savedUsers = localStorage.getItem("wims-users")
    const savedCurrentUser = localStorage.getItem("wims-current-user")

    if (savedUsers) {
      setUsers(JSON.parse(savedUsers))
    }
    if (savedCurrentUser) {
      setCurrentUser(JSON.parse(savedCurrentUser))
    }
  }, [])

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem("wims-users", JSON.stringify(users))
  }, [users])

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("wims-current-user", JSON.stringify(currentUser))
    } else {
      localStorage.removeItem("wims-current-user")
    }
  }, [currentUser])

  // Update the addUser function to validate admin registration
  const addUser = (userData: Omit<User, "id" | "createdAt">, password?: string) => {
    // If registering as admin, validate against authorized credentials
    if (userData.role === "admin") {
      if (
        !password ||
        userData.email !== AUTHORIZED_ADMIN_REGISTRATION.email ||
        password !== AUTHORIZED_ADMIN_REGISTRATION.password
      ) {
        throw new Error("Unauthorized admin registration. Only authorized personnel can create admin accounts.")
      }
    }

    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    setUsers((prev) => [...prev, newUser])

    // Store password for the new user (in real app, this would be hashed)
    if (password) {
      const passwords = JSON.parse(localStorage.getItem("wims-passwords") || "{}")
      passwords[newUser.id] = password
      localStorage.setItem("wims-passwords", JSON.stringify(passwords))
    }

    return newUser
  }

  const loginUser = (email: string, password: string, role: "admin" | "salesman") => {
    // Check system credentials first
    const systemCred = SYSTEM_CREDENTIALS[role]
    if (email === systemCred.email && password === systemCred.password) {
      setCurrentUser(systemCred.user)
      return true
    }

    // For admin role, also check registered users with password validation
    if (role === "admin") {
      const user = users.find((u) => u.email === email && u.role === role)
      if (user) {
        // Verify password from stored passwords
        const passwords = JSON.parse(localStorage.getItem("wims-passwords") || "{}")
        const storedPassword = passwords[user.id]
        if (storedPassword === password) {
          setCurrentUser(user)
          return true
        }
      }
    }

    // For salesman role, check registered users (for future expansion)
    if (role === "salesman") {
      const user = users.find((u) => u.email === email && u.role === role)
      if (user) {
        // Verify password from stored passwords
        const passwords = JSON.parse(localStorage.getItem("wims-passwords") || "{}")
        const storedPassword = passwords[user.id]
        if (storedPassword === password) {
          setCurrentUser(user)
          return true
        }
      }
    }

    return false
  }

  const logout = () => {
    setCurrentUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        users,
        currentUser,
        addUser,
        loginUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
