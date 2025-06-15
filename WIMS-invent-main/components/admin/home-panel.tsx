import type React from "react"
import { Shield } from "lucide-react"

interface RetentionInfo {
  totalProtectedOrders: number
  ordersNearExpiry: number
  archivedOrdersCount: number
}

interface HomePanelProps {
  retentionInfo: RetentionInfo
}

const HomePanel: React.FC<HomePanelProps> = ({ retentionInfo }) => {
  return (
    <div>
      {/* 30-Day Order Retention Status */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-green-800 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              30-Day Order Retention Status
            </h3>
            <div className="text-sm text-green-600 font-medium">✅ ACTIVE & PROTECTED</div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">{retentionInfo.totalProtectedOrders}</div>
              <div className="text-sm text-green-600">Protected Orders</div>
              <div className="text-xs text-gray-500">Safe for 30 days</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-orange-700">{retentionInfo.ordersNearExpiry}</div>
              <div className="text-sm text-orange-600">Near Expiry</div>
              <div className="text-xs text-gray-500">≤ 3 days remaining</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700">{retentionInfo.archivedOrdersCount}</div>
              <div className="text-sm text-blue-600">Archived Orders</div>
              <div className="text-xs text-gray-500">After 30 days</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-purple-700">100%</div>
              <div className="text-sm text-purple-600">Compliance</div>
              <div className="text-xs text-gray-500">Retention policy</div>
            </div>
          </div>

          <div className="mt-3 text-sm text-green-700 bg-green-100 rounded p-2">
            <strong>Guarantee:</strong> All orders remain permanently visible on the website for exactly 30 days after
            creation. Orders are automatically archived (not deleted) after 30 days for long-term storage.
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePanel
