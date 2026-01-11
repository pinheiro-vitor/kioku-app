#!/bin/sh
set -e

echo "🚀 Running automatic migrations..."
# Create a direct connection URL for migrations (remove -pooler from host if present)
MIGRATION_DB_URL=$(echo "$DATABASE_URL" | sed 's/-pooler//g')
DATABASE_URL="$MIGRATION_DB_URL" php artisan migrate --force

echo "✅ Migrations completed. Starting Apache..."
exec apache2-foreground
