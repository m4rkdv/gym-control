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
        const parsedUser = JSON.parse(storedUser)
        setToken(storedToken)
        setUser(parsedUser)
      } catch {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        setToken(null)
        setUser(null)
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (userName: string, password: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${baseURL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName, password }),
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(errorData || 'Login failed')
      }

      const { user: userData, token: userToken } = await response.json()
      
      setUser(userData)
      setToken(userToken)
      localStorage.setItem("token", userToken)
      localStorage.setItem("user", JSON.stringify(userData))
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
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