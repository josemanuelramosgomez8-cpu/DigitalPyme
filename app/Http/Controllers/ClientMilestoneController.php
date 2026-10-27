<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\ProjectMilestone;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ClientMilestoneController extends Controller
{
    public function approve(Request $request, Project $project, ProjectMilestone $milestone)
    {
        abort_unless($project->client_id === $request->user()->client->id, 404);
        abort_unless($milestone->project_id === $project->id, 404);

        if ($milestone->estado !== 'pendiente_aprobacion') {
            throw ValidationException::withMessages([
                'hito' => 'Este hito no está pendiente de aprobación.',
            ]);
        }

        $milestone->update([
            'estado' => 'aprobado',
            'approved_at' => now(),
        ]);

        return response()->json($milestone->refresh());
    }
}
