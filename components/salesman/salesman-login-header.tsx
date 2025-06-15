import { ShoppingBag } from "lucide-react"

export function SalesmanLoginHeader() {
  return (
    <div className="mb-8 text-center">
      <div className="flex justify-center mb-4">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-full">
          <ShoppingBag className="h-8 w-8 text-white" />
        </div>
      </div>
      <h1 className="text-3xl font-bold mb-2">Salesman Portal</h1>
      <p className="text-muted-foreground max-w-md mx-auto">
        Access your sales dashboard, manage orders, and track your performance with just your name.
      </p>
    </div>
  )
}
