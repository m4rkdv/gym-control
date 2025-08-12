"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { useState } from "react"

interface PasswordInputProps {
  className?: string
  label?: string
  placeholder?: string
  required?: boolean
  value?: string
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  disabled?: boolean
}

export function PasswordInput({
  className,
  label = "Password",
  placeholder = "Enter your password",
  required = true,
  value,
  onChange,
  disabled = false,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className={cn("grid gap-3 relative", disabled && "opacity-60", className)}>
      <Label htmlFor="password">{label}</Label>
      <div className="relative">
        <Input
          id="password"
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          required={required}
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
        <button 
          type="button"
          className={cn(
            "absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          onClick={() => setShowPassword(!showPassword)}
          disabled={disabled}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOffIcon className="h-4 w-4" />
          ) : (
            <EyeIcon className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  )
}