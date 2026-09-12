#!/bin/sh
set -e

php artisan migrate --force

# Carga los datos iniciales solo en una base de datos sin productos.
product_count="$(php artisan tinker --execute="echo \\Illuminate\\Support\\Facades\\DB::table('productos')->count();" 2>/dev/null | tr -d '[:space:]')"
if [ "$product_count" = "0" ]; then
    echo "No hay productos. Cargando datos iniciales..."
    php artisan db:seed --force
fi

exec "$@"
