import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Loader2, LogIn } from "lucide-react"

interface LoginButtonProps {
  className?: string
  children?: React.ReactNode
  isLoading?: boolean
}

export function LoginButton({ 
  className, 
  children = "Login", 
  isLoading = false 
}: LoginButtonProps) {
  return (
    <Button 
      type="submit" 
      className={cn("w-full", className)} 
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Logging in...
        </>
      ) : (
        <>
          {children}
          <LogIn className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  )
}