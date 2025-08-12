"use client"

import ProtectedRoute from "@/components/auth/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"

export default function DashboardPage() {
    return (
        <ProtectedRoute>
            <div className="container py-8">
                <div className="flex flex-col items-center justify-center space-y-6">
                    <h1 className="text-3xl font-bold text-center">Dashboard</h1>
                    <DashboardContent />
                </div>
            </div>
        </ProtectedRoute>
    )
}

function DashboardContent() {
    const { user, logout } = useAuth()

    return (
        <div className="flex flex-col items-center space-y-6 p-6 bg-card rounded-lg shadow-lg max-w-md w-full">
            <div className="flex items-center space-x-2 text-lg">
                <User className="h-5 w-5" />
                <span className="font-medium">Welcome, {user?.userName}!</span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>Role: <span className="capitalize font-medium">{user?.role}</span></span>
            </div>

            <Button
                onClick={logout}
                variant="destructive"
                size="lg"
                className="w-full"
            >
                <LogOut className="h-4 w-4" />
                Logout
            </Button>
        </div>
    )
}