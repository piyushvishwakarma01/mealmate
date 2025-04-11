import { PrismaClient, UserRole } from "@prisma/client"
import * as bcrypt from "bcrypt"

const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.message.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.feedback.deleteMany()
  await prisma.donationImage.deleteMany()
  await prisma.volunteerAssignment.deleteMany()
  await prisma.pickupSchedule.deleteMany()
  await prisma.foodItem.deleteMany()
  await prisma.foodDonation.deleteMany()
  await prisma.volunteer.deleteMany()
  await prisma.ngo.deleteMany()
  await prisma.donor.deleteMany()
  await prisma.adminLog.deleteMany()
  await prisma.complaint.deleteMany()
  await prisma.report.deleteMany()
  await prisma.user.deleteMany()

  // Create users with hashed passwords
  const passwordHash = await bcrypt.hash("Password123!", 10)

  // Create Admin
  const admin = await prisma.user.create({
    data: {
      email: "admin@mealmate.com",
      password: passwordHash,
      fullName: "Admin User",
      role: UserRole.ADMIN,
      phone: "555-123-4567",
      address: "123 Admin St",
      city: "Admin City",
      state: "AS",
      zipCode: "12345",
    },
  })

  // Create Donor
  const donor = await prisma.user.create({
    data: {
      email: "donor@restaurant.com",
      password: passwordHash,
      fullName: "Restaurant Owner",
      role: UserRole.DONOR,
      phone: "555-234-5678",
      address: "456 Restaurant Ave",
      city: "Food City",
      state: "FC",
      zipCode: "23456",
      donor: {
        create: {
          businessName: "Delicious Eats Restaurant",
          businessType: "Restaurant",
          licenseNumber: "REST12345",
          operatingHours: {
            monday: "9:00-21:00",
            tuesday: "9:00-21:00",
            wednesday: "9:00-21:00",
            thursday: "9:00-21:00",
            friday: "9:00-22:00",
            saturday: "10:00-22:00",
            sunday: "10:00-20:00",
          },
          verified: true,
        },
      },
    },
  })

  // Create NGO
  const ngo = await prisma.user.create({
    data: {
      email: "ngo@foodbank.org",
      password: passwordHash,
      fullName: "Food Bank Manager",
      role: UserRole.NGO,
      phone: "555-345-6789",
      address: "789 Charity Blvd",
      city: "Helping City",
      state: "HC",
      zipCode: "34567",
      ngo: {
        create: {
          organizationName: "Community Food Bank",
          registrationNumber: "NGO78901",
          description: "Helping feed the community since 2010",
          website: "https://communityfoodbank.org",
          serviceAreas: ["Downtown", "Eastside", "Westside"],
          capacity: 500,
          verified: true,
        },
      },
    },
  })

  // Create Volunteer
  const volunteer = await prisma.user.create({
    data: {
      email: "volunteer@helper.com",
      password: passwordHash,
      fullName: "Helpful Volunteer",
      role: UserRole.VOLUNTEER,
      phone: "555-456-7890",
      address: "101 Helper Lane",
      city: "Volunteer City",
      state: "VC",
      zipCode: "45678",
      volunteer: {
        create: {
          vehicleType: "Car",
          serviceAreas: ["Downtown", "Northside"],
          maxDistance: 15.5,
          availability: {
            monday: ["morning", "evening"],
            wednesday: ["afternoon"],
            friday: ["morning", "afternoon", "evening"],
            saturday: ["morning", "afternoon"],
          },
          verified: true,
        },
      },
    },
  })

  // Create Food Donations
  const donation1 = await prisma.foodDonation.create({
    data: {
      donorId: donor.id,
      title: "Leftover Catering Food",
      description: "Assorted sandwiches, salads, and desserts from a canceled event",
      quantityTotal: 25,
      quantityUnit: "servings",
      expiryTime: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours from now
      pickupLocation: "456 Restaurant Ave, Food City, FC 23456",
      pickupNotes: "Please come to the back entrance",
      foodItems: {
        create: [
          {
            name: "Assorted Sandwiches",
            category: "prepared",
            quantity: 15,
            quantityUnit: "servings",
            dietaryInfo: ["contains_gluten", "contains_dairy"],
            allergens: ["wheat", "dairy"],
          },
          {
            name: "Garden Salad",
            category: "vegetables",
            quantity: 10,
            quantityUnit: "servings",
            dietaryInfo: ["vegan", "gluten_free"],
            allergens: [],
          },
          {
            name: "Chocolate Brownies",
            category: "bakery",
            quantity: 20,
            quantityUnit: "pieces",
            dietaryInfo: ["vegetarian"],
            allergens: ["wheat", "dairy", "eggs"],
          },
        ],
      },
    },
  })

  // Create a second donation that's already accepted by the NGO
  const donation2 = await prisma.foodDonation.create({
    data: {
      donorId: donor.id,
      ngoId: ngo.id,
      title: "Surplus Bread and Pastries",
      description: "Fresh bread and pastries from today",
      quantityTotal: 30,
      quantityUnit: "items",
      expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      pickupLocation: "456 Restaurant Ave, Food City, FC 23456",
      status: "ACCEPTED",
      statusUpdatedAt: new Date(),
      foodItems: {
        create: [
          {
            name: "Baguettes",
            category: "bakery",
            quantity: 10,
            quantityUnit: "pieces",
            dietaryInfo: ["vegan"],
            allergens: ["wheat"],
          },
          {
            name: "Croissants",
            category: "bakery",
            quantity: 15,
            quantityUnit: "pieces",
            dietaryInfo: ["vegetarian"],
            allergens: ["wheat", "dairy"],
          },
          {
            name: "Cinnamon Rolls",
            category: "bakery",
            quantity: 5,
            quantityUnit: "pieces",
            dietaryInfo: ["vegetarian"],
            allergens: ["wheat", "dairy", "eggs"],
          },
        ],
      },
    },
  })

  // Create pickup schedule for the accepted donation
  const pickup = await prisma.pickupSchedule.create({
    data: {
      donationId: donation2.id,
      ngoId: ngo.id,
      scheduledTime: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
      ngoNotes: "We will send a volunteer to pick up",
      status: "SCHEDULED",
    },
  })

  // Create volunteer assignment
  await prisma.volunteerAssignment.create({
    data: {
      volunteerId: volunteer.id,
      donationId: donation2.id,
      pickupId: pickup.id,
      assignedById: ngo.id,
      assignedByRole: UserRole.NGO,
      status: "ASSIGNED",
      pickupAddress: "456 Restaurant Ave, Food City, FC 23456",
      dropoffAddress: "789 Charity Blvd, Helping City, HC 34567",
      pickupTime: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
    },
  })

  // Create notifications
  await prisma.notification.create({
    data: {
      userId: donor.id,
      title: "Donation Accepted",
      message: 'Your donation "Surplus Bread and Pastries" has been accepted by Community Food Bank',
      relatedEntityType: "donation",
      relatedEntityId: donation2.id,
    },
  })

  await prisma.notification.create({
    data: {
      userId: ngo.id,
      title: "New Donation Available",
      message: 'A new donation "Leftover Catering Food" is available for acceptance',
      relatedEntityType: "donation",
      relatedEntityId: donation1.id,
    },
  })

  await prisma.notification.create({
    data: {
      userId: volunteer.id,
      title: "New Delivery Assignment",
      message: "You have been assigned to pick up a donation from Delicious Eats Restaurant",
      relatedEntityType: "assignment",
      relatedEntityId: donation2.id,
    },
  })

  console.log("Database seeded successfully")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
