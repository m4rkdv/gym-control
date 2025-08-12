import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface EmailInputProps {
  className?: string
  label?: string
  placeholder?: string
  required?: boolean
  value?: string
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  disabled?: boolean
}

export function EmailInput({
  className,
  label = "Username",
  placeholder = "m@example.com",
  required = true,
  value,
  onChange,
  disabled = false,
}: EmailInputProps) {
  return (
    <div className={cn("grid gap-3", disabled && "opacity-60", className)}>
      <Label htmlFor="email">{label}</Label>
      <Input
        id="username"
        type="text"
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  )
}