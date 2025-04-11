"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { signIn } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
  const verified = searchParams.get("verified") === "true"

  useEffect(() => {
    if (verified) {
      setIsSuccess(true)
    }
  }, [verified])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await signIn(email, password)
      setIsSuccess(true)

      // Small delay to show success state before redirecting
      setTimeout(() => {
        router.push(callbackUrl)
      }, 500)
    } catch (err: any) {
      setError(err.message || "Failed to sign in")
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted px-4 py-12">
      <div className="absolute inset-0 z-0 food-pattern-bg"></div>
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <Link href="/" className="mb-4">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-primary p-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white"
                >
                  <path d="M15 11h.01" />
                  <path d="M11 15h.01" />
                  <path d="M16 16h.01" />
                  <path d="m2 16 20 6-6-20A20 20 0 0 0 2 16" />
                  <path d="M5.71 17.11a17.04 17.04 0 0 1 11.4-11.4" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-primary">MealMate</span>
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-center font-heading">Welcome Back</h1>
          <p className="mt-2 text-center text-muted-foreground">
            Sign in to your account to continue your journey in reducing food waste
          </p>
        </div>

        <Card className="border-none shadow-lg overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent"></div>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
            <CardDescription className="text-center">Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="animate-fadeIn">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {isSuccess && (
                <Alert className="bg-accent/20 text-accent-foreground border-accent animate-fadeIn">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    {verified
                      ? "Your email has been verified. You can now sign in."
                      : "Sign in successful! Redirecting to your dashboard..."}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-background"
                  disabled={isLoading || isSuccess}
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-primary underline-offset-4 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-background"
                  disabled={isLoading || isSuccess}
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading || isSuccess} size="lg">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : isSuccess ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Success!
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col">
            <div className="text-sm text-muted-foreground mt-2 text-center">
              Don&apos;t have an account?{" "}
              <Link href="/auth/register" className="text-primary font-medium underline-offset-4 hover:underline">
                Create an account
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
