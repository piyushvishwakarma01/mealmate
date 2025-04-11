import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <header className="bg-gradient-to-b from-primary/10 to-background py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Welcome to <span className="text-primary">MealMate</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Connecting food donors with NGOs to reduce waste and feed those in need
              </p>
            </div>
            <div className="space-x-4">
              <Link href="/auth/login">
                <Button size="lg" className="animate-pulse-slow">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="lg" variant="outline">
                  Register
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-12 md:py-24 bg-muted/50 food-pattern-bg">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
            <div className="flex flex-col items-center space-y-4 text-center hover-card-effect bg-card p-6 rounded-lg shadow-sm">
              <div className="p-2 bg-primary/10 rounded-full">
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
                  className="h-6 w-6 text-primary"
                >
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                  <path d="M12 18v-6" />
                  <path d="M8 18v-1" />
                  <path d="M16 18v-3" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">For Donors</h3>
              <p className="text-muted-foreground">
                Easily donate excess food, schedule pickups, and track your impact
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center hover-card-effect bg-card p-6 rounded-lg shadow-sm">
              <div className="p-2 bg-primary/10 rounded-full">
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
                  className="h-6 w-6 text-primary"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">For NGOs</h3>
              <p className="text-muted-foreground">
                Find available donations, coordinate pickups, and manage distribution
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center hover-card-effect bg-card p-6 rounded-lg shadow-sm">
              <div className="p-2 bg-primary/10 rounded-full">
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
                  className="h-6 w-6 text-primary"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">For Volunteers</h3>
              <p className="text-muted-foreground">
                Help with food pickups and deliveries, making a direct impact in your community
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 md:py-24 bg-primary/5">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Join the MealMate Community</h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
                Whether you're a restaurant with excess food, an NGO helping those in need, or a volunteer wanting to
                make a difference
              </p>
            </div>
            <div className="space-x-4">
              <Link href="/auth/register">
                <Button size="lg" className="animate-bounce-slow">
                  Get Started Today
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © {new Date().getFullYear()} MealMate. All rights reserved.
          </p>
          <div className="flex items-center space-x-4">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Terms
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
