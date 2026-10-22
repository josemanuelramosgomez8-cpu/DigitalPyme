<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Administrator account

After configuring the database and running migrations, create or update the administrator account with:

```bash
php artisan admin:password admin@example.com
```

The command prompts for the account name and a new password without displaying the password. Use an email address you control. Administrator accounts are marked locally in the database; ordinary users cannot access admin routes. Running the database seeder no longer creates or resets a default administrator password.

Open the separate administration interface at `http://localhost:8443/?admin=1` and sign in with the administrator account. The panel includes operational metrics, lead and quote management, project progress, agenda slots and reservations, transfer receipt review, and CRUD for services, portfolio projects, and testimonials. It reuses the existing API and styling without adding an admin link to the public navigation.

The protected dashboard metrics endpoint is `GET /api/admin/dashboard?month=YYYY-MM`. It reports lead and quote counts, project status totals, payments awaiting verification, confirmed payment totals, reservations in the selected month, and configured monthly project capacity.

### SEO, brand, and coverage settings

Apply the settings table with `php artisan migrate`. Public SEO and theme configuration is available at `GET /api/site-settings`; administrators update it with `PUT /api/admin/site-settings`. The admin panel's **SEO y tema** tab edits the SEO title and description, friendly slug, Open Graph image, brand logo, color palette, typography, digital service modality, and configurable online-store shipping zones.

The starting theme defaults to the existing dark green (`#102c2c`), lime (`#c9f45b`), cream (`#f6f4ed`), DM Sans, and DM Serif Display. Supported font names are selected from a fixed allowlist. `GET /api/cobertura?servicio=Tiendas%20en%20linea&ubicacion=Lima` returns a configured shipping fee and delivery estimate; other digital services return whether they are virtual or also available in person in Lima. Add only real, verified shipping locations and prices in the panel.

Laravel serves `/sitemap.xml` and `/robots.txt`; set `FRONTEND_URL` to the deployed frontend origin so sitemap links use the public site. If frontend and backend use different hosts, configure the frontend web server to proxy `/sitemap.xml` and `/robots.txt` to Laravel, so crawlers find them on the public site host. An editable slug is used as the canonical URL and sitemap entry. Configure the frontend host to rewrite that slug path to the SPA's `index.html` (Vite's development server already falls back to the SPA). Portfolio images already have editable alt text and a generated fallback description when the field is empty.

## Clients and projects

Administrators can convert a lead into a client with `POST /api/leads/{lead}/client`; the lead must have an email address (or an `email` can be supplied in the request). A random password is created and never returned. Set the client's initial password on the server with:

```bash
php artisan client:password client@example.com
```

Clients sign in at `POST /api/client/login` and can only read their own projects at `GET /api/client/projects` and `GET /api/client/projects/{project}`. They can change their password with `PUT /api/client/password`, providing `current_password`, `password`, and `password_confirmation`.

Accepting a quote creates its client account if needed and creates one project for that quote. The client needs an email address before the quote can be accepted. Administrators can list, create, and update projects at `/api/admin/projects`; valid project states are `planificacion`, `en_progreso`, `revision`, `completado`, and `pausado`.

### Project documents

Clients can list and upload documents only for their own projects. Administrators can list, upload, download, and delete documents for any project. Uploads accept PDF, JPG/JPEG, PNG, DOC/DOCX, and XLS/XLSX files up to 10 MB. Documents are stored on Laravel's private `local` disk and downloaded through authenticated routes; the storage path is not returned by the API.

- Client: `GET` and `POST /api/client/projects/{project}/documents`
- Client download: `GET /api/client/projects/{project}/documents/{document}/download`
- Admin: `GET`, `POST`, and `DELETE /api/admin/projects/{project}/documents[/{document}]`
- Admin download: `GET /api/admin/projects/{project}/documents/{document}/download`

### Project messages

Clients and administrators can exchange plain-text messages in a project-specific conversation. Client routes only expose projects owned by the authenticated client; administrative routes require an administrator account. Messages are limited to 2,000 characters and are returned in chronological order. The client portal has a **Mensajes** section, and administrators can select a project in the admin **Mensajes** tab.

- Client: `GET` and `POST /api/client/projects/{project}/messages`
- Admin: `GET` and `POST /api/admin/projects/{project}/messages`

### Project payments

The client portal records full-project and approved-milestone payments in Peruvian soles. Bank-transfer payments remain pending until the client uploads a PDF/JPG/PNG receipt and an administrator verifies or rejects it. Receipts are stored on the private `local` disk and must be downloaded through authenticated project-document routes.

- Client payment options/history: `GET /api/client/projects/{project}/payments`
- Start a transfer: `POST /api/client/projects/{project}/payments/transfers` (optional `milestone_id`)
- Upload transfer receipt: `POST /api/client/projects/{project}/payments/{payment}/receipt` (`multipart/form-data`, `file`)
- Start hosted card checkout: `POST /api/client/projects/{project}/payments/card` (optional `milestone_id`)
- Mercado Pago notification: `POST /api/payments/mercadopago/webhook`
- Admin review queue: `GET /api/admin/payments?status=comprobante_enviado`
- Admin verify/reject a transfer: `PATCH /api/admin/payments/{payment}` with `{"status":"pagado"}` or `{"status":"rechazado"}`

Card checkout uses Mercado Pago Checkout Pro, which hosts card entry and supports Visa/Mastercard. No card details or provider credentials are stored by this application. To enable it, configure a real `MERCADOPAGO_ACCESS_TOKEN`, a publicly reachable `MERCADOPAGO_WEBHOOK_URL`, and `PAYMENT_RETURN_URL` in the backend `.env`. The webhook verifies each notification against Mercado Pago's Payments API and checks its reference, amount, and currency before marking a payment as paid. Keep the access token server-side and use the provider's test credentials before switching to production credentials. Without the access token, card checkout responds as unavailable; it never simulates a successful payment.

Configure `BANK_TRANSFER_BANK`, `BANK_TRANSFER_HOLDER`, `BANK_TRANSFER_ACCOUNT`, and `BANK_TRANSFER_CCI` to show transfer instructions in the authenticated client portal. Apply schema updates with `php artisan migrate`.

Payment creation is serialized per project to prevent duplicate or over-budget full-project and milestone charges. Only approved milestones with a configured amount can be paid. The admin payment API is available; the visual administration panel is covered in the administrator-panel implementation step.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework. You can also check out [Laravel Learn](https://laravel.com/learn), where you will be guided through building a modern Laravel application.

If you don't feel like reading, [Laracasts](https://laracasts.com) can help. Laracasts contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

## Laravel Sponsors

We would like to extend our thanks to the following sponsors for funding Laravel development. If you are interested in becoming a sponsor, please visit the [Laravel Partners program](https://partners.laravel.com).

### Premium Partners

- **[Vehikl](https://vehikl.com)**
- **[Tighten Co.](https://tighten.co)**
- **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**
- **[64 Robots](https://64robots.com)**
- **[Curotec](https://www.curotec.com/services/technologies/laravel)**
- **[DevSquad](https://devsquad.com/hire-laravel-developers)**
- **[Redberry](https://redberry.international/laravel-development)**
- **[Active Logic](https://activelogic.com)**

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
