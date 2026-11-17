import React from "react"
import Header from "../components/layout/Header"
import CartDrawer from "../components/cart/CartDrawer"
import SiteFooter from "../components/layout/SiteFooter"
import { defaultSiteSettings, type SiteSettings } from "../lib/api"

export interface MainLayoutProps {
  children: React.ReactNode
  onQuote: (service?: string, message?: string) => void
  onPortal: () => void
  onNavigate: (path: string) => void
  siteSettings?: SiteSettings
  onOpenLegal?: (kind: "privacy" | "warranty" | "terms" | "returns") => void
  hideFooter?: boolean
}

export default function MainLayout({
  children,
  onQuote,
  onPortal,
  onNavigate,
  siteSettings = defaultSiteSettings,
  onOpenLegal = () => {},
  hideFooter = false,
}: MainLayoutProps) {
  return (
    <div className="page-shell flex flex-col min-h-screen bg-[#f6f4ed] text-[#102c2c]">
      {/* 1. Global Persistent Header: sticky top-0, brand logo, full navigation, currency toggle, cart button */}
      <Header
        onQuote={() => onQuote()}
        onPortal={onPortal}
        onNavigate={onNavigate}
      />

      {/* 2. Main View Content */}
      <div className="flex-1 w-full">{children}</div>

      {/* 3. Global Shopping Cart Drawer: opens via isCartOpen from CartContext */}
      <CartDrawer
        onQuote={(services) =>
          onQuote(
            services.join(", "),
            "Servicios seleccionados desde el carrito",
          )
        }
        onNavigate={onNavigate}
      />

      {/* 4. Global Corporate Footer */}
      {!hideFooter && (
        <SiteFooter
          settings={siteSettings}
          onNavigate={onNavigate}
          onOpenLegal={onOpenLegal}
        />
      )}
    </div>
  )
}
