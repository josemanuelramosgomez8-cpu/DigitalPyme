<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;

class ProjectMessageController extends Controller
{
    public function clientIndex(Request $request, Project $project)
    {
        $this->ensureClientOwnsProject($request, $project);

        return response()->json($this->messages($project));
    }

    public function clientStore(Request $request, Project $project)
    {
        $this->ensureClientOwnsProject($request, $project);

        return $this->store($request, $project);
    }

    public function adminIndex(Project $project)
    {
        return response()->json($this->messages($project));
    }

    public function adminStore(Request $request, Project $project)
    {
        return $this->store($request, $project);
    }

    private function messages(Project $project)
    {
        return $project->messages()
            ->with('user:id,name,is_admin')
            ->orderBy('id')
            ->get()
            ->map(fn ($message) => [
                'id' => $message->id,
                'body' => $message->body,
                'created_at' => $message->created_at,
                'sender_name' => $message->user->name,
                'sender_role' => $message->user->is_admin ? 'admin' : 'client',
            ]);
    }

    private function store(Request $request, Project $project)
    {
        $data = $request->validate([
            'body' => ['required', 'string', 'max:2000'],
        ]);

        $message = $project->messages()->create([
            'user_id' => $request->user()->id,
            'body' => $data['body'],
        ])->load('user:id,name,is_admin');

        return response()->json([
            'id' => $message->id,
            'body' => $message->body,
            'created_at' => $message->created_at,
            'sender_name' => $message->user->name,
            'sender_role' => $message->user->is_admin ? 'admin' : 'client',
        ], 201);
    }

    private function ensureClientOwnsProject(Request $request, Project $project): void
    {
        abort_unless($project->client_id === $request->user()->client->id, 404);
    }
}
