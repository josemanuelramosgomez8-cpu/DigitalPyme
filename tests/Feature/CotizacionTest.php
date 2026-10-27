<?php

namespace Tests\Feature;

use App\Models\Cotizacion;
use App\Models\Lead;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CotizacionTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_a_quote_for_a_lead_and_move_it_to_quoted(): void
    {
        $this->actingAs(User::factory()->create(['is_admin' => true]));
        $lead = $this->createLead();

        $response = $this->postJson("/api/leads/{$lead->id}/cotizaciones", [
            'servicio' => 'Página web',
            'descripcion' => 'Sitio corporativo',
            'monto' => 1800,
        ]);

        $response->assertCreated()
            ->assertJsonPath('lead_id', $lead->id)
            ->assertJsonPath('servicio', 'Página web')
            ->assertJsonPath('estado', 'borrador')
            ->assertJsonPath('monto', '1800.00');

        $this->assertDatabaseHas('cotizaciones', [
            'lead_id' => $lead->id,
            'servicio' => 'Página web',
            'estado' => 'borrador',
        ]);
        $this->assertDatabaseHas('leads', ['id' => $lead->id, 'estado' => 'cotizado']);
    }

    public function test_invalid_quote_data_is_rejected_without_creating_a_quote(): void
    {
        $this->actingAs(User::factory()->create(['is_admin' => true]));
        $lead = $this->createLead();

        $this->postJson("/api/leads/{$lead->id}/cotizaciones", [
            'servicio' => '',
            'monto' => -1,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['servicio', 'monto']);

        $this->assertDatabaseCount('cotizaciones', 0);
        $this->assertDatabaseHas('leads', ['id' => $lead->id, 'estado' => 'nuevo']);
    }

    public function test_accepting_a_quote_marks_the_lead_as_won(): void
    {
        $this->actingAs(User::factory()->create(['is_admin' => true]));
        $lead = $this->createLead(['estado' => 'cotizado']);
        $quote = $this->createQuote($lead);

        $this->patchJson("/api/cotizaciones/{$quote->id}", ['estado' => 'aceptada'])
            ->assertOk()
            ->assertJsonPath('estado', 'aceptada');

        $this->assertDatabaseHas('leads', ['id' => $lead->id, 'estado' => 'ganado']);
    }

    public function test_rejecting_the_last_accepted_quote_returns_a_won_lead_to_quoted(): void
    {
        $this->actingAs(User::factory()->create(['is_admin' => true]));
        $lead = $this->createLead(['estado' => 'ganado']);
        $quote = $this->createQuote($lead, ['estado' => 'aceptada']);

        $this->patchJson("/api/cotizaciones/{$quote->id}", ['estado' => 'rechazada'])
            ->assertOk()
            ->assertJsonPath('estado', 'rechazada');

        $this->assertDatabaseHas('leads', ['id' => $lead->id, 'estado' => 'cotizado']);
    }

    public function test_another_accepted_quote_keeps_the_lead_won(): void
    {
        $this->actingAs(User::factory()->create(['is_admin' => true]));
        $lead = $this->createLead(['estado' => 'cotizado']);
        $acceptedQuote = $this->createQuote($lead);
        $this->patchJson("/api/cotizaciones/{$acceptedQuote->id}", ['estado' => 'aceptada'])
            ->assertOk();
        $quote = $this->createQuote($lead);

        $this->patchJson("/api/cotizaciones/{$quote->id}", ['estado' => 'rechazada'])
            ->assertOk();

        $this->assertDatabaseHas('leads', ['id' => $lead->id, 'estado' => 'ganado']);
        $this->assertDatabaseMissing('projects', ['cotizacion_id' => $quote->id]);
        $this->assertDatabaseHas('projects', ['cotizacion_id' => $acceptedQuote->id]);
    }

    public function test_invalid_quote_status_is_rejected(): void
    {
        $this->actingAs(User::factory()->create(['is_admin' => true]));
        $quote = $this->createQuote($this->createLead());

        $this->patchJson("/api/cotizaciones/{$quote->id}", ['estado' => 'cancelada'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['estado']);
    }

    private function createLead(array $attributes = []): Lead
    {
        return Lead::create(array_merge([
            'nombre' => 'Cliente de prueba',
            'email' => 'cliente@example.com',
            'servicio' => 'Página web',
        ], $attributes));
    }

    private function createQuote(Lead $lead, array $attributes = []): Cotizacion
    {
        return $lead->cotizaciones()->create(array_merge([
            'servicio' => 'Página web',
            'monto' => 1800,
        ], $attributes));
    }
}
