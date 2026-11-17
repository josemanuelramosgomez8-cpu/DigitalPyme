import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import type { ApiService } from "../lib/api"
import { fallbackServices, serviceSlug } from "../constants/siteData"
import {
  SERVICE_CART_KEY,
  readServiceCart,
  serviceImage,
} from "../utils/serviceCartStorage"

export type Currency = "PEN" | "USD"

export interface CartItem {
  id: string | number
  slug: string
  nombre: string
  descripcion?: string | null
  categoria?: string
  precio_desde?: number | null
  duracion?: string | null
  imagen?: string
  quantity: number
}

export interface CartContextValue {
  cartItems: CartItem[]
  totalItems: number
  isCartOpen: boolean
  setIsCartOpen: (open: boolean) => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  currency: Currency
  setCurrency: (currency: Currency) => void
  exchangeRate: number
  addToCart: (service: ApiService | CartItem, quantity?: number) => void
  removeFromCart: (slugOrId: string | number) => void
  updateQuantity: (slugOrId: string | number, quantity: number) => void
  clearCart: () => void
  isInCart: (slugOrId: string | number) => boolean
  subtotal: number
  hasQuotationOnlyItems: boolean
  formatPrice: (
    pricePen: number | string | null | undefined,
    customCurrency?: Currency,
  ) => string
  formatAmount: (amountPen: number, customCurrency?: Currency) => string
}

const ITEMS_STORAGE_KEY = "digitalpyme.service-cart.items.v1"
const CURRENCY_STORAGE_KEY = "digitalpyme.currency.v1"
const DEFAULT_EXCHANGE_RATE = 3.75 // 1 USD = 3.75 PEN

const CartContext = createContext<CartContextValue | null>(null)

function initialCartItems(): CartItem[] {
  if (typeof window === "undefined") return []

  try {
    const raw = localStorage.getItem(ITEMS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item) => ({
          ...item,
          quantity: Math.max(1, Number(item.quantity) || 1),
        }))
      }
    }

    // Fallback: migrate from legacy slug list if any
    const slugs = readServiceCart()
    if (slugs.length > 0) {
      return slugs.map((slug) => ({
        id: slug,
        slug,
        nombre: slug
          .replace(/-/g, " ")
          .replace(/\b\w/g, (char) => char.toUpperCase()),
        categoria: "Servicio digital",
        precio_desde: null,
        imagen: "/images/services/servicio-digital.jpg",
        quantity: 1,
      }))
    }
  } catch {
    // Ignore storage parse errors
  }

  return []
}

function initialCurrency(): Currency {
  if (typeof window === "undefined") return "PEN"
  try {
    const saved = localStorage.getItem(CURRENCY_STORAGE_KEY)
    if (saved === "USD" || saved === "PEN") return saved
  } catch {
    // Ignore
  }
  return "PEN"
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

export default function CartProvider({
  children,
  initialServices = fallbackServices,
}: {
  children: React.ReactNode
  initialServices?: ApiService[]
}) {
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [currency, setCurrencyState] = useState<Currency>(initialCurrency)
  const exchangeRate = DEFAULT_EXCHANGE_RATE

  // Keep items synced to local storage
  const syncToStorage = useCallback((items: CartItem[]) => {
    try {
      localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(items))
      localStorage.setItem(
        SERVICE_CART_KEY,
        JSON.stringify(items.map((i) => i.slug)),
      )
      window.dispatchEvent(new CustomEvent("digitalpyme:cart-change", { detail: items }))
    } catch {
      // Ignore quota errors
    }
  }, [])

  const setCurrency = useCallback((newCurrency: Currency) => {
    setCurrencyState(newCurrency)
    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, newCurrency)
      window.dispatchEvent(
        new CustomEvent("digitalpyme:currency-change", { detail: newCurrency }),
      )
    } catch {
      // Ignore
    }
  }, [])

  // Listen for storage / currency updates from other tabs or windows
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === ITEMS_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          if (Array.isArray(parsed)) setCartItems(parsed)
        } catch {
          // Ignore
        }
      } else if (e.key === CURRENCY_STORAGE_KEY && e.newValue) {
        if (e.newValue === "USD" || e.newValue === "PEN") {
          setCurrencyState(e.newValue)
        }
      }
    }

    const handleCustomCurrency = (event: Event) => {
      const detail = (event as CustomEvent<Currency>).detail
      if (detail === "USD" || detail === "PEN") {
        setCurrencyState(detail)
      }
    }

    window.addEventListener("storage", handleStorage)
    window.addEventListener(
      "digitalpyme:currency-change",
      handleCustomCurrency as EventListener,
    )

    return () => {
      window.removeEventListener("storage", handleStorage)
      window.removeEventListener(
        "digitalpyme:currency-change",
        handleCustomCurrency as EventListener,
      )
    }
  }, [])

  // Enrich initial items if services catalog is provided and items lack details
  useEffect(() => {
    if (!initialServices || initialServices.length === 0) return

    setCartItems((prev) => {
      let changed = false
      const enriched = prev.map((item) => {
        const found = initialServices.find(
          (s) => serviceSlug(s) === item.slug || String(s.id) === String(item.id),
        )
        if (found) {
          const parsedFoundPrice =
            found.precio_desde != null && found.precio_desde !== ""
              ? Number(found.precio_desde)
              : (item.precio_desde ?? null)
          const updated: CartItem = {
            ...item,
            nombre: found.nombre || item.nombre,
            categoria: found.category?.nombre ?? found.categoria ?? item.categoria,
            descripcion: found.descripcion ?? item.descripcion,
            precio_desde: parsedFoundPrice,
            duracion: found.duracion ?? item.duracion,
            imagen: serviceImage(found) || item.imagen,
          }
          if (
            updated.nombre !== item.nombre ||
            updated.precio_desde !== item.precio_desde ||
            updated.imagen !== item.imagen
          ) {
            changed = true
            return updated
          }
        }
        return item
      })

      if (changed) {
        syncToStorage(enriched)
        return enriched
      }
      return prev
    })
  }, [initialServices, syncToStorage])

  const openCart = useCallback(() => setIsCartOpen(true), [])
  const closeCart = useCallback(() => setIsCartOpen(false), [])
  const toggleCart = useCallback(() => setIsCartOpen((prev) => !prev), [])

  const addToCart = useCallback(
    (service: ApiService | CartItem, quantity: number = 1) => {
      setCartItems((current) => {
        const slug =
          "slug" in service && service.slug
            ? service.slug
            : serviceSlug(service as ApiService)
        const id = service.id ?? slug
        const existingIndex = current.findIndex(
          (item) => item.slug === slug || String(item.id) === String(id),
        )

        let next: CartItem[]
        if (existingIndex >= 0) {
          next = current.map((item, index) =>
            index === existingIndex
              ? { ...item, quantity: item.quantity + quantity }
              : item,
          )
        } else {
          const parsedPrice =
            service.precio_desde != null && service.precio_desde !== ""
              ? Number(service.precio_desde)
              : null

          const newItem: CartItem = {
            id,
            slug,
            nombre: service.nombre,
            descripcion: service.descripcion ?? null,
            categoria:
              ("category" in service && service.category?.nombre)
                ? service.category.nombre
                : service.categoria || "Servicio digital",
            precio_desde: parsedPrice,
            duracion: service.duracion ?? null,
            imagen:
              "imagen" in service && service.imagen
                ? service.imagen
                : serviceImage(service as ApiService),
            quantity: Math.max(1, quantity),
          }
          next = [...current, newItem]
        }

        syncToStorage(next)
        return next
      })

      // Automatically open drawer to confirm addition with smooth visual feedback
      setIsCartOpen(true)
    },
    [syncToStorage],
  )

  const removeFromCart = useCallback(
    (slugOrId: string | number) => {
      setCartItems((current) => {
        const next = current.filter(
          (item) =>
            item.slug !== String(slugOrId) &&
            String(item.id) !== String(slugOrId),
        )
        syncToStorage(next)
        return next
      })
    },
    [syncToStorage],
  )

  const updateQuantity = useCallback(
    (slugOrId: string | number, quantity: number) => {
      setCartItems((current) => {
        if (quantity <= 0) {
          const next = current.filter(
            (item) =>
              item.slug !== String(slugOrId) &&
              String(item.id) !== String(slugOrId),
          )
          syncToStorage(next)
          return next
        }

        const next = current.map((item) => {
          if (
            item.slug === String(slugOrId) ||
            String(item.id) === String(slugOrId)
          ) {
            return { ...item, quantity }
          }
          return item
        })
        syncToStorage(next)
        return next
      })
    },
    [syncToStorage],
  )

  const clearCart = useCallback(() => {
    setCartItems([])
    syncToStorage([])
  }, [syncToStorage])

  const isInCart = useCallback(
    (slugOrId: string | number) => {
      return cartItems.some(
        (item) =>
          item.slug === String(slugOrId) ||
          String(item.id) === String(slugOrId),
      )
    },
    [cartItems],
  )

  const totalItems = useMemo(
    () => cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0),
    [cartItems],
  )

  const formatPrice = useCallback(
    (
      pricePen: number | string | null | undefined,
      customCurrency?: Currency,
    ): string => {
      if (
        pricePen === null ||
        pricePen === undefined ||
        !Number.isFinite(Number(pricePen)) ||
        Number(pricePen) <= 0
      ) {
        return "A cotizar"
      }

      const activeCur = customCurrency || currency
      const numericVal = Number(pricePen)

      if (activeCur === "USD") {
        const usdVal = numericVal / exchangeRate
        return `Desde $ ${usdVal.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      }

      return `Desde S/ ${numericVal.toLocaleString("es-PE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    },
    [currency, exchangeRate],
  )

  const formatAmount = useCallback(
    (amountPen: number, customCurrency?: Currency): string => {
      const activeCur = customCurrency || currency
      const numericVal = Number(amountPen) || 0

      if (activeCur === "USD") {
        const usdVal = numericVal / exchangeRate
        return `$ ${usdVal.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      }

      return `S/ ${numericVal.toLocaleString("es-PE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    },
    [currency, exchangeRate],
  )

  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const price = Number(item.precio_desde) || 0
      return acc + price * (item.quantity || 1)
    }, 0)
  }, [cartItems])

  const hasQuotationOnlyItems = useMemo(() => {
    return cartItems.some(
      (item) =>
        item.precio_desde === null ||
        item.precio_desde === undefined ||
        Number(item.precio_desde) <= 0,
    )
  }, [cartItems])

  const value: CartContextValue = {
    cartItems,
    totalItems,
    isCartOpen,
    setIsCartOpen,
    openCart,
    closeCart,
    toggleCart,
    currency,
    setCurrency,
    exchangeRate,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    subtotal,
    hasQuotationOnlyItems,
    formatPrice,
    formatAmount,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
