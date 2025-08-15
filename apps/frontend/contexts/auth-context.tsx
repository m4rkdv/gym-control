"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"

type User = {
  id: string
  userName: string
  role: string
  memberId?: string
  trainerId?: string
  isActive: boolean
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (userName: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    const storedUser = localStorage.getItem("user")
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      } catch (e) {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (userName: string, password: string) => {
    throw new Error("Not implemented")
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("token")
    localStorage.removeItem("user")
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}