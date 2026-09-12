#!/bin/sh
set -e

php artisan migrate --force

# La carga de datos iniciales es opt-in en producción.
if [ "${SEED_ON_STARTUP:-false}" = "true" ]; then
    product_count="$(php artisan tinker --execute="echo \\Illuminate\\Support\\Facades\\DB::table('productos')->count();" 2>/dev/null | tr -d '[:space:]')"
    if [ "$product_count" = "0" ]; then
        echo "No hay productos. Cargando datos iniciales..."
        php artisan db:seed --force
    fi
fi

exec "$@"
