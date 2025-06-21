"use client"

import type React from "react"
import { createContext, useState, useEffect, useContext } from "react"

interface User {
  id: string
  name: string
  email: string
  phone: string
  role: "admin" | "salesman"
  isApproved?: boolean // undefined means approved for backward compatibility
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string, role: "admin" | "salesman") => Promise<boolean>
  loginByName: (name: string) => Promise<boolean>
  autoLoginLastUser: () => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
  users: User[]
  setUsers: React.Dispatch<React.SetStateAction<User[]>>
  addUser: (userData: Omit<User, "id">, password: string) => User
  getCurrentUser: () => User | null
}

const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: React.ReactNode
}

// Helper functions for cookie management
const setCookie = (name: string, value: string, days: number) => {
  const date = new Date()
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`
}

const getCookie = (name: string) => {
  const nameEQ = name + "="
  const ca = document.cookie.split(";")
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === " ") c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
  }
  return null
}

const deleteCookie = (name: string) => {
  document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/"
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])

  // Load user from cookies and localStorage on client only
  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const sessionData = getCookie("wims-session-v4")
      if (sessionData) {
        const parsedSession = JSON.parse(sessionData)
        // Check if session is still valid (7 days)
        const sessionAge = Date.now() - parsedSession.timestamp
        const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 days
        if (sessionAge < maxAge) {
          setUser(parsedSession.user as User)
        } else {
          deleteCookie("wims-session-v4")
          localStorage.removeItem("wims-session-v4")
        }
      }
    } catch (error) {
      console.error("Error loading session:", error)
      deleteCookie("wims-session-v4")
      localStorage.removeItem("wims-session-v4")
    }
  }, [])

  // Load users from localStorage on client only
  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const savedUsers = localStorage.getItem("wims-users-v4")
      if (savedUsers) {
        let parsedUsers = JSON.parse(savedUsers)
        // Backward compatibility: treat users without isApproved as approved
        parsedUsers = Array.isArray(parsedUsers)
          ? parsedUsers.map((u) => ({ ...u, isApproved: u.isApproved === undefined ? true : u.isApproved }))
          : []
        setUsers(parsedUsers)
      }
    } catch (error) {
      console.error("Error loading users:", error)
      localStorage.removeItem("wims-users-v4")
      setUsers([])
    }
  }, [])

  useEffect(() => {
    // Persist user to cookies and localStorage on change
    if (user) {
      const sessionData = {
        user: user,
        timestamp: Date.now(),
      }
      try {
        setCookie("wims-session-v4", JSON.stringify(sessionData), 7) // 7 days
        localStorage.setItem("wims-session-v4", JSON.stringify(sessionData))
      } catch (error) {
        console.error("Error saving session:", error)
      }
    } else {
      deleteCookie("wims-session-v4")
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
        const userData: User = storedUser
        setUser(userData)

        const sessionData = {
          user: userData,
          timestamp: Date.now(),
        }

        try {
          setCookie("wims-session-v4", JSON.stringify(sessionData), 7) // 7 days
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
          isApproved: role === "admin" ? true : false,
        }

        setUser(userData)

        const sessionData = {
          user: userData,
          timestamp: Date.now(),
        }

        try {
          setCookie("wims-session-v4", JSON.stringify(sessionData), 7) // 7 days
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

  const loginByName = async (name: string): Promise<boolean> => {
    try {
      if (!name.trim()) {
        return false
      }

      // Check if a salesman with this name exists
      const storedUser = users.find((u) => u.name.toLowerCase() === name.toLowerCase() && u.role === "salesman")

      if (storedUser) {
        setUser(storedUser)

        const sessionData = {
          user: storedUser,
          timestamp: Date.now(),
        }

        try {
          setCookie("wims-session-v4", JSON.stringify(sessionData), 7) // 7 days
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
          isApproved: false,
        }

        setUser(userData)

        const sessionData = {
          user: userData,
          timestamp: Date.now(),
        }

        try {
          setCookie("wims-session-v4", JSON.stringify(sessionData), 7) // 7 days
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
      const sessionData = getCookie("wims-session-v4")
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
            setCookie("wims-session-v4", JSON.stringify(updatedSession), 30) // 30 days
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
        setCookie("wims-session-v4", JSON.stringify(sessionData), 30) // 30 days
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
    deleteCookie("wims-session-v4")
    localStorage.removeItem("wims-session-v4")
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
        isApproved: false,
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
      userData = {
        ...userData,
        isApproved: true,
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

    // Auto-redirect only for admin users
    if (newUser.role === "admin") {
      setTimeout(() => {
        if (typeof window !== "undefined") {
          window.location.href = "/admin/dashboard"
        }
      }, 500)
    }

    return newUser
  }

  const getCurrentUser = () => {
    return user
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loginByName,
        autoLoginLastUser,
        logout,
        isAuthenticated: !!user,
        users,
        setUsers,
        addUser,
        getCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
