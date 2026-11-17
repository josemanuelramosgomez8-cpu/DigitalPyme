import { useState } from "react"
import Brand from "../common/Brand"
import Icon from "../common/Icon"
import { useCart } from "../../context/CartContext"

export default function Header({
  onQuote,
  onPortal,
  onNavigate,
}: {
  onQuote: () => void
  onPortal: () => void
  onNavigate: (path: string) => void
}) {
  const [open, setOpen] = useState(false)
  const { totalItems, openCart } = useCart()

  const handleLinkClick = (path: string) => {
    setOpen(false)
    onNavigate(path)
  }

  return (
    <header className="site-header sticky top-0 z-40 bg-[#f6f4ed]/95 backdrop-blur-md border-b border-[#102c2c]/10">
      <div className="container nav-wrap flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <a
          href="/#inicio"
          className="brand-link"
          aria-label="DigitalPyme inicio"
          onClick={(event) => {
            event.preventDefault()
            handleLinkClick("/#inicio")
          }}
        >
          <Brand />
        </a>

        {/* Primary Desktop / Mobile Collapsible Navigation */}
        <nav
          id="primary-navigation"
          aria-label="Navegación principal"
          className={open ? "nav-links nav-open" : "nav-links"}
        >
          <a
            href="/#servicios"
            onClick={(event) => {
              event.preventDefault()
              handleLinkClick("/#servicios")
            }}
          >
            Servicios
          </a>
          <a
            href="/precios"
            onClick={(event) => {
              event.preventDefault()
              handleLinkClick("/precios")
            }}
          >
            Precios
          </a>
          <a
            href="/catalogo-servicios"
            className="font-bold text-[#102c2c]"
            onClick={(event) => {
              event.preventDefault()
              handleLinkClick("/catalogo-servicios")
            }}
          >
            Catálogo de servicios
          </a>
          <a
            href="/#proyectos"
            onClick={(event) => {
              event.preventDefault()
              handleLinkClick("/#proyectos")
            }}
          >
            Proyectos
          </a>
          <a
            href="/#proceso"
            onClick={(event) => {
              event.preventDefault()
              handleLinkClick("/#proceso")
            }}
          >
            Cómo trabajamos
          </a>
          <a
            href="/#contacto"
            onClick={(event) => {
              event.preventDefault()
              handleLinkClick("/#contacto")
            }}
          >
            Contacto
          </a>

          <a
            href="#portal"
            className="button portal-link"
            onClick={(event) => {
              event.preventDefault()
              setOpen(false)
              onPortal()
            }}
          >
            <Icon name="user" size={17} /> Ingresar
          </a>
          <a
            href="#contacto"
            className="button"
            onClick={(event) => {
              event.preventDefault()
              setOpen(false)
              onQuote()
            }}
          >
            Solicita tu cotización
          </a>
        </nav>

        {/* Header Right Actions: Clean shopping cart & mobile menu */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Real-time Shopping Cart Button with Dynamic Badge */}
          <button
            type="button"
            onClick={openCart}
            className="relative inline-flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-300/90 text-stone-800 shadow-2xs hover:border-emerald-600 transition-all cursor-pointer group"
            aria-label={`Ver carrito de compras con ${totalItems} servicios`}
            title="Ver carrito de servicios"
          >
            <div className="relative flex items-center justify-center text-[#102c2c] group-hover:text-emerald-700 transition-colors">
              <Icon name="cart" size={20} />
              {totalItems > 0 && (
                <span
                  key={totalItems}
                  className="absolute -top-2.5 -right-2.5 min-w-[20px] h-5 px-1 rounded-full bg-amber-500 text-white font-extrabold text-[11px] flex items-center justify-center shadow-xs ring-2 ring-white animate-in zoom-in duration-200"
                  aria-hidden="true"
                >
                  {totalItems}
                </span>
              )}
            </div>
            <span className="hidden md:inline text-xs font-bold text-stone-800 group-hover:text-emerald-900">
              Carrito
            </span>
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            className="menu-button"
            type="button"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            aria-controls="primary-navigation"
          >
            <Icon name={open ? "x" : "menu"} />
          </button>
        </div>
      </div>
    </header>
  )
}
