#!/bin/sh

echo "🚀 Starting backend with auto-seed..."

# Ejecutar seed antes de iniciar el servidor
echo "🌱 Running database seed..."
node scripts/seed-database.js || echo "⚠️ Seed failed or already executed"

# Iniciar el servidor
echo "🎯 Starting server..."
exec node app.js
