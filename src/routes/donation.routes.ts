import { Router } from "express"
import {
  getAllDonations,
  getDonationById,
  createDonation,
  updateDonationStatus,
} from "../controllers/donation.controller"
import { authMiddleware, authorize } from "../middleware/auth.middleware"

const router = Router()

// Apply auth middleware to all donation routes
router.use(authMiddleware)

// Donation routes
router.get("/", getAllDonations)
router.get("/:id", getDonationById)
router.post("/", authorize(["DONOR"]), createDonation)
router.patch("/:id/status", updateDonationStatus)

export default router
