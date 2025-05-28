"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Users, UserCheck, Shield, Briefcase, Lock, Key, Settings } from "lucide-react"
import Link from "next/link"

interface FeatureModalData {
  title: string
  description: string
  benefits: string[]
  howItWorks: string[]
  icon: React.ComponentType<any>
  color: string
}

const featureDetails: Record<string, FeatureModalData> = {
  secure: {
    title: "Secure Login System",
    description: "Advanced authentication with email/password protection and encrypted data transmission.",
    benefits: [
      "End-to-end encryption for all login credentials",
      "Secure session management with automatic timeout",
      "Protection against brute force attacks",
      "Industry-standard security protocols (HTTPS/TLS)",
      "Regular security audits and updates",
    ],
    howItWorks: [
      "User enters email and password credentials",
      "System validates credentials against encrypted database",
      "Secure session token is generated and stored",
      "All subsequent requests are authenticated via token",
      "Session automatically expires after inactivity",
    ],
    icon: Shield,
    color: "blue",
  },
  otp: {
    title: "OTP Verification",
    description: "One-Time Password system for enhanced security and multi-factor authentication.",
    benefits: [
      "Additional layer of security beyond passwords",
      "Protection against unauthorized access",
      "Time-limited codes for maximum security",
      "SMS and email delivery options",
      "Backup verification methods available",
    ],
    howItWorks: [
      "User completes initial login with credentials",
      "System generates unique 6-digit OTP code",
      "OTP is sent via SMS or email to registered contact",
      "User enters OTP within time limit (5 minutes)",
      "Access granted only after successful OTP verification",
    ],
    icon: Key,
    color: "green",
  },
  roles: {
    title: "Role-Based Access Control",
    description: "Intelligent permission system that provides appropriate access levels for different user types.",
    benefits: [
      "Customized dashboards for each user role",
      "Restricted access to sensitive information",
      "Streamlined workflows for specific job functions",
      "Enhanced data security and compliance",
      "Scalable permission management",
    ],
    howItWorks: [
      "User role is assigned during account creation",
      "System determines access permissions based on role",
      "Dashboard and features are customized accordingly",
      "Admin users get full system management access",
      "Sales users get order and customer management tools",
    ],
    icon: Settings,
    color: "purple",
  },
}

export default function LandingPage() {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleFeatureClick = (featureKey: string) => {
    setSelectedFeature(featureKey)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedFeature(null)
  }

  const currentFeature = selectedFeature ? featureDetails[selectedFeature] : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">W</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">WIMS</h1>
            </div>
            <p className="text-sm text-gray-600 hidden sm:block">Warehouse Intelligent Management System</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Welcome to WIMS</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Secure access portal for administrators and sales personnel. Choose your role to get started.
          </p>
        </div>

        {/* Auth Options Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Admin Section */}
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Administrator</h3>
              <p className="text-gray-600">Manage system settings and user accounts</p>
            </div>

            <div className="space-y-4">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2">
                    <UserCheck className="w-5 h-5 text-green-600" />
                    <span>Admin Login</span>
                  </CardTitle>
                  <CardDescription>Access your admin dashboard</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/admin/login">
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700">Login as Admin</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span>Admin Signup</span>
                  </CardTitle>
                  <CardDescription>Create a new admin account</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/admin/signup">
                    <Button variant="outline" className="w-full border-indigo-600 text-indigo-600 hover:bg-indigo-50">
                      Register as Admin
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Salesman Section */}
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Sales Personnel</h3>
              <p className="text-gray-600">Access sales tools and customer data</p>
            </div>

            <div className="space-y-4">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2">
                    <UserCheck className="w-5 h-5 text-green-600" />
                    <span>Salesman Login</span>
                  </CardTitle>
                  <CardDescription>Access your sales dashboard</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/salesman/login">
                    <Button className="w-full bg-green-600 hover:bg-green-700">Login as Salesman</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span>Salesman Signup</span>
                  </CardTitle>
                  <CardDescription>Create a new salesman account</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/salesman/signup">
                    <Button variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-50">
                      Register as Salesman
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-semibold text-gray-900 mb-8">Secure Authentication Features</h3>
          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {/* Secure Login Card */}
            <Card
              className="cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={() => handleFeatureClick("secure")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  handleFeatureClick("secure")
                }
              }}
              tabIndex={0}
              role="button"
              aria-label="Learn more about Secure Login"
            >
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Secure Login</h4>
                <p className="text-sm text-gray-600">Advanced email/password authentication with encryption</p>
                <div className="mt-3 text-xs text-blue-600 font-medium">Click to learn more →</div>
              </CardContent>
            </Card>

            {/* OTP Verification Card */}
            <Card
              className="cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              onClick={() => handleFeatureClick("otp")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  handleFeatureClick("otp")
                }
              }}
              tabIndex={0}
              role="button"
              aria-label="Learn more about OTP Verification"
            >
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Key className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">OTP Verification</h4>
                <p className="text-sm text-gray-600">One-time password for enhanced security</p>
                <div className="mt-3 text-xs text-green-600 font-medium">Click to learn more →</div>
              </CardContent>
            </Card>

            {/* Role-Based Access Card */}
            <Card
              className="cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              onClick={() => handleFeatureClick("roles")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  handleFeatureClick("roles")
                }
              }}
              tabIndex={0}
              role="button"
              aria-label="Learn more about Role-Based Access"
            >
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Role-Based Access</h4>
                <p className="text-sm text-gray-600">Separate portals for admins and sales staff</p>
                <div className="mt-3 text-xs text-purple-600 font-medium">Click to learn more →</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 WIMS - Warehouse Intelligent Management System. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Feature Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {currentFeature && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-3 text-xl">
                  <div
                    className={`w-10 h-10 bg-${currentFeature.color}-100 rounded-lg flex items-center justify-center`}
                  >
                    <currentFeature.icon className={`w-6 h-6 text-${currentFeature.color}-600`} />
                  </div>
                  <span>{currentFeature.title}</span>
                </DialogTitle>
                <DialogDescription className="text-base mt-2">{currentFeature.description}</DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-6">
                {/* Benefits Section */}
                <div>
                  <h4 className="font-semibold text-lg mb-3 text-gray-900">Key Benefits</h4>
                  <ul className="space-y-2">
                    {currentFeature.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className={`w-2 h-2 bg-${currentFeature.color}-600 rounded-full mt-2 flex-shrink-0`}></div>
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* How It Works Section */}
                <div>
                  <h4 className="font-semibold text-lg mb-3 text-gray-900">How It Works</h4>
                  <ol className="space-y-3">
                    {currentFeature.howItWorks.map((step, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div
                          className={`w-6 h-6 bg-${currentFeature.color}-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0`}
                        >
                          {index + 1}
                        </div>
                        <span className="text-gray-700">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Security Notice */}
                <div
                  className={`p-4 bg-${currentFeature.color}-50 border border-${currentFeature.color}-200 rounded-lg`}
                >
                  <div className="flex items-center space-x-2">
                    <Lock className={`w-5 h-5 text-${currentFeature.color}-600`} />
                    <span className={`font-medium text-${currentFeature.color}-800`}>Security Guarantee</span>
                  </div>
                  <p className={`text-sm text-${currentFeature.color}-700 mt-1`}>
                    All authentication features are built with enterprise-grade security standards and are regularly
                    audited for vulnerabilities.
                  </p>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button
                  onClick={handleCloseModal}
                  className={`bg-${currentFeature.color}-600 hover:bg-${currentFeature.color}-700`}
                >
                  Got it, thanks!
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
