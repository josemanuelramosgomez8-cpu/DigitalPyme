import Icon from "./Icon"

export default function TrustLine() {
  return (
    <div className="trust-line">
      <span>
        <Icon name="clock" size={16} /> Cuéntanos tu proyecto
      </span>
      <span>
        <Icon name="check" size={16} /> Sin compromiso
      </span>
    </div>
  )
}
