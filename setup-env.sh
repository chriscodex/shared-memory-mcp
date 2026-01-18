#!/bin/bash

echo "🔧 Configurando Variables de Entorno Globales"
echo "============================================="

# Verificar si existe .env en el directorio actual
if [ -f ".env" ]; then
    echo "✅ Archivo .env encontrado"

    # Leer variables del .env
    SUPERMEMORY_API_KEY=$(grep "SUPERMEMORY_API_KEY" .env | cut -d'=' -f2)
    SUPERMEMORY_BASE_URL=$(grep "SUPERMEMORY_BASE_URL" .env | cut -d'=' -f2)

    if [ -z "$SUPERMEMORY_API_KEY" ]; then
        echo "❌ SUPERMEMORY_API_KEY no encontrada en .env"
        echo "Por favor configura tu API key primero"
        exit 1
    fi

    echo "🔑 API Key encontrada: ${SUPERMEMORY_API_KEY:0:20}..."
    echo "🌐 Base URL: ${SUPERMEMORY_BASE_URL:-https://api.supermemory.ai/v4}"

    # Actualizar configuración global
    cat > ~/.cursor/mcp.json << EOF
{
  "mcpServers": {
    "memory": {
      "command": "team-memory-mcp",
      "args": [],
      "env": {
        "NODE_ENV": "production",
        "SUPERMEMORY_API_KEY": "$SUPERMEMORY_API_KEY",
        "SUPERMEMORY_BASE_URL": "${SUPERMEMORY_BASE_URL:-https://api.supermemory.ai/v4}"
      }
    }
  }
}
EOF

    echo "✅ Configuración global actualizada!"
    echo ""
    echo "📋 Próximos pasos:"
    echo "1. Reinicia Cursor completamente"
    echo "2. El MCP funcionará con almacenamiento permanente"

else
    echo "❌ Archivo .env no encontrado"
    echo "Ejecuta este script desde el directorio del proyecto mcp-team-memory"
    exit 1
fi