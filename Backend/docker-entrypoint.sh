#!/bin/sh
set -e

php artisan migrate --force

# Carga los datos iniciales solo en una base de datos sin productos.
if ! php artisan tinker --execute="exit(\\Illuminate\\Support\\Facades\\DB::table('productos')->exists() ? 0 : 1);" >/dev/null 2>&1; then
    php artisan db:seed --force
fi

exec "$@"
