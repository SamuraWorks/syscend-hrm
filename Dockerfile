# ─────────────────────────────────────────────────────────────
#  Syscend-HRM — production image (php-fpm + compiled assets)
# ─────────────────────────────────────────────────────────────
FROM php:8.3-fpm-alpine AS base

# System deps + PHP extensions required by Laravel / nwidart modules
RUN apk add --no-cache \
        libzip-dev zip unzip icu-dev oniguruma-dev \
        freetype libpng libjpeg-turbo freetype-dev libpng-dev libjpeg-turbo-dev \
        libxml2-dev curl-dev git bash netcat-openbsd mariadb-client \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" \
        pdo_mysql mbstring exif pcntl bcmath intl gd zip opcache \
    && docker-php-ext-enable opcache

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# ── Build stage: install composer deps + compile the frontend ──
FROM base AS build

# Bash available for modules scaffolding
RUN apk add --no-cache nodejs npm

COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --no-progress --prefer-dist --optimize-autoloader

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build

# ── Runtime stage ──
FROM base AS runtime

ENV APP_ENV=production

RUN apk add --no-cache supervisor

COPY --from=build /app /app

RUN php artisan package:discover --ansi \
    && php artisan storage:link \
    && chown -R www-data:www-data /app/storage /app/bootstrap/cache /app/public

EXPOSE 9000

CMD ["php-fpm"]