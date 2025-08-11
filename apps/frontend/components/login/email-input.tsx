import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface EmailInputProps {
  className?: string
  label?: string
  placeholder?: string
  required?: boolean
}

export function EmailInput({
  className,
  label = "Email",
  placeholder = "m@example.com",
  required = true
}: EmailInputProps) {
  return (
    <div className={cn("grid gap-3", className)}>
      <Label htmlFor="email">{label}</Label>
      <Input
        id="email"
        type="email"
        placeholder={placeholder}
        required={required}
      />
    </div>
  )
}