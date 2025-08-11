import { cn } from "@/lib/utils"
import { LoginButton } from "./login-button"
import { EmailInput } from "./email-input"
import { LogoTitle } from "./logo-title"


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
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form>
        <div className="flex flex-col gap-6">
          <LogoTitle title={title} signUpText={signUpText} signUpHref={signUpHref} />
          <div className="flex flex-col gap-6">
            <EmailInput />
            <LoginButton />
          </div>
        </div>
      </form>
    </div>
  )
}
