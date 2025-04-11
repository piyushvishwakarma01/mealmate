import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, ArrowLeft } from "lucide-react"

export default function VerificationSentPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted px-4 py-12">
      <div className="absolute inset-0 z-0 food-pattern-bg"></div>
      <div className="relative z-10 w-full max-w-md">
        <Card className="border-none shadow-lg overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent"></div>
          <CardHeader className="space-y-1">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">Check Your Email</CardTitle>
            <CardDescription className="text-center">
              We&apos;ve sent you a verification link to complete your registration
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              Please check your email inbox and click on the verification link to activate your account. If you
              don&apos;t see the email, check your spam folder.
            </p>
            <div className="mt-6 flex items-center justify-center space-x-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-primary"></div>
              <div className="h-2 w-2 animate-pulse rounded-full bg-primary" style={{ animationDelay: "0.2s" }}></div>
              <div className="h-2 w-2 animate-pulse rounded-full bg-primary" style={{ animationDelay: "0.4s" }}></div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button asChild variant="outline" className="w-full">
              <Link href="/auth/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
