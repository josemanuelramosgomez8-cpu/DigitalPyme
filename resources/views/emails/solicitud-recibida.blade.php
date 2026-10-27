<h1>Nueva solicitud de DigitalPyme</h1>

<p><strong>Nombre:</strong> {{ $lead->nombre }}</p>
<p><strong>Empresa:</strong> {{ $lead->empresa ?: 'No especificada' }}</p>
<p><strong>Correo:</strong> {{ $lead->email ?: 'No especificado' }}</p>
<p><strong>Teléfono:</strong> {{ $lead->telefono ?: 'No especificado' }}</p>
<p><strong>Servicio:</strong> {{ $lead->servicio }}</p>

@if ($cotizacion)
    @if ($lead->inversion_estimada !== null)
        <p><strong>Subtotal referencial de servicios con precio publicado:</strong> S/ {{ number_format((float) $lead->inversion_estimada, 2) }}</p>
    @else
        <p><strong>Inversión:</strong> Pendiente de cotización.</p>
    @endif
    <h2>Servicios seleccionados</h2>
    <pre>{{ $cotizacion->descripcion }}</pre>
@elseif ($lead->inversion_estimada !== null)
    <p><strong>Inversión estimada:</strong> S/ {{ number_format((float) $lead->inversion_estimada, 2) }}</p>
@endif

@if ($lead->mensaje)
    <h2>Mensaje</h2>
    <p>{{ $lead->mensaje }}</p>
@endif
