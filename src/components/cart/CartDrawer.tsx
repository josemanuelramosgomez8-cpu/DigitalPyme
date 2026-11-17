import React, { useEffect } from "react"
import { useCart } from "../../context/CartContext"
import Icon from "../common/Icon"
import { useScrollLock } from "../../hooks/useScrollLock"

export default function CartDrawer({
  onQuote,
  onNavigate,
}: {
  onQuote: (serviceNames: string[]) => void
  onNavigate: (path: string) => void
}) {
  const {
    cartItems,
    totalItems,
    isCartOpen,
    closeCart,
    currency,
    setCurrency,
    formatPrice,
    formatAmount,
    subtotal,
    hasQuotationOnlyItems,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart()

  // Lock body scroll when drawer is open
  useScrollLock(isCartOpen)

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isCartOpen) {
        closeCart()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isCartOpen, closeCart])

  if (!isCartOpen) return null

  const handleCheckoutQuote = () => {
    if (cartItems.length === 0) return
    const names = cartItems.map((item) => item.nombre)
    closeCart()
    onQuote(names)
  }

  const handleGoToCatalog = () => {
    closeCart()
    onNavigate("/catalogo-servicios")
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      aria-labelledby="cart-drawer-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop overlay with blur */}
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity duration-300"
        aria-hidden="true"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-6 sm:pl-10">
        <aside className="w-screen max-w-md bg-[#fffef9] shadow-2xl flex flex-col border-l border-stone-200/90 text-stone-900 animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-5 border-b border-stone-200 bg-stone-50/70 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#102c2c] text-white flex items-center justify-center shadow-sm">
                <Icon name="cart" size={20} />
              </div>
              <div>
                <h2
                  id="cart-drawer-title"
                  className="text-lg font-bold text-[#102c2c] leading-tight font-serif"
                >
                  Carrito de Servicios
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {totalItems} {totalItems === 1 ? "servicio" : "servicios"}
                  </span>
                  <span className="text-xs text-stone-600">
                    Tecnología DigitalPyme
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Quick Currency Toggle in Drawer */}
              <div className="flex items-center bg-stone-200/80 rounded-lg p-0.5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setCurrency("PEN")}
                  className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                    currency === "PEN"
                      ? "bg-[#102c2c] text-white shadow-xs"
                      : "text-stone-700 hover:text-black"
                  }`}
                  aria-pressed={currency === "PEN"}
                  title="Moneda Soles (PEN)"
                >
                  PEN
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency("USD")}
                  className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                    currency === "USD"
                      ? "bg-[#102c2c] text-white shadow-xs"
                      : "text-stone-700 hover:text-black"
                  }`}
                  aria-pressed={currency === "USD"}
                  title="Moneda Dólares (USD)"
                >
                  USD
                </button>
              </div>

              <button
                type="button"
                className="w-9 h-9 rounded-lg flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 transition-colors cursor-pointer"
                onClick={closeCart}
                aria-label="Cerrar carrito"
              >
                <Icon name="x" size={20} />
              </button>
            </div>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
                <div className="w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 text-stone-500 flex items-center justify-center mb-4">
                  <Icon name="cart" size={30} />
                </div>
                <h3 className="text-base font-bold text-stone-900 mb-1">
                  Tu carrito está vacío
                </h3>
                <p className="text-xs text-stone-600 max-w-xs mb-6 leading-relaxed">
                  Aún no has agregado ningún servicio tecnológico. Explora
                  nuestro catálogo y selecciona las soluciones digitales que tu
                  empresa necesita.
                </p>
                <button
                  type="button"
                  onClick={handleGoToCatalog}
                  className="px-5 py-2.5 rounded-lg bg-[#102c2c] text-white text-xs font-bold hover:bg-[#294545] transition-all shadow-md cursor-pointer flex items-center gap-2"
                >
                  <Icon name="spark" size={16} />
                  Ver catálogo de servicios
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between text-xs text-stone-600 px-1">
                  <span>Servicios tecnológicos seleccionados</span>
                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-rose-700 hover:text-rose-900 font-semibold hover:underline cursor-pointer"
                  >
                    Vaciar todo
                  </button>
                </div>

                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <article
                      key={item.slug}
                      className="p-3.5 rounded-xl bg-white border border-stone-200/90 shadow-xs hover:border-emerald-300 transition-all flex gap-3.5 items-start"
                    >
                      {/* Image Thumbnail */}
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
                        <img
                          src={item.imagen || "/images/services/servicio-digital.jpg"}
                          alt={item.nombre}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            ;(e.target as HTMLImageElement).src =
                              "/images/services/servicio-digital.jpg"
                          }}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/70 inline-block">
                            {item.categoria || "Servicio digital"}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.slug)}
                            className="text-stone-500 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                            aria-label={`Eliminar ${item.nombre} del carrito`}
                            title="Eliminar del carrito"
                          >
                            <Icon name="trash" size={15} />
                          </button>
                        </div>

                        <h4 className="text-sm font-bold text-stone-900 mt-1 truncate">
                          {item.nombre}
                        </h4>

                        {item.duracion && (
                          <p className="text-[11px] text-stone-600 mt-0.5">
                            Tiempo estimado: {item.duracion}
                          </p>
                        )}

                        <div className="mt-2.5 flex items-center justify-between">
                          <strong className="text-xs font-bold text-[#102c2c]">
                            {formatPrice(item.precio_desde)}
                          </strong>

                          {/* Quantity control */}
                          <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50 overflow-hidden">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.slug, item.quantity - 1)
                              }
                              className="w-6 h-6 flex items-center justify-center text-stone-700 hover:bg-stone-200/70 transition-colors cursor-pointer"
                              aria-label="Disminuir cantidad"
                            >
                              <Icon name="minus" size={12} />
                            </button>
                            <span className="w-7 text-center text-xs font-bold text-stone-900 select-none">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.slug, item.quantity + 1)
                              }
                              className="w-6 h-6 flex items-center justify-center text-stone-700 hover:bg-stone-200/70 transition-colors cursor-pointer"
                              aria-label="Aumentar cantidad"
                            >
                              <Icon name="plus" size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Drawer Footer */}
          {cartItems.length > 0 && (
            <div className="p-5 border-t border-stone-200 bg-stone-50/90 space-y-3.5">
              {/* Subtotal summary */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-stone-700 font-medium">
                    Inversión estimada referencial
                  </span>
                  <strong className="text-base font-extrabold text-[#102c2c]">
                    {subtotal > 0
                      ? formatAmount(subtotal)
                      : "A cotizar según alcance"}
                  </strong>
                </div>
                {hasQuotationOnlyItems && (
                  <p className="text-[11px] text-stone-600 leading-tight">
                    * La inversión final dependerá del alcance técnico definido en
                    la cotización formal.
                  </p>
                )}
              </div>

              {/* Informative Assurance Note */}
              <div className="p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200/70 text-[11px] text-emerald-950 flex items-center gap-2">
                <span className="text-emerald-700 shrink-0 font-bold">✓</span>
                <span>
                  <strong>Cotización sin compromiso:</strong> Revisaremos tu
                  solicitud y te entregaremos una propuesta formal personalizada.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCheckoutQuote}
                  className="w-full py-3 px-4 rounded-xl bg-[#102c2c] hover:bg-[#294545] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Icon name="send" size={16} />
                  Solicitar cotización formal ({totalItems})
                </button>

                <button
                  type="button"
                  onClick={handleGoToCatalog}
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 font-bold text-xs transition-colors cursor-pointer text-center"
                >
                  Ver catálogo completo
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
