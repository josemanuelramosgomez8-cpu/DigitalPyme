export default function Brand({ light = false }: { light?: boolean }) {
  const logoUrl = document.documentElement.dataset.brandLogo
  return (
    <div className={`brand ${light ? "brand-light" : ""}`}>
      {logoUrl ? (
        <img
          className="brand-logo-image"
          src={logoUrl}
          alt=""
          aria-hidden="true"
        />
      ) : (
        <span className="brand-mark">
          <span />
        </span>
      )}
      <strong>Digital</strong>Pyme
    </div>
  )
}
