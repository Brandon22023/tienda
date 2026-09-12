FROM composer:2 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --prefer-dist --no-progress --no-scripts --optimize-autoloader

FROM php:8.2-cli-alpine
WORKDIR /var/www/html

RUN apk add --no-cache icu-libs oniguruma libzip \
    && apk add --no-cache --virtual .build-deps $PHPIZE_DEPS icu-dev oniguruma-dev libzip-dev \
    && docker-php-ext-install bcmath intl mbstring opcache pdo_mysql \
    && apk del .build-deps

COPY --from=vendor /app/vendor ./vendor
COPY . .

RUN mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs \
    && chown -R www-data:www-data storage bootstrap/cache

EXPOSE 8000
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
