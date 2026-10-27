<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteSetting extends Model
{
    protected $primaryKey = 'key';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = ['key', 'value'];

    protected function casts(): array
    {
        return ['value' => 'array'];
    }

    public static function defaults(): array
    {
        return [
            'seo' => [
                'title' => 'DigitalPyme | Agencia digital para pymes en Lima',
                'description' => 'Creamos páginas web, tiendas en línea y estrategias digitales para pymes en Lima, Perú.',
                'slug' => '',
                'og_image' => '',
            ],
            'brand' => [
                'logo_url' => '',
            ],
            'contact' => [
                'whatsapp_phone' => null,
            ],
            'theme' => [
                'dark' => '#102c2c',
                'lime' => '#c9f45b',
                'cream' => '#f6f4ed',
                'font_sans' => 'Manrope',
                'font_display' => 'Playfair Display',
            ],
            'coverage' => [
                'digital_mode' => 'virtual_presencial_lima',
                'shipping_zones' => [],
                'shipping_methods' => [
                    ['key' => 'estandar', 'nombre' => 'Estándar', 'cost' => 12, 'delivery_days' => 3, 'enabled' => true],
                    ['key' => 'express', 'nombre' => 'Express', 'cost' => 20, 'delivery_days' => 1, 'enabled' => true],
                    ['key' => 'same_day', 'nombre' => 'Same-day', 'cost' => 28, 'delivery_days' => 0, 'enabled' => true],
                ],
                'free_shipping_threshold' => 200,
            ],
            'legal' => [
                'privacy' => <<<'POLICY'
POLÍTICA DE PRIVACIDAD DE DIGITALPYME

DigitalPyme trata los datos personales que las personas comparten al solicitar información o una cotización, agendar una reunión, contratar un servicio, usar el portal de clientes, enviar una valoración o comunicarse con el equipo.

Los datos pueden incluir nombre, empresa, correo electrónico, teléfono, servicios de interés, mensajes, datos necesarios para una cuenta o proyecto, archivos compartidos y comprobantes de pago cuando corresponda. No envíes información sensible que no sea necesaria para tu solicitud.

Usamos estos datos para responder consultas, preparar propuestas, coordinar reuniones, prestar y administrar servicios, gestionar cuentas y proyectos, verificar pagos cuando corresponda, brindar soporte y cumplir obligaciones aplicables.

Solo debe acceder a los datos el personal que los necesite para esas finalidades. Para operar el sitio y prestar los servicios, puede ser necesario utilizar proveedores de alojamiento, correo, almacenamiento de archivos, comunicación o procesamiento de pagos. Cada proveedor trata los datos conforme a sus propias condiciones y medidas; algunos podrían procesarlos desde otros países.

Conservamos los datos durante el tiempo necesario para atender la solicitud y gestionar la relación de servicio, y por el tiempo adicional que exijan obligaciones legales o la resolución de reclamos. La persona puede solicitar la revisión o eliminación de sus datos, sujeta a las obligaciones que requieran conservarlos.

Para consultas sobre privacidad o para ejercer los derechos que correspondan, escribe a hola@digitalpyme.pe. Incluye información suficiente para identificar la solicitud; no envíes contraseñas ni datos completos de tarjetas de pago.

DigitalPyme aplica medidas razonables para proteger la información, aunque ningún medio de transmisión o almacenamiento puede garantizar seguridad absoluta. Los enlaces a servicios externos se rigen también por las políticas de sus respectivos proveedores.

Antes de publicar esta política, el titular del sitio debe verificar que la identidad legal del responsable, los proveedores utilizados, los plazos de conservación y el canal de atención descritos correspondan a sus prácticas reales y completar cualquier requisito legal aplicable.
POLICY,
                'privacy_published' => false,
                'warranty' => 'La garantía y el alcance del soporte se detallan en cada propuesta aprobada. Antes de contratar, confirma por escrito las condiciones aplicables a tu proyecto.',
                'terms' => 'Las propuestas describen alcance, plazos, entregables y condiciones de pago. El trabajo comienza después de la aceptación formal de la propuesta. Los pagos se gestionan desde el Portal cliente.',
                'returns' => 'Puedes solicitar la devolución de un pedido entregado desde el Portal cliente e indicar el motivo. El equipo revisará la solicitud y te informará si fue aprobada. La resolución puede ser reventa, reparación, desecho o reembolso, según la inspección y las condiciones aplicables.',
            ],
        ];
    }

    public static function publicSettings(): array
    {
        $saved = static::query()->find('public')?->value ?? [];
        $settings = array_replace_recursive(static::defaults(), $saved);
        if (
            ($settings['theme']['font_sans'] ?? null) === 'DM Sans'
            && ($settings['theme']['font_display'] ?? null) === 'DM Serif Display'
        ) {
            $settings['theme']['font_sans'] = 'Manrope';
            $settings['theme']['font_display'] = 'Playfair Display';
        }
        $settings['seo']['slug'] ??= '';
        $settings['seo']['og_image'] ??= '';
        $settings['brand']['logo_url'] ??= '';
        $settings['coverage']['shipping_methods'] ??= static::defaults()['coverage']['shipping_methods'];
        $settings['coverage']['free_shipping_threshold'] ??= static::defaults()['coverage']['free_shipping_threshold'];
        $settings['legal']['returns'] ??= static::defaults()['legal']['returns'];

        return $settings;
    }

    public static function savePublicSettings(array $settings): array
    {
        $merged = static::publicSettings();
        foreach ($settings as $section => $values) {
            $merged[$section] = is_array($values) && is_array($merged[$section] ?? null)
                ? array_replace($merged[$section], $values)
                : $values;
        }

        static::query()->updateOrCreate(
            ['key' => 'public'],
            ['value' => $merged],
        );

        return static::publicSettings();
    }
}
