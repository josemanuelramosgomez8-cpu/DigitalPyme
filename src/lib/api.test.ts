import { afterEach, describe, expect, it, vi } from "vitest";
import {
  adminLogin,
  createStoreOrder,
  getAdminDashboard,
  getServiceReviews,
  refreshServiceReviews,
  SESSION_EXPIRED_EVENT,
  submitProposal,
  submitServiceReview,
} from "./api";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("API client", () => {
  it("requests additional public review pages with a bounded query", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json([]));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getServiceReviews(6, 6)).resolves.toEqual([]);

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/resenas\?offset=6&limit=6$/),
      expect.objectContaining({ headers: expect.objectContaining({ Accept: "application/json" }) }),
    );
  });

  it("refreshes the approved review feed without hiding API errors", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json([{ id: 21, nombre: "Cliente" }]));
    vi.stubGlobal("fetch", fetchMock);

    await expect(refreshServiceReviews(7)).resolves.toEqual([{ id: 21, nombre: "Cliente" }]);

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/resenas\?offset=0&limit=7$/),
      expect.objectContaining({ headers: expect.objectContaining({ Accept: "application/json" }) }),
    );
  });

  it("submits a service review to the corresponding endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({ mensaje: "Reseña recibida", id: 8 }, { status: 201 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(submitServiceReview(12, {
      nombre: "Ana",
      email: "ana@example.com",
      calificacion: 5,
      comentario: "Excelente servicio",
    })).resolves.toEqual({ mensaje: "Reseña recibida", id: 8 });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/servicios\/12\/resenas$/),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          nombre: "Ana",
          email: "ana@example.com",
          calificacion: 5,
          comentario: "Excelente servicio",
        }),
      }),
    );
  });

  it("submits the preferred payment method with a public quote request", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        mensaje: "Solicitud recibida",
        inversion_estimada: null,
        metodo_pago_preferido: "card",
        email_enviado: true,
        whatsapp_url: null,
      }, { status: 201 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const payload = {
      nombre: "Ana Pérez",
      apellido: "Pérez",
      empresa: "Tienda de Ana",
      pais: "Perú",
      email: "ana@example.com",
      telefono: "+51912345678",
      servicios: ["Páginas web"],
      verification_token: "a".repeat(64),
      acepta_terminos: true,
      acepta_privacidad: true,
      website: "",
      metodo_pago_preferido: "card" as const,
      mensaje: "Preferencia referencial.",
    };

    await expect(submitProposal(payload)).resolves.toMatchObject({
      metodo_pago_preferido: "card",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/propuestas$/),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(payload),
      }),
    );
  });

  it("preserves Yape and Plin as distinct quote preferences", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        mensaje: "Solicitud recibida",
        inversion_estimada: null,
        metodo_pago_preferido: "plin",
        email_enviado: true,
        whatsapp_url: null,
      }, { status: 201 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const payload = {
      nombre: "Ana Pérez",
      apellido: "Pérez",
      empresa: "Tienda de Ana",
      pais: "Perú",
      email: "ana@example.com",
      telefono: "+51912345678",
      servicios: ["Páginas web"],
      verification_token: "b".repeat(64),
      acepta_terminos: true,
      acepta_privacidad: true,
      website: "",
      metodo_pago_preferido: "plin" as const,
      mensaje: "Método de pago preferido (referencial): Plin.",
    };

    await expect(submitProposal(payload)).resolves.toMatchObject({
      metodo_pago_preferido: "plin",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/propuestas$/),
      expect.objectContaining({ body: JSON.stringify(payload) }),
    );
  });

  it("creates a store order using the authenticated checkout endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({ id: 21, payment_status: "pendiente" }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const payload = {
      items: [{ product_id: 3, cantidad: 2 }],
      metodo_envio: "estandar" as const,
      payment_method: "bank_transfer" as const,
      ubicacion_entrega: "Lima",
      direccion_entrega: "Av. Central 123",
      telefono: "999888777",
      tipo_comprobante: "boleta" as const,
      tipo_documento: "dni" as const,
      numero_documento: "12345678",
    };

    await expect(createStoreOrder("client-token", payload))
      .resolves.toMatchObject({ id: 21 });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/client\/store\/orders$/),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(payload),
        headers: expect.objectContaining({
          Authorization: expect.stringMatching(/^Bearer /),
        }),
      }),
    );
  });

  it("clears an invalid authenticated session when the API returns 401", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 401 }));
    const dispatchEvent = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("window", { dispatchEvent });

    await expect(getAdminDashboard("expired-token", "2026-03"))
      .rejects.toThrow("Tu sesión venció o ya no es válida.");

    expect(dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: SESSION_EXPIRED_EVENT }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/admin\/dashboard\?month=2026-03$/),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: expect.stringMatching(/^Bearer /),
        }),
      }),
    );
  });

  it("does not expire an authenticated session for a rejected login", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json(
      { mensaje: "Correo o contraseña incorrectos" },
      { status: 422 },
    ));
    const dispatchEvent = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("window", { dispatchEvent });

    await expect(adminLogin("admin@example.com", "wrong-password"))
      .rejects.toThrow("Correo o contraseña incorrectos");

    expect(dispatchEvent).not.toHaveBeenCalled();
  });
});
