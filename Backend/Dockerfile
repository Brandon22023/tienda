# Keep Composer's PHP version aligned with the application runtime. The current
# lock file contains packages that support PHP 8.1 through 8.4, while the
# floating composer:2 image can move to PHP 8.5 and reject the lock file.
FROM composer:2.8 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --prefer-dist --no-progress --no-scripts --optimize-autoloader

FROM php:8.2-cli-alpine
WORKDIR /var/www/html

RUN apk add --no-cache icu-libs oniguruma libzip libpq \
    && apk add --no-cache --virtual .build-deps $PHPIZE_DEPS icu-dev oniguruma-dev libzip-dev postgresql-dev \
    && docker-php-ext-install bcmath intl mbstring opcache pdo_mysql pdo_pgsql \
    && apk del .build-deps

COPY --from=vendor /app/vendor ./vendor
COPY . .
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint

RUN mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs \
    && chmod +x /usr/local/bin/docker-entrypoint \
    && chown -R www-data:www-data storage bootstrap/cache

EXPOSE 8000
ENTRYPOINT ["/usr/local/bin/docker-entrypoint"]
CMD ["sh", "-c", "php artisan serve --host=0.0.0.0 --port=${PORT:-8000}"]
