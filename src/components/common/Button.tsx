import React from "react"

export default function Button({
  children,
  secondary = false,
  onClick,
  className = "",
  type = "button",
  disabled = false,
}: {
  children: React.ReactNode
  secondary?: boolean
  onClick?: () => void
  className?: string
  type?: "button" | "submit" | "reset"
  disabled?: boolean
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`button ${secondary ? "button-secondary" : ""} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
