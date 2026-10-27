<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureClient
{
    public function handle(Request $request, Closure $next): Response
    {
        abort_unless($request->user()?->is_client && $request->user()->client()->exists(), 403, 'No tienes permiso para realizar esta acción.');

        return $next($request);
    }
}
