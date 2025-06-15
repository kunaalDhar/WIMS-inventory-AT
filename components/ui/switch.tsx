import React from "react"

interface SwitchProps {
  id?: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  className?: string
  disabled?: boolean
}

export const Switch: React.FC<SwitchProps> = ({ id, checked, onCheckedChange, className = "", disabled }) => {
  return (
    <label className={`inline-flex items-center cursor-pointer ${className}`} htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={e => onCheckedChange(e.target.checked)}
        disabled={disabled}
      />
      <div
        className={`w-10 h-6 bg-gray-200 rounded-full peer-focus:ring-2 peer-focus:ring-blue-500 transition peer-checked:bg-blue-600 relative peer-disabled:opacity-50`}
      >
        <div
          className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 transform ${checked ? "translate-x-4" : ""}`}
        />
      </div>
    </label>
  )
} 