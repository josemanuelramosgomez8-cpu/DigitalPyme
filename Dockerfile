FROM php:8.2-apache

# Instalar dependencias del sistema y extensiones de PHP necesarias para Laravel
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip

RUN apt-get clean && rm -rf /var/lib/apt/lists/*

RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Instalar Node.js (necesario para compilar los assets con Vite)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Configurar directorio de trabajo
WORKDIR /var/www/html

# Copiar todo el código del proyecto
COPY . .

# Configurar Apache para que apunte a la carpeta public de Laravel
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf

RUN a2enmod rewrite

# Instalar dependencias de PHP y compilar con npm
RUN composer install --no-dev --optimize-autoloader
RUN npm install && npm run build

# Dar permisos a las carpetas de almacenamiento y caché de Laravel
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

EXPOSE 80