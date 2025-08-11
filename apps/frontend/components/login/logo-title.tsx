import { cn } from "@/lib/utils"
import { GalleryVerticalEnd } from "lucide-react"
import Link from "next/link"

interface LogoTitleProps {
  className?: string
  title: string
  signUpText: string
  signUpHref: string
}

export function LogoTitle({ className, title, signUpText, signUpHref }: LogoTitleProps) {
  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <Link href="#" className="flex flex-col items-center gap-2 font-medium">
        <div className="flex size-8 items-center justify-center rounded-md">
          <GalleryVerticalEnd className="size-6" />
        </div>
        <span className="sr-only">GymControl</span>
      </Link>
      <h1 className="text-xl font-bold">{title}</h1>
      <div className="text-center text-sm">
        Don't have an account?{" "}
        <Link href={signUpHref} className="underline underline-offset-4">
          {signUpText}
        </Link>
      </div>
    </div>
  )
}