"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { LoginButton } from "./login-button"
import { EmailInput } from "./email-input"
import { LogoTitle } from "./logo-title"
import { PasswordInput } from "./password-input"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface LoginFormProps extends React.ComponentProps<"div"> {
  title?: string
  signUpText?: string
  signUpHref?: string
}

export function LoginForm({
  className,
  title = "Welcome to GymControl",
  signUpText = "Sign up",
  signUpHref = "#",
  ...props
}: LoginFormProps) {
  const router = useRouter()
  const { login, isLoading, error } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await login(email, password)
      router.push("/dashboard")
    } catch (err) {
      // Error is already handled by the auth context
      console.error("Login failed:", err)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          <LogoTitle title={title} signUpText={signUpText} signUpHref={signUpHref} />

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-6">
            <EmailInput
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            <LoginButton isLoading={isLoading} />
          </div>
        </div>
      </form>
    </div>
  )
}