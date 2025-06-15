import type React from "react"
import { OverviewPanel } from "./overview-panel"
import { ProductsPanel } from "./products-panel"
import { OrdersPanel } from "./orders-panel"
import { SalesmanPanel } from "./salesman-panel"

type PanelType = "overview" | "products" | "orders" | "salesman"

interface AdminDashboardContentProps {
  selectedPanel: PanelType
}

export const AdminDashboardContent: React.FC<AdminDashboardContentProps> = ({ selectedPanel }) => {
  const renderPanel = (panelType: PanelType) => {
    switch (panelType) {
      case "overview":
        return <OverviewPanel />
      case "products":
        return <ProductsPanel />
      case "orders":
        return <OrdersPanel />
      case "salesman":
        return <SalesmanPanel />
      default:
        return <OverviewPanel />
    }
  }

  return <div className="p-4">{renderPanel(selectedPanel)}</div>
}
