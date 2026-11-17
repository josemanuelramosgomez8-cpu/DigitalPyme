import type { ApiService } from "../lib/api"
import { serviceSlug } from "../constants/siteData"

export const SERVICE_CART_KEY = "digitalpyme.service-cart.v1"

const serviceImages: Record<string, string> = {
  "servicio-de-prueba": "/images/services/servicio-digital.jpg",
  "paginas-web": "/images/services/paginas-web.jpg",
  "tiendas-en-linea": "/images/services/tiendas-en-linea.png",
  branding: "/images/services/branding.jpg",
  "marketing-digital": "/images/services/marketing-digital.jpg",
  mantenimiento: "/images/services/mantenimiento.jpg",
}

export function serviceImage(service: ApiService): string {
  return (
    serviceImages[serviceSlug(service)] ??
    "/images/services/servicio-digital.jpg"
  )
}

export function readServiceCart(): string[] {
  try {
    const saved: unknown = JSON.parse(
      localStorage.getItem(SERVICE_CART_KEY) ?? "[]",
    )
    return Array.isArray(saved)
      ? saved.filter((slug): slug is string => typeof slug === "string")
      : []
  } catch {
    return []
  }
}

export function addServicesToCart(services: ApiService[]): void {
  const slugs = new Set(readServiceCart())
  for (const service of services) slugs.add(serviceSlug(service))
  localStorage.setItem(SERVICE_CART_KEY, JSON.stringify([...slugs]))
}
