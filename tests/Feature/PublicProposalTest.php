<?php

namespace Tests\Feature;

use App\Mail\SolicitudRecibida;
use App\Models\Lead;
use App\Models\Servicio;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class PublicProposalTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config(['mail.default' => 'smtp']);
    }

    public function test_public_proposal_creates_lead_and_quote_using_server_side_prices(): void
    {
        Mail::fake();
        $this->seed();
        Servicio::where('nombre', 'Páginas web')->update(['precio_desde' => 1800]);

        $response = $this->postJson('/api/propuestas', [
            'nombre' => 'Ana Pérez',
            'empresa' => 'Tienda de Ana',
            'email' => 'ana@example.com',
            'servicios' => ['Páginas web', 'Tiendas en línea'],
            'mensaje' => 'Necesito vender mis productos en línea.',
            'inversion_estimada' => 1,
        ]);

        $response->assertCreated()
            ->assertJsonPath('inversion_estimada', 1800)
            ->assertJsonPath('incluye_servicios_a_cotizar', true)
            ->assertJsonPath('email_enviado', true);

        $this->assertDatabaseHas('leads', [
            'nombre' => 'Ana Pérez',
            'servicio' => 'Propuesta personalizada',
            'inversion_estimada' => 1800,
        ]);
        $this->assertDatabaseHas('cotizaciones', [
            'lead_id' => Lead::where('email', 'ana@example.com')->value('id'),
            'servicio' => 'Proyecto personalizado',
            'monto' => 1800,
            'estado' => 'borrador',
        ]);

        Mail::assertSent(SolicitudRecibida::class, function (SolicitudRecibida $mail) {
            return $mail->lead->email === 'ana@example.com'
                && $mail->cotizacion?->monto === '1800.00';
        });
    }

    public function test_invalid_or_inactive_services_do_not_create_a_lead_or_quote(): void
    {
        $this->seed();
        Servicio::where('nombre', 'Páginas web')->update(['activo' => false]);

        $this->postJson('/api/propuestas', [
            'nombre' => 'Ana Pérez',
            'email' => 'ana@example.com',
            'servicios' => ['Páginas web'],
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['servicios']);

        $this->assertDatabaseCount('leads', 0);
        $this->assertDatabaseCount('cotizaciones', 0);
    }

    public function test_contact_lead_stores_estimate_from_the_active_service_and_notifies(): void
    {
        Mail::fake();
        $this->seed();
        Servicio::where('nombre', 'Branding')->update(['precio_desde' => 1200]);

        $response = $this->postJson('/api/leads', [
            'nombre' => 'Luis Rojas',
            'telefono' => '987654321',
            'servicio' => 'Branding',
            'inversion_estimada' => 1,
        ]);

        $response->assertCreated()
            ->assertJsonPath('lead.inversion_estimada', '1200.00')
            ->assertJsonPath('email_enviado', true);

        $this->assertDatabaseHas('leads', [
            'nombre' => 'Luis Rojas',
            'servicio' => 'Branding',
            'inversion_estimada' => 1200,
        ]);
        Mail::assertSent(SolicitudRecibida::class, fn (SolicitudRecibida $mail) => $mail->lead->nombre === 'Luis Rojas');
    }

    public function test_seeded_services_have_no_unconfirmed_prices_or_timelines(): void
    {
        $this->seed();

        $this->getJson('/api/servicios')->assertOk()
            ->assertJsonPath('0.precio_desde', null)
            ->assertJsonPath('0.duracion', null);

        $this->assertSame(0, Servicio::whereNotNull('precio_desde')->count());
        $this->assertSame(0, Servicio::whereNotNull('duracion')->count());
    }

    public function test_proposal_whatsapp_link_uses_only_the_configured_public_contact(): void
    {
        Mail::fake();
        $this->seed();
        $payload = [
            'nombre' => 'Cliente de prueba',
            'email' => 'cliente@example.com',
            'servicios' => ['Páginas web'],
        ];

        $this->postJson('/api/propuestas', $payload)
            ->assertCreated()
            ->assertJsonPath('whatsapp_url', null);

        $this->actingAs(User::factory()->create(['is_admin' => true]))
            ->putJson('/api/admin/site-settings', [
                'contact' => ['whatsapp_phone' => '+51912345678'],
            ])->assertOk();

        $response = $this->postJson('/api/propuestas', [
            ...$payload,
            'email' => 'otro@example.com',
        ])->assertCreated();

        $this->assertStringStartsWith(
            'https://wa.me/51912345678?text=',
            $response->json('whatsapp_url'),
        );

        parse_str((string) parse_url($response->json('whatsapp_url'), PHP_URL_QUERY), $query);
        $this->assertStringContainsString('Inversión pendiente de cotizar.', $query['text']);
        $this->assertStringNotContainsString('S/ 0.00', $query['text']);
    }

    public function test_proposal_without_published_prices_is_marked_as_pending_instead_of_zero(): void
    {
        Mail::fake();
        $this->seed();

        $this->postJson('/api/propuestas', [
            'nombre' => 'Cliente de prueba',
            'email' => 'cliente@example.com',
            'servicios' => ['Páginas web'],
        ])->assertCreated()
            ->assertJsonPath('inversion_estimada', null)
            ->assertJsonPath('incluye_servicios_a_cotizar', true);

        $this->assertDatabaseHas('leads', [
            'email' => 'cliente@example.com',
            'inversion_estimada' => null,
        ]);

        Mail::assertSent(SolicitudRecibida::class, function (SolicitudRecibida $mail) {
            $html = $mail->render();

            return str_contains($html, 'Pendiente de cotización.')
                && !str_contains($html, 'S/ 0.00');
        });
    }
}
