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
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName: email, password }),
      })

      const responseClone = response.clone();

      try {
        const data = await responseClone.json();

        if (!response.ok) {
          throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }

        login(data.user, data.token);

        router.push("/dashboard")
      } catch (jsonError) {
        const textError = await response.text();
        throw new Error(textError || `HTTP error! status: ${response.status}`);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during login")
    } finally {
      setIsLoading(false)
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
              <AlertDescription>{(() => {
                try {
                  return JSON.parse(error).error;
                } catch (e) {
                  return error;
                }
              })()}</AlertDescription>
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