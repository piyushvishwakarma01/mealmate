"use client"

import type React from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { DashboardNav } from "@/components/dashboard-nav"
import { UserNav } from "@/components/user-nav"
import { MobileNav } from "@/components/mobile-nav"
import { Notifications } from "@/components/notifications"
import { Button } from "@/components/ui/button"
import { Menu, Bell, Home } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Toaster } from "@/components/ui/toaster"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login?callbackUrl=/dashboard")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-muted">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] sm:w-[350px] pr-0">
                <MobileNav user={user} onNavItemClick={() => setShowMobileMenu(false)} />
              </SheetContent>
            </Sheet>
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-primary p-1.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
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
                <span className="hidden text-xl font-bold text-primary md:inline-block">MealMate</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="icon" className="hidden md:flex">
              <Link href="/">
                <Home className="h-5 w-5" />
                <span className="sr-only">Home</span>
              </Link>
            </Button>

            <Sheet open={showNotifications} onOpenChange={setShowNotifications}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                  <span className="sr-only">Notifications</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[320px] sm:w-[400px] pl-0">
                <Notifications user={user} onClose={() => setShowNotifications(false)} onCountChange={setUnreadCount} />
              </SheetContent>
            </Sheet>

            <UserNav user={user} />
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="hidden w-[280px] flex-col border-r bg-muted/40 md:flex">
          <DashboardNav user={user} />
        </aside>

        <main className="flex-1 overflow-hidden">
          <div className={cn("container py-6 md:py-8", user.role === "admin" && "max-w-7xl")}>{children}</div>
        </main>
      </div>

      <Toaster />
    </div>
  )
}
