#!/bin/bash

echo "🚀 Instalando Team Memory MCP Server Globalmente"
echo "================================================="

# Verificar que estamos en el directorio correcto
if [ ! -f "src/server.js" ]; then
    echo "❌ Error: Ejecuta este script desde la raíz del proyecto mcp-team-memory"
    exit 1
fi

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js no está instalado"
    exit 1
fi

echo "📦 Instalando dependencias..."
npm install

echo "🔧 Creando enlace simbólico global..."
npm link

echo "⚙️  Configurando MCP global..."

# Crear directorio global si no existe
mkdir -p ~/.cursor

# Configuración global
cat > ~/.cursor/mcp.json << 'EOF'
{
  "mcpServers": {
    "memory": {
      "command": "team-memory-mcp",
      "args": [],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
EOF

echo "🔑 Verificando configuración de API key..."
if [ ! -f ".env" ]; then
    echo "⚠️  Archivo .env no encontrado. Copiando ejemplo..."
    cp .env.example .env
    echo "✏️  Edita el archivo .env con tu API key de Supermemory.ai"
fi

echo ""
echo "✅ Instalación completada!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Edita ~/.cursor/mcp.json si necesitas variables de entorno personalizadas"
echo "2. Configura SUPERMEMORY_API_KEY en tu .env"
echo "3. Reinicia Cursor completamente"
echo ""
echo "🎯 El MCP estará disponible globalmente en todos tus proyectos de Cursor"