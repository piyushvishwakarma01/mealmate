import type { Request, Response, NextFunction } from "express"
import * as jwt from "jsonwebtoken"
import { PrismaClient, type UserRole } from "@prisma/client"

const prisma = new PrismaClient()

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        role: UserRole
      }
    }
  }
}

// Verify JWT token
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized - No token provided" })
    }

    const token = authHeader.split(" ")[1]

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string
      role: UserRole
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    })

    if (!user) {
      return res.status(401).json({ message: "Unauthorized - User not found" })
    }

    // Attach user to request
    req.user = {
      id: decoded.userId,
      role: decoded.role,
    }

    next()
  } catch (error) {
    console.error("Auth middleware error:", error)
    return res.status(401).json({ message: "Unauthorized - Invalid token" })
  }
}

// Role-based authorization middleware
export const authorize = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized - No user found" })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden - Insufficient permissions" })
    }

    next()
  }
}
