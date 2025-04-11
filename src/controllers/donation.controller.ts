import type { Request, Response } from "express"
import { PrismaClient, DonationStatus } from "@prisma/client"
import { z } from "zod"

const prisma = new PrismaClient()

// Validation schemas
const createDonationSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  quantityTotal: z.number().positive(),
  quantityUnit: z.string(),
  expiryTime: z.string().transform((str) => new Date(str)),
  pickupLocation: z.string(),
  pickupNotes: z.string().optional(),
  foodItems: z.array(
    z.object({
      name: z.string(),
      category: z.string(),
      quantity: z.number().positive(),
      quantityUnit: z.string(),
      dietaryInfo: z.array(z.string()).optional(),
      allergens: z.array(z.string()).optional(),
    }),
  ),
})

// Get all donations
export const getAllDonations = async (req: Request, res: Response) => {
  try {
    const { status, donorId, ngoId } = req.query

    // Build filter based on query parameters
    const filter: any = {}

    if (status) {
      filter.status = status as DonationStatus
    }

    if (donorId) {
      filter.donorId = donorId as string
    }

    if (ngoId) {
      filter.ngoId = ngoId as string
    }

    const donations = await prisma.foodDonation.findMany({
      where: filter,
      include: {
        donor: {
          select: {
            id: true,
            fullName: true,
            email: true,
            donor: true,
          },
        },
        ngo: {
          select: {
            id: true,
            fullName: true,
            email: true,
            ngo: true,
          },
        },
        foodItems: true,
        images: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return res.status(200).json(donations)
  } catch (error) {
    console.error("Get all donations error:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}

// Get donation by ID
export const getDonationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const donation = await prisma.foodDonation.findUnique({
      where: { id },
      include: {
        donor: {
          select: {
            id: true,
            fullName: true,
            email: true,
            donor: true,
          },
        },
        ngo: {
          select: {
            id: true,
            fullName: true,
            email: true,
            ngo: true,
          },
        },
        foodItems: true,
        images: true,
        pickupSchedules: true,
        feedbacks: {
          include: {
            donor: {
              select: {
                id: true,
                fullName: true,
              },
            },
            ngo: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
        volunteerAssignments: {
          include: {
            volunteer: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
    })

    if (!donation) {
      return res.status(404).json({ message: "Donation not found" })
    }

    return res.status(200).json(donation)
  } catch (error) {
    console.error("Get donation by ID error:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}

// Create donation
export const createDonation = async (req: Request, res: Response) => {
  try {
    // Ensure user is authenticated and is a donor
    if (!req.user || req.user.role !== "DONOR") {
      return res.status(403).json({ message: "Only donors can create donations" })
    }

    // Validate request body
    const validatedData = createDonationSchema.parse(req.body)

    // Create donation with food items
    const donation = await prisma.foodDonation.create({
      data: {
        donorId: req.user.id,
        title: validatedData.title,
        description: validatedData.description,
        quantityTotal: validatedData.quantityTotal,
        quantityUnit: validatedData.quantityUnit,
        expiryTime: validatedData.expiryTime,
        pickupLocation: validatedData.pickupLocation,
        pickupNotes: validatedData.pickupNotes,
        status: DonationStatus.PENDING,
        statusUpdatedAt: new Date(),
        foodItems: {
          create: validatedData.foodItems.map((item) => ({
            name: item.name,
            category: item.category,
            quantity: item.quantity,
            quantityUnit: item.quantityUnit,
            dietaryInfo: item.dietaryInfo || [],
            allergens: item.allergens || [],
          })),
        },
      },
      include: {
        foodItems: true,
      },
    })

    // Create notifications for all NGOs
    const ngos = await prisma.user.findMany({
      where: { role: "NGO" },
    })

    for (const ngo of ngos) {
      await prisma.notification.create({
        data: {
          userId: ngo.id,
          title: "New Donation Available",
          message: `A new donation "${donation.title}" is available for acceptance`,
          relatedEntityType: "donation",
          relatedEntityId: donation.id,
        },
      })
    }

    return res.status(201).json(donation)
  } catch (error) {
    console.error("Create donation error:", error)
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors })
    }
    return res.status(500).json({ message: "Internal server error" })
  }
}

// Update donation status
export const updateDonationStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status } = req.body

    // Validate status
    if (!Object.values(DonationStatus).includes(status as DonationStatus)) {
      return res.status(400).json({ message: "Invalid status" })
    }

    // Get current donation
    const currentDonation = await prisma.foodDonation.findUnique({
      where: { id },
    })

    if (!currentDonation) {
      return res.status(404).json({ message: "Donation not found" })
    }

    // Check permissions based on status change
    if (status === DonationStatus.ACCEPTED) {
      // Only NGOs can accept donations
      if (req.user?.role !== "NGO") {
        return res.status(403).json({ message: "Only NGOs can accept donations" })
      }

      // Check if donation is already accepted
      if (currentDonation.ngoId) {
        return res.status(400).json({ message: "Donation already accepted by another NGO" })
      }

      // Update donation with NGO ID and status
      const updatedDonation = await prisma.foodDonation.update({
        where: { id },
        data: {
          ngoId: req.user.id,
          status: DonationStatus.ACCEPTED,
          statusUpdatedAt: new Date(),
        },
      })

      // Create notification for donor
      await prisma.notification.create({
        data: {
          userId: currentDonation.donorId,
          title: "Donation Accepted",
          message: `Your donation "${currentDonation.title}" has been accepted`,
          relatedEntityType: "donation",
          relatedEntityId: id,
        },
      })

      return res.status(200).json(updatedDonation)
    } else if (status === DonationStatus.REJECTED) {
      // Only NGOs can reject donations
      if (req.user?.role !== "NGO") {
        return res.status(403).json({ message: "Only NGOs can reject donations" })
      }

      // Update donation status
      const updatedDonation = await prisma.foodDonation.update({
        where: { id },
        data: {
          status: DonationStatus.REJECTED,
          statusUpdatedAt: new Date(),
        },
      })

      return res.status(200).json(updatedDonation)
    } else if (status === DonationStatus.CANCELLED) {
      // Only donors can cancel their own donations
      if (req.user?.role !== "DONOR" || req.user.id !== currentDonation.donorId) {
        return res.status(403).json({ message: "Only the donor can cancel their donation" })
      }

      // Update donation status
      const updatedDonation = await prisma.foodDonation.update({
        where: { id },
        data: {
          status: DonationStatus.CANCELLED,
          statusUpdatedAt: new Date(),
        },
      })

      // If donation was accepted, notify NGO
      if (currentDonation.ngoId) {
        await prisma.notification.create({
          data: {
            userId: currentDonation.ngoId,
            title: "Donation Cancelled",
            message: `The donation "${currentDonation.title}" has been cancelled by the donor`,
            relatedEntityType: "donation",
            relatedEntityId: id,
          },
        })
      }

      return res.status(200).json(updatedDonation)
    } else {
      // For other status updates, check if user is authorized
      if (
        (req.user?.role === "DONOR" && req.user.id === currentDonation.donorId) ||
        (req.user?.role === "NGO" && req.user.id === currentDonation.ngoId) ||
        req.user?.role === "ADMIN"
      ) {
        // Update donation status
        const updatedDonation = await prisma.foodDonation.update({
          where: { id },
          data: {
            status: status as DonationStatus,
            statusUpdatedAt: new Date(),
          },
        })

        return res.status(200).json(updatedDonation)
      } else {
        return res.status(403).json({ message: "Unauthorized to update this donation" })
      }
    }
  } catch (error) {
    console.error("Update donation status error:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}
