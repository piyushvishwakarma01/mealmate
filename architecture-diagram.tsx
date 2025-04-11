import type React from "react"

const ArchitectureDiagram: React.FC = () => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="max-w-4xl w-full bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">MealMate System Architecture</h2>

        {/* This would be an actual diagram in a real implementation */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 mb-6 text-center text-gray-500">
          Architecture Diagram Placeholder
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-bold mb-2 text-blue-700">Frontend Layer</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>React + TypeScript</li>
              <li>React Router</li>
              <li>ShadCN/UI + TailwindCSS</li>
              <li>Axios for API calls</li>
              <li>React Query for data fetching</li>
              <li>Context API for state management</li>
              <li>React Hook Form for validations</li>
            </ul>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-bold mb-2 text-green-700">Backend Layer</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Express.js + TypeScript</li>
              <li>JWT Authentication</li>
              <li>Bcrypt for password hashing</li>
              <li>Prisma ORM</li>
              <li>Zod for validation</li>
              <li>Socket.io for real-time features</li>
              <li>Express middleware for RBAC</li>
            </ul>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-bold mb-2 text-purple-700">Database Layer</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Supabase PostgreSQL</li>
              <li>15 normalized tables</li>
              <li>Database triggers</li>
              <li>Complex joins</li>
              <li>Prisma for type-safe queries</li>
              <li>Indexes for performance</li>
              <li>Foreign key constraints</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-amber-50 p-4 rounded-lg">
            <h3 className="font-bold mb-2 text-amber-700">Authentication Flow</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Custom JWT implementation</li>
              <li>Refresh token rotation</li>
              <li>Role-based access control</li>
              <li>Secure password storage with bcrypt</li>
              <li>Session management</li>
              <li>CSRF protection</li>
            </ul>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-bold mb-2 text-red-700">Real-time Features</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Socket.io for notifications</li>
              <li>Real-time messaging</li>
              <li>Donation status updates</li>
              <li>Volunteer location tracking</li>
              <li>Delivery status updates</li>
              <li>Admin activity monitoring</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ArchitectureDiagram
