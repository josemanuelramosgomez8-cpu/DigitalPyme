import { defaultSiteSettings, type SiteSettings } from "../lib/api"

export function updateMeta(
  selector: string,
  attribute: "name" | "property",
  key: string,
  content: string | null,
): void {
  let element = document.head.querySelector<HTMLMetaElement>(selector)
  if (!content) {
    element?.remove()
    return
  }
  if (!element) {
    element = document.createElement("meta")
    element.setAttribute(attribute, key)
    document.head.append(element)
  }
  element.content = content
}

export function mergeSiteSettings(
  settings: Partial<SiteSettings> | null | undefined,
): SiteSettings {
  return {
    ...defaultSiteSettings,
    ...settings,
    seo: { ...defaultSiteSettings.seo, ...settings?.seo },
    brand: { ...defaultSiteSettings.brand, ...settings?.brand },
    contact: { ...defaultSiteSettings.contact, ...settings?.contact },
    theme: { ...defaultSiteSettings.theme, ...settings?.theme },
    coverage: {
      ...defaultSiteSettings.coverage,
      ...settings?.coverage,
      shipping_zones:
        settings?.coverage?.shipping_zones ??
        defaultSiteSettings.coverage.shipping_zones,
      shipping_methods:
        settings?.coverage?.shipping_methods ??
        defaultSiteSettings.coverage.shipping_methods,
    },
    legal: { ...defaultSiteSettings.legal, ...settings?.legal },
  }
}

export function applySiteSettings(settings: SiteSettings): void {
  const root = document.documentElement
  root.style.setProperty("--ink", settings.theme.dark)
  root.style.setProperty("--lime", settings.theme.lime)
  root.style.setProperty(
    "--lime-dark",
    settings.theme.lime === defaultSiteSettings.theme.lime
      ? "#a9d835"
      : settings.theme.lime,
  )
  root.style.setProperty("--cream", settings.theme.cream)
  root.style.setProperty(
    "--font-sans",
    `'${settings.theme.font_sans}', sans-serif`,
  )
  root.style.setProperty(
    "--font-display",
    `'${settings.theme.font_display}', serif`,
  )
  if (settings.brand.logo_url) root.dataset.brandLogo = settings.brand.logo_url
  else delete root.dataset.brandLogo

  const title = settings.seo.title || defaultSiteSettings.seo.title
  const description =
    settings.seo.description || defaultSiteSettings.seo.description
  const slug = (settings.seo.slug ?? "").replace(/^\/+|\/+$/g, "")
  const canonicalUrl = new URL(
    slug ? `/${slug}` : "/",
    window.location.origin,
  ).toString()
  document.title = title
  updateMeta('meta[name="description"]', "name", "description", description)
  updateMeta(
    'meta[name="robots"]',
    "name",
    "robots",
    new URLSearchParams(window.location.search).get("admin") === "1"
      ? "noindex, nofollow"
      : "index, follow",
  )
  updateMeta(
    'meta[name="theme-color"]',
    "name",
    "theme-color",
    settings.theme.cream,
  )
  updateMeta('meta[property="og:title"]', "property", "og:title", title)
  updateMeta(
    'meta[property="og:description"]',
    "property",
    "og:description",
    description,
  )
  updateMeta('meta[property="og:type"]', "property", "og:type", "website")
  updateMeta('meta[property="og:url"]', "property", "og:url", canonicalUrl)
  updateMeta(
    'meta[property="og:image"]',
    "property",
    "og:image",
    settings.seo.og_image || null,
  )
  updateMeta(
    'meta[name="twitter:card"]',
    "name",
    "twitter:card",
    settings.seo.og_image ? "summary_large_image" : "summary",
  )
  updateMeta('meta[name="twitter:title"]', "name", "twitter:title", title)
  updateMeta(
    'meta[name="twitter:description"]',
    "name",
    "twitter:description",
    description,
  )
  updateMeta(
    'meta[name="twitter:image"]',
    "name",
    "twitter:image",
    settings.seo.og_image || null,
  )

  let canonical = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]',
  )
  if (!canonical) {
    canonical = document.createElement("link")
    canonical.rel = "canonical"
    document.head.append(canonical)
  }
  canonical.href = canonicalUrl

  let fontLink = document.getElementById(
    "digitalpyme-custom-fonts",
  ) as HTMLLinkElement | null
  const googleFonts = [
    settings.theme.font_sans,
    settings.theme.font_display,
  ].filter(
    (font, index, list) => list.indexOf(font) === index && font !== "Georgia",
  )
  if (
    googleFonts.length > 0 &&
    (settings.theme.font_sans !== defaultSiteSettings.theme.font_sans ||
      settings.theme.font_display !== defaultSiteSettings.theme.font_display)
  ) {
    if (!fontLink) {
      fontLink = document.createElement("link")
      fontLink.id = "digitalpyme-custom-fonts"
      fontLink.rel = "stylesheet"
      document.head.append(fontLink)
    }
    const fonts = googleFonts.map(
      (font) => `family=${encodeURIComponent(font).replace(/%20/g, "+")}`,
    )
    fontLink.href = `https://fonts.googleapis.com/css2?${fonts.join("&")}&display=swap`
  } else {
    fontLink?.remove()
  }
}
