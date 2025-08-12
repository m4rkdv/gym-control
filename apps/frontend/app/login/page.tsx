import { LoginForm } from "@/components/login/login-form";


export default function LoginPage() {
  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <div className="w-full max-w-md space-y-8 p-8 bg-card rounded-lg shadow-lg">
        <LoginForm 
          title="Welcome to GymControl" 
          signUpText="Create account" 
          signUpHref="/register" 
        />
      </div>
    </div>
  )
}