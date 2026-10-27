<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $services = [
            'Páginas web' => [
                'previous_description' => 'Sitios rápidos que explican tu valor y convierten visitas en oportunidades.',
                'descripcion' => 'Diseño y desarrollo de sitios web adaptables, con páginas acordadas, formulario de contacto y configuración SEO básica.',
                'descripcion_larga' => 'Planificamos y desarrollamos un sitio web adaptable a móviles y computadoras. El alcance se define según las páginas y necesidades acordadas para cada proyecto.',
                'incluye' => [
                    'Estructura y diseño adaptable para las páginas acordadas.',
                    'Desarrollo de las páginas incluidas en la propuesta.',
                    'Formulario de contacto.',
                    'Configuración SEO básica.',
                ],
            ],
            'Tiendas en línea' => [
                'previous_description' => 'Una experiencia de compra simple, conectada y lista para vender.',
                'descripcion' => 'Diseño y desarrollo de tiendas en línea con catálogo, carrito y gestión de pedidos.',
                'descripcion_larga' => 'Creamos una experiencia de compra en línea con catálogo de productos, carrito y flujo de pedidos. Los métodos de pago y envío se configuran según lo acordado para el proyecto.',
                'incluye' => [
                    'Catálogo de productos y páginas de producto.',
                    'Carrito y flujo de pedidos.',
                    'Configuración de los métodos de pago acordados.',
                    'Configuración de las opciones de envío acordadas.',
                ],
            ],
            'Branding' => [
                'previous_description' => 'Una identidad memorable que proyecta confianza desde el primer contacto.',
                'descripcion' => 'Desarrollo de una identidad visual coherente con tu marca y las aplicaciones acordadas.',
                'descripcion_larga' => 'Definimos una línea visual para comunicar tu marca con coherencia. Las propuestas, revisiones y aplicaciones se detallan en el alcance aprobado antes de iniciar.',
                'incluye' => [
                    'Definición de una línea visual para la marca.',
                    'Logotipo y versiones en los formatos acordados.',
                    'Paleta de colores y selección tipográfica.',
                    'Aplicaciones de marca definidas en la propuesta.',
                ],
            ],
            'Marketing digital' => [
                'previous_description' => 'Campañas enfocadas en atraer, medir y convertir clientes reales.',
                'descripcion' => 'Diagnóstico y planificación de acciones digitales según tus objetivos y los canales acordados.',
                'descripcion_larga' => 'Revisamos los objetivos del negocio y preparamos un plan de acciones digitales. Los canales, la frecuencia y los entregables se definen en la propuesta de cada proyecto.',
                'incluye' => [
                    'Diagnóstico inicial de objetivos y presencia digital.',
                    'Plan de acciones para los canales acordados.',
                    'Frecuencia y entregables definidos en la propuesta.',
                ],
            ],
            'Mantenimiento' => [
                'previous_description' => 'Tu web segura, actualizada y acompañada por un equipo que responde.',
                'descripcion' => 'Actualizaciones y revisiones técnicas de tu sitio web, según la frecuencia y el alcance acordados.',
                'descripcion_larga' => 'Mantenemos y revisamos técnicamente tu sitio web con la frecuencia definida para el servicio. El alcance específico se acuerda antes de iniciar.',
                'incluye' => [
                    'Actualizaciones contempladas en el alcance acordado.',
                    'Revisiones técnicas con la frecuencia definida en la propuesta.',
                ],
            ],
        ];

        foreach ($services as $name => $service) {
            DB::table('servicios')
                ->where('nombre', $name)
                ->where('descripcion', $service['previous_description'])
                ->whereNull('descripcion_larga')
                ->whereNull('incluye')
                ->update([
                    'descripcion' => $service['descripcion'],
                    'descripcion_larga' => $service['descripcion_larga'],
                    'incluye' => json_encode($service['incluye'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                ]);
        }
    }

    public function down(): void
    {
        // Keep approved service content and preserve any edits made after deployment.
    }
};
