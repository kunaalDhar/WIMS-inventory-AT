import { LoginForm } from "@/components/login-form"
import { SalesmanLoginHeader } from "@/components/salesman/salesman-login-header"

export default function SalesmanLoginPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <SalesmanLoginHeader />
      <LoginForm role="salesman" />
    </div>
  )
}
