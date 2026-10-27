<h1>Nueva llamada agendada</h1>

<p><strong>Nombre:</strong> {{ $reserva->nombre }}</p>
<p><strong>Correo:</strong> {{ $reserva->email ?: 'No especificado' }}</p>
<p><strong>Teléfono:</strong> {{ $reserva->telefono ?: 'No especificado' }}</p>
<p>
    <strong>Fecha y hora:</strong>
    {{ $reserva->slot->date->format('d/m/Y') }} a las {{ substr($reserva->slot->time, 0, 5) }}
    (hora de Lima, GMT-5)
</p>
