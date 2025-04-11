"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@/lib/supabase"
import type { UserRole } from "@/lib/database.types"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { formatDistanceToNow } from "date-fns"
import { Bell, CheckCircle, X } from "lucide-react"

interface NotificationsProps {
  user: {
    id: string
    email: string
    role: UserRole
    full_name: string
  }
  onClose?: () => void
}

type Notification = {
  id: string
  title: string
  message: string
  is_read: boolean
  created_at: string
  related_entity_type: string | null
  related_entity_id: string | null
}

export function Notifications({ user, onClose }: NotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20)

        if (error) throw error
        setNotifications(data || [])
      } catch (error) {
        console.error("Error fetching notifications:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()

    // Set up real-time subscription
    const subscription = supabase
      .channel("notifications_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setNotifications((prev) => [payload.new as Notification, ...prev])
          } else if (payload.eventType === "UPDATE") {
            setNotifications((prev) =>
              prev.map((notification) =>
                notification.id === payload.new.id ? (payload.new as Notification) : notification,
              ),
            )
          } else if (payload.eventType === "DELETE") {
            setNotifications((prev) => prev.filter((notification) => notification.id !== payload.old.id))
          }
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, user.id])

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id)

      if (error) throw error

      // Update local state
      setNotifications((prev) =>
        prev.map((notification) => (notification.id === id ? { ...notification, is_read: true } : notification)),
      )
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false)

      if (error) throw error

      // Update local state
      setNotifications((prev) => prev.map((notification) => ({ ...notification, is_read: true })))
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Notifications</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={markAllAsRead} disabled={!notifications.some((n) => !n.is_read)}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          )}
        </div>
      </div>
      <Separator />

      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
          <Bell className="mb-2 h-10 w-10 text-muted-foreground/50" />
          <h3 className="text-lg font-medium">No notifications</h3>
          <p className="text-sm text-muted-foreground">You don't have any notifications at the moment.</p>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="divide-y">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 transition-colors ${!notification.is_read ? "bg-muted/50" : ""}`}
                onClick={() => !notification.is_read && markAsRead(notification.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className="font-medium">{notification.title}</h4>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {!notification.is_read && <div className="mt-1 h-2 w-2 rounded-full bg-primary"></div>}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
