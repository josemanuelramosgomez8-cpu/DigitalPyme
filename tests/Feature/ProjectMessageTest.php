<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Lead;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectMessageTest extends TestCase
{
    use RefreshDatabase;

    public function test_client_and_admin_can_exchange_project_messages(): void
    {
        [$client, $project] = $this->clientProject();
        $admin = User::factory()->create(['is_admin' => true]);

        $this->actingAs($client)
            ->postJson("/api/client/projects/{$project->id}/messages", ['body' => 'Hola, ¿cómo va el proyecto?'])
            ->assertCreated()
            ->assertJsonPath('body', 'Hola, ¿cómo va el proyecto?')
            ->assertJsonPath('sender_role', 'client');

        $this->actingAs($admin)
            ->postJson("/api/admin/projects/{$project->id}/messages", ['body' => 'Va avanzando correctamente.'])
            ->assertCreated()
            ->assertJsonPath('sender_role', 'admin');

        $this->actingAs($client)
            ->getJson("/api/client/projects/{$project->id}/messages")
            ->assertOk()
            ->assertJsonCount(2)
            ->assertJsonPath('0.sender_name', $client->name)
            ->assertJsonPath('1.sender_name', $admin->name)
            ->assertJsonPath('1.body', 'Va avanzando correctamente.');
    }

    public function test_client_cannot_view_or_send_messages_for_another_clients_project(): void
    {
        [$client] = $this->clientProject('one@example.com');
        [, $otherProject] = $this->clientProject('two@example.com');

        $this->actingAs($client)
            ->getJson("/api/client/projects/{$otherProject->id}/messages")
            ->assertNotFound();

        $this->postJson("/api/client/projects/{$otherProject->id}/messages", ['body' => 'No autorizado'])
            ->assertNotFound();

        $this->assertDatabaseCount('project_messages', 0);
    }

    public function test_messages_require_non_empty_text_up_to_2000_characters(): void
    {
        [$client, $project] = $this->clientProject();
        $this->actingAs($client);

        $this->postJson("/api/client/projects/{$project->id}/messages", ['body' => ''])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['body']);

        $this->postJson("/api/client/projects/{$project->id}/messages", ['body' => str_repeat('a', 2001)])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['body']);

        $this->assertDatabaseCount('project_messages', 0);
    }

    public function test_non_admin_cannot_access_admin_project_messages(): void
    {
        [$client, $project] = $this->clientProject();
        $this->actingAs($client);

        $this->getJson("/api/admin/projects/{$project->id}/messages")->assertForbidden();
        $this->postJson("/api/admin/projects/{$project->id}/messages", ['body' => 'No autorizado'])
            ->assertForbidden();
    }

    private function clientProject(string $email = 'client@example.com'): array
    {
        $lead = Lead::create([
            'nombre' => 'Cliente de prueba',
            'email' => $email,
            'servicio' => 'Página web',
        ]);
        $user = User::factory()->create(['email' => $email, 'is_client' => true]);
        $client = Client::create([
            'user_id' => $user->id,
            'lead_id' => $lead->id,
            'nombre' => $lead->nombre,
        ]);
        $project = Project::create([
            'client_id' => $client->id,
            'nombre' => 'Proyecto de prueba',
        ]);

        return [$user, $project];
    }
}
