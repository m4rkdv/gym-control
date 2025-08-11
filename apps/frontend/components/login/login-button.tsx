import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LogIn } from "lucide-react"

interface LoginButtonProps {
  className?: string
  children?: React.ReactNode
}

export function LoginButton({ className, children = "Login" }: LoginButtonProps) {
  return (
    <Button type="submit" className={cn("w-full", className)}>
      {children}
      <LogIn className="ml-2 h-4 w-4" />
    </Button>
  )
}