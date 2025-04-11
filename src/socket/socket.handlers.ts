import type { Server, Socket } from "socket.io"
import { PrismaClient } from "@prisma/client"
import * as jwt from "jsonwebtoken"

const prisma = new PrismaClient()

// Socket authentication middleware
const authenticateSocket = (socket: Socket, next: (err?: Error) => void) => {
  const token = socket.handshake.auth.token

  if (!token) {
    return next(new Error("Authentication error"))
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string
      role: string
    }

    socket.data.user = {
      id: decoded.userId,
      role: decoded.role,
    }

    next()
  } catch (error) {
    next(new Error("Authentication error"))
  }
}

// Setup socket handlers
export const setupSocketHandlers = (io: Server) => {
  // Apply authentication middleware
  io.use(authenticateSocket)

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.data.user.id}`)

    // Join user's room for private messages
    socket.join(`user:${socket.data.user.id}`)

    // Handle private messages
    socket.on("send_message", async (data) => {
      try {
        const { recipientId, content, donationId } = data

        // Save message to database
        const message = await prisma.message.create({
          data: {
            senderId: socket.data.user.id,
            recipientId,
            content,
            donationId,
          },
        })

        // Emit message to recipient
        io.to(`user:${recipientId}`).emit("receive_message", {
          id: message.id,
          senderId: message.senderId,
          content: message.content,
          donationId: message.donationId,
          createdAt: message.createdAt,
        })

        // Create notification for recipient
        await prisma.notification.create({
          data: {
            userId: recipientId,
            title: "New Message",
            message: "You have received a new message",
            relatedEntityType: "message",
            relatedEntityId: message.id,
          },
        })

        // Emit notification to recipient
        io.to(`user:${recipientId}`).emit("notification", {
          type: "message",
          message: "You have received a new message",
        })
      } catch (error) {
        console.error("Socket message error:", error)
      }
    })

    // Handle donation status updates
    socket.on("donation_status_update", async (data) => {
      try {
        const { donationId, status } = data

        // Get donation
        const donation = await prisma.foodDonation.findUnique({
          where: { id: donationId },
          include: {
            donor: true,
            ngo: true,
          },
        })

        if (!donation) {
          return
        }

        // Emit status update to relevant users
        if (donation.donorId) {
          io.to(`user:${donation.donorId}`).emit("donation_update", {
            donationId,
            status,
          })
        }

        if (donation.ngoId) {
          io.to(`user:${donation.ngoId}`).emit("donation_update", {
            donationId,
            status,
          })
        }
      } catch (error) {
        console.error("Socket donation update error:", error)
      }
    })

    // Handle volunteer location updates
    socket.on("update_volunteer_location", async (data) => {
      try {
        const { assignmentId, latitude, longitude } = data

        // Only volunteers can update their location
        if (socket.data.user.role !== "VOLUNTEER") {
          return
        }

        // Get assignment
        const assignment = await prisma.volunteerAssignment.findUnique({
          where: { id: assignmentId },
          include: {
            donation: true,
          },
        })

        if (!assignment || assignment.volunteerId !== socket.data.user.id) {
          return
        }

        // Emit location update to donor and NGO
        if (assignment.donation.donorId) {
          io.to(`user:${assignment.donation.donorId}`).emit("volunteer_location", {
            assignmentId,
            latitude,
            longitude,
          })
        }

        if (assignment.donation.ngoId) {
          io.to(`user:${assignment.donation.ngoId}`).emit("volunteer_location", {
            assignmentId,
            latitude,
            longitude,
          })
        }
      } catch (error) {
        console.error("Socket location update error:", error)
      }
    })

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.data.user.id}`)
    })
  })
}
