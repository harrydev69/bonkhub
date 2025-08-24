"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate login - in real app, this would call an API
    setTimeout(() => {
      localStorage.setItem("bonkhub_user", JSON.stringify({ email, loggedIn: true }))
      router.push("/dashboard")
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      {/* Glowing border container */}
      <div className="absolute inset-0 border border-gray-700/50 rounded-lg shadow-[0_0_20px_rgba(255,107,53,0.3)] bg-gradient-to-br from-gray-900/20 to-black/40"></div>

      <div className="relative p-8 flex items-center justify-center min-h-[600px]">
        <div className="w-full max-w-md px-4 relative">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 transition-all duration-300 hover:text-shadow-lg hover:scale-105">
              <span className="text-[#ff6b35] drop-shadow-[0_0_10px_rgba(255,107,53,0.5)]">Bonk</span>hub
            </h1>
            <p className="text-gray-400">Sign in to your analytics dashboard</p>
          </div>

          <Card className="bg-gray-900 border-gray-800 transition-all duration-300 hover:border-[#ff6b35]/50 hover:shadow-[0_0_20px_rgba(255,107,53,0.3)] hover:scale-[1.02]">
            <CardHeader>
              <CardTitle className="text-white">Welcome Back</CardTitle>
              <CardDescription className="text-gray-400">Enter your credentials to access your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 transition-all duration-300 focus:border-[#ff6b35] focus:shadow-[0_0_10px_rgba(255,107,53,0.3)] focus:ring-[#ff6b35]/50"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 pr-10 transition-all duration-300 focus:border-[#ff6b35] focus:shadow-[0_0_10px_rgba(255,107,53,0.3)] focus:ring-[#ff6b35]/50"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#ff6b35] transition-colors duration-200"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#ff6b35] hover:bg-[#e55a2b] text-white transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,107,53,0.5)] hover:scale-105 active:scale-95"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-400">
                  Don't have an account?{" "}
                  <Link
                    href="/signup"
                    className="text-[#ff6b35] hover:text-[#e55a2b] transition-all duration-200 hover:drop-shadow-[0_0_5px_rgba(255,107,53,0.7)]"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
