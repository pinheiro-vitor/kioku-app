#!/bin/sh
set -e

echo "🚀 Running automatic migrations..."
php artisan migrate --force

echo "✅ Migrations completed. Starting Apache..."
exec apache2-foreground
