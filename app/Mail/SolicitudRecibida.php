<?php

namespace App\Mail;

use App\Models\Cotizacion;
use App\Models\Lead;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SolicitudRecibida extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Lead $lead,
        public ?Cotizacion $cotizacion = null,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->cotizacion
                ? "Nueva propuesta solicitada: {$this->lead->nombre}"
                : "Nueva solicitud de contacto: {$this->lead->nombre}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.solicitud-recibida',
        );
    }
}
