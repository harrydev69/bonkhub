"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LogOut, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export function DashboardHeader() {
  const [userEmail, setUserEmail] = useState("")
  const router = useRouter()

  useEffect(() => {
    const user = localStorage.getItem("bonkhub_user")
    if (user) {
      const userData = JSON.parse(user)
      setUserEmail(userData.email)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("bonkhub_user")
    router.push("/login")
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">
          <span className="text-primary">BONKAI</span> Dashboard
        </h1>
        <p className="text-muted-foreground">Real-time analytics for BONK and LetsBonk.fun ecosystem</p>
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative w-64">
          <Input placeholder="Search tokens, wallets, transactions..." className="bg-input border-border" />
        </div>
        <Button variant="outline" size="sm">
          Take a Tour
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-orange-600 text-white">
                  {userEmail.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-gray-900 border-gray-800" align="end" forceMount>
            <DropdownMenuItem className="text-white hover:bg-gray-800">
              <User className="mr-2 h-4 w-4" />
              <span>{userEmail}</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-white hover:bg-gray-800 cursor-pointer" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
