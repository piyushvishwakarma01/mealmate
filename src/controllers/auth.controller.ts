import type { Request, Response } from "express"
import { PrismaClient, type UserRole } from "@prisma/client"
import * as bcrypt from "bcrypt"
import * as jwt from "jsonwebtoken"
import { z } from "zod"

const prisma = new PrismaClient()

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
  role: z.enum(["ADMIN", "NGO", "DONOR", "VOLUNTEER"]),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  // Role-specific fields
  businessName: z.string().optional(),
  businessType: z.string().optional(),
  organizationName: z.string().optional(),
  registrationNumber: z.string().optional(),
  vehicleType: z.string().optional(),
  serviceAreas: z.array(z.string()).optional(),
  maxDistance: z.number().optional(),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

// Generate JWT tokens
const generateTokens = (userId: string, role: UserRole) => {
  const accessToken = jwt.sign({ userId, role }, process.env.JWT_SECRET as string, { expiresIn: "15m" })

  const refreshToken = jwt.sign({ userId, role }, process.env.JWT_REFRESH_SECRET as string, { expiresIn: "7d" })

  return { accessToken, refreshToken }
}

// Register a new user
export const register = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = registerSchema.parse(req.body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    // Create user based on role
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        fullName: validatedData.fullName,
        role: validatedData.role as UserRole,
        phone: validatedData.phone,
        address: validatedData.address,
        city: validatedData.city,
        state: validatedData.state,
        zipCode: validatedData.zipCode,
      },
    })

    // Create role-specific profile
    if (validatedData.role === "DONOR" && validatedData.businessName && validatedData.businessType) {
      await prisma.donor.create({
        data: {
          id: user.id,
          businessName: validatedData.businessName,
          businessType: validatedData.businessType,
        },
      })
    } else if (validatedData.role === "NGO" && validatedData.organizationName && validatedData.registrationNumber) {
      await prisma.nGO.create({
        data: {
          id: user.id,
          organizationName: validatedData.organizationName,
          registrationNumber: validatedData.registrationNumber,
        },
      })
    } else if (validatedData.role === "VOLUNTEER") {
      await prisma.volunteer.create({
        data: {
          id: user.id,
          vehicleType: validatedData.vehicleType,
          serviceAreas: validatedData.serviceAreas || [],
          maxDistance: validatedData.maxDistance,
        },
      })
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.role)

    // Set refresh token as HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    // Return user data and access token
    return res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      accessToken,
    })
  } catch (error) {
    console.error("Registration error:", error)
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors })
    }
    return res.status(500).json({ message: "Internal server error" })
  }
}

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = loginSchema.parse(req.body)

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(validatedData.password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.role)

    // Set refresh token as HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    // Return user data and access token
    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      accessToken,
    })
  } catch (error) {
    console.error("Login error:", error)
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors })
    }
    return res.status(500).json({ message: "Internal server error" })
  }
}

// Refresh token
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token not found" })
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as {
      userId: string
      role: UserRole
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    })

    if (!user) {
      return res.status(401).json({ message: "User not found" })
    }

    // Generate new tokens
    const tokens = generateTokens(user.id, user.role)

    // Set new refresh token as HTTP-only cookie
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    // Return new access token
    return res.status(200).json({
      accessToken: tokens.accessToken,
    })
  } catch (error) {
    console.error("Token refresh error:", error)
    return res.status(401).json({ message: "Invalid refresh token" })
  }
}

// Logout
export const logout = (req: Request, res: Response) => {
  // Clear refresh token cookie
  res.clearCookie("refreshToken")
  return res.status(200).json({ message: "Logged out successfully" })
}
