import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { OrderProvider } from "@/contexts/order-context"
import { InventoryProvider } from "@/contexts/inventory-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "WIMS - Warehouse Inventory Management System",
  description: "Complete warehouse and inventory management solution",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <InventoryProvider>
            <OrderProvider>{children}</OrderProvider>
          </InventoryProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
