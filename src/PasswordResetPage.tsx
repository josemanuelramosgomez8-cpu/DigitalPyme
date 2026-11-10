import { useState, type FormEvent } from "react";
import { resetClientPassword } from "./lib/api";

export default function PasswordResetPage() {
  const query = new URLSearchParams(window.location.search);
  const email = query.get("email") ?? "";
  const token = query.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!email || !token) {
      setError("El enlace de restablecimiento está incompleto. Solicita uno nuevo al administrador.");
      return;
    }

    setSaving(true);
    try {
      const result = await resetClientPassword({
        email,
        token,
        password,
        password_confirmation: confirmation,
      });
      setNotice(result.mensaje);
      setPassword("");
      setConfirmation("");
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : "No se pudo restablecer la contraseña.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-story">
        <div className="auth-story-copy">
          <span className="kicker kicker-light">DigitalPyme</span>
          <h1>Recupera el acceso a tu cuenta.</h1>
          <p>Elige una nueva contraseña personal y segura para continuar usando tu portal de cliente.</p>
        </div>
      </section>
      <section className="auth-form-wrap">
        <form className="auth-form" onSubmit={(event) => void submit(event)}>
          <span className="kicker">Seguridad de la cuenta</span>
          <h2>Nueva contraseña</h2>
          <p>Cuenta: {email || "enlace incompleto"}</p>
          <label>Nueva contraseña<input type="password" autoComplete="new-password" minLength={12} required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
          <label>Confirmar contraseña<input type="password" autoComplete="new-password" minLength={12} required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></label>
          {error && <p className="form-status error">{error}</p>}
          {notice && <p className="form-status success">{notice}</p>}
          <button className="button" type="submit" disabled={saving}>{saving ? "Actualizando..." : "Restablecer contraseña"}</button>
          {notice && <a className="button button-secondary" href="/">Volver al inicio</a>}
        </form>
      </section>
    </main>
  );
}
