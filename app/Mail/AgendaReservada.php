<?php

namespace App\Mail;

use App\Models\AgendaReservation;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AgendaReservada extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public AgendaReservation $reserva) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Nueva llamada agendada: {$this->reserva->nombre}",
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.agenda-reservada');
    }
}
