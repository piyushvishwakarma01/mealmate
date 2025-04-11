"use client"

import Link from "next/link"
import type { UserRole } from "@/lib/database.types"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/lib/utils"
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ShoppingBag,
  Users,
  BarChart,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  Bike,
  Map,
  Calendar,
  Clock,
  User,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface DashboardNavProps {
  user: {
    id: string
    email: string
    role: UserRole
    full_name: string
    avatar_url: string | null
  }
}

export function DashboardNav({ user }: DashboardNavProps) {
  const { signOut } = useAuth()
  const pathname = usePathname()

  const donorLinks = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="mr-3 h-5 w-5" />,
    },
    {
      title: "My Donations",
      href: "/dashboard/donations",
      icon: <Package className="mr-3 h-5 w-5" />,
    },
    {
      title: "Create Donation",
      href: "/dashboard/create-donation",
      icon: <PlusCircle className="mr-3 h-5 w-5" />,
    },
    {
      title: "Assign Volunteers",
      href: "/dashboard/assign-volunteers",
      icon: <Bike className="mr-3 h-5 w-5" />,
    },
    {
      title: "Messages",
      href: "/dashboard/messages",
      icon: <MessageSquare className="mr-3 h-5 w-5" />,
    },
    {
      title: "Notifications",
      href: "/dashboard/notifications",
      icon: <Bell className="mr-3 h-5 w-5" />,
    },
    {
      title: "Profile",
      href: "/dashboard/profile",
      icon: <User className="mr-3 h-5 w-5" />,
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: <Settings className="mr-3 h-5 w-5" />,
    },
  ]

  const ngoLinks = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="mr-3 h-5 w-5" />,
    },
    {
      title: "Available Donations",
      href: "/dashboard/available-donations",
      icon: <ShoppingBag className="mr-3 h-5 w-5" />,
    },
    {
      title: "Accepted Donations",
      href: "/dashboard/accepted-donations",
      icon: <Package className="mr-3 h-5 w-5" />,
    },
    {
      title: "Assign Volunteers",
      href: "/dashboard/assign-volunteers",
      icon: <Bike className="mr-3 h-5 w-5" />,
    },
    {
      title: "Messages",
      href: "/dashboard/messages",
      icon: <MessageSquare className="mr-3 h-5 w-5" />,
    },
    {
      title: "Notifications",
      href: "/dashboard/notifications",
      icon: <Bell className="mr-3 h-5 w-5" />,
    },
    {
      title: "Profile",
      href: "/dashboard/profile",
      icon: <User className="mr-3 h-5 w-5" />,
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: <Settings className="mr-3 h-5 w-5" />,
    },
  ]

  const volunteerLinks = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="mr-3 h-5 w-5" />,
    },
    {
      title: "My Assignments",
      href: "/dashboard/assignments",
      icon: <Calendar className="mr-3 h-5 w-5" />,
    },
    {
      title: "Delivery Map",
      href: "/dashboard/delivery-map",
      icon: <Map className="mr-3 h-5 w-5" />,
    },
    {
      title: "Delivery History",
      href: "/dashboard/delivery-history",
      icon: <Clock className="mr-3 h-5 w-5" />,
    },
    {
      title: "Messages",
      href: "/dashboard/messages",
      icon: <MessageSquare className="mr-3 h-5 w-5" />,
    },
    {
      title: "Notifications",
      href: "/dashboard/notifications",
      icon: <Bell className="mr-3 h-5 w-5" />,
    },
    {
      title: "Profile",
      href: "/dashboard/profile",
      icon: <User className="mr-3 h-5 w-5" />,
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: <Settings className="mr-3 h-5 w-5" />,
    },
  ]

  const adminLinks = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="mr-3 h-5 w-5" />,
    },
    {
      title: "Users",
      href: "/dashboard/users",
      icon: <Users className="mr-3 h-5 w-5" />,
    },
    {
      title: "Donations",
      href: "/dashboard/all-donations",
      icon: <Package className="mr-3 h-5 w-5" />,
    },
    {
      title: "Volunteers",
      href: "/dashboard/volunteers",
      icon: <Bike className="mr-3 h-5 w-5" />,
    },
    {
      title: "Reports",
      href: "/dashboard/reports",
      icon: <BarChart className="mr-3 h-5 w-5" />,
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: <Settings className="mr-3 h-5 w-5" />,
    },
  ]

  const links =
    user.role === "donor"
      ? donorLinks
      : user.role === "ngo"
        ? ngoLinks
        : user.role === "volunteer"
          ? volunteerLinks
          : adminLinks

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 p-6">
        <Avatar className="h-10 w-10 border-2 border-primary/10">
          <AvatarImage src={user.avatar_url || undefined} alt={user.full_name} />
          <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <p className="font-medium">{user.full_name}</p>
          <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
        </div>
      </div>
      <ScrollArea className="flex-1 px-4">
        <nav className="grid gap-1 py-2">
          {links.map((link, index) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)

            return (
              <Link key={index} href={link.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start font-normal",
                    isActive && "bg-secondary text-secondary-foreground",
                  )}
                >
                  {link.icon}
                  {link.title}
                </Button>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>
      <div className="p-6">
        <Button variant="outline" className="w-full justify-start" onClick={() => signOut()}>
          <LogOut className="mr-3 h-5 w-5" />
          Sign out
        </Button>
      </div>
    </div>
  )
}
