# Team Memory MCP Server

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)

**Memoria compartida global para equipos usando Cursor + Supermemory.ai**

Permite a los agentes de Cursor almacenar y recuperar conocimientos, decisiones y contexto del proyecto de forma persistente desde cualquier proyecto.

## 🚀 Instalación Global (Recomendado)

### Opción 1: Instalación Automática
```bash
# Desde la raíz del proyecto
./install-global.sh
```

### Opción 2: Instalación Manual
```bash
# Instalar dependencias
npm install

# Crear enlace simbólico global
npm link

# Configurar MCP global
mkdir -p ~/.cursor
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
```

### Configurar API Key y Variables
```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tu API key de Supermemory.ai
# SUPERMEMORY_API_KEY=tu_api_key_aqui

# Configurar variables globales
./setup-env.sh
```

### Obtener API Key
1. Ve a [Supermemory.ai](https://supermemory.ai/)
2. Regístrate y obtén tu API key gratuita
3. Pégala en el archivo `.env`
4. Ejecuta `./setup-env.sh` para configurar globalmente

### ¡Listo! ✅
Reinicia Cursor completamente y los agentes tendrán acceso global a:
- `memory/team_memory_search` 🔍 - Buscar información
- `memory/team_memory_store` 💾 - Guardar información

**Estado:** ✅ Instalación global probada y funcionando
**API:** ✅ Variables de entorno configuradas correctamente

> **Nota:** Si ves mensajes de "modo demo", ejecuta `./setup-env.sh` para configurar las variables globales.

## 📋 Requisitos

- **Node.js** >= 18.0.0
- **Cursor IDE**
- **API Key** de Supermemory.ai (gratuita)

## 🌍 Instalación Local vs Global

### 🔗 **Global (Recomendado)**
- ✅ Disponible en **todos los proyectos** de Cursor
- ✅ No necesitas tener el proyecto abierto
- ✅ Una sola instalación para todo el equipo
- ⚠️ Requiere enlace simbólico global

### 📁 **Local (Por Proyecto)**
- ✅ Simple de configurar
- ✅ Aislado por proyecto
- ❌ Solo funciona cuando el proyecto está abierto
- ❌ Necesitas configurar en cada proyecto

**Recomendación:** Usa instalación global para equipos.

## 💡 Uso con Agentes

### Buscar información
```
Busca en la memoria del equipo sobre "autenticación JWT"
¿Hay información guardada sobre configuración de base de datos?
```

### Guardar información
```
Guarda que usamos PostgreSQL como base de datos principal
Almacena esta decisión de arquitectura: microservicios con API Gateway
Guarda que el endpoint de login es /api/auth/login
```

## 🏗️ Arquitectura

```
┌─────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Cursor    │────│   MCP Server     │────│  Supermemory.ai │
│   Agent     │    │  (Node.js)       │    │     API         │
└─────────────┘    └─────────────────┘    └─────────────────┘
```

- **Cursor Agent**: Interface de usuario
- **MCP Server**: Protocolo de comunicación
- **Supermemory.ai**: Almacenamiento persistente

## 🔧 Desarrollo

### Ejecutar en desarrollo
```bash
npm run dev  # Con hot reload
```

### Construir para producción
```bash
npm run start
```

## 🐛 Solución de Problemas

### "No se encontraron servidores MCP"
- Reinicia Cursor completamente
- Verifica que `.cursor/mcp.json` existe

### "API key not configured"
- Verifica que el archivo `.env` existe
- Confirma que `SUPERMEMORY_API_KEY` está configurada

### Modo simulado activo
- Sin API key funciona en modo demo
- Los datos no se almacenan permanentemente

## 📄 Licencia

MIT - Ver [LICENSE](LICENSE) para más detalles.

---

**¿Preguntas?** Abre un issue en GitHub.