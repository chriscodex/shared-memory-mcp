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

### Configurar API Key y Usuario
```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env (2 variables requeridas)
SUPERMEMORY_API_KEY=tu_api_key_real_aqui
DEFAULT_USER_ID=tu-nombre

# Configurar variables globales
./setup-env.sh
```

### Obtener API Key
1. Ve a [Supermemory.ai](https://supermemory.ai/)
2. Regístrate y obtén tu API key gratuita
3. Pégala en `SUPERMEMORY_API_KEY`
4. Pon tu nombre en `DEFAULT_USER_ID`
5. Ejecuta `./setup-env.sh`

### ¡Listo! ✅
Reinicia Cursor completamente y los agentes tendrán acceso global a:
- `memory/team_memory_search` 🔍 - Buscar información
- `memory/team_memory_store` 💾 - Guardar información
- `memory/user_profile_get` 👤 - Consultar perfiles de usuario
- `memory/user_memory_store` 👤💾 - Guardar información personal

**Estado:** ✅ Instalación global probada y funcionando
**API:** ✅ Variables de entorno configuradas correctamente

> **Nota:** Si ves mensajes de "modo demo", ejecuta `./setup-env.sh` para configurar las variables globales.

### 💡 **Ejemplos de Uso**

```bash
# Guardar información personal
"Guarda que me gusta viajar y la comida peruana"

# Consultar preferencias de un usuario
"¿Cuáles son las preferencias de Chris?"

# Buscar información específica
"¿Qué lenguajes de programación prefiere Chris?"
```

### 🔄 **Flujo de Trabajo**

1. **Guardar información personal** → Se personaliza automáticamente con tu nombre
2. **Supermemory construye perfil** → Extrae preferencias y hechos
3. **Consultar perfiles** → Obtén información estructurada sobre cualquier usuario
4. **Búsqueda inteligente** → Encuentra información por contenido o autor

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

**Nota:** Todas las memorias se guardan con el tag del usuario definido en `DEFAULT_USER_ID` del archivo `.env`, incluyendo metadatos del autor para identificación.

## 👤 Metadatos del Autor y Personalización

### ✨ **Personalización Automática de Contenido**

Cuando guardas información personal, el sistema automáticamente **reemplaza términos genéricos** con tu nombre específico:

- `"Al usuario le gusta viajar"` → `"A Chris le gusta viajar"`
- `"Me gusta la comida peruana"` → `"A Chris le gusta la comida peruana"`
- `"Yo prefiero trabajar de noche"` → `"Chris prefiere trabajar de noche"`

### 🏷️ **Metadatos del Autor**

Cada memoria guardada incluye automáticamente:
- **Tag principal:** `DEFAULT_USER_ID` (tu nombre)
- **Metadatos:** `author`, `author_name`, `created_by`
- **Fuente:** `mcp-team-memory`

Esto permite:
- ✅ Identificar quién guardó cada memoria
- ✅ Filtrar búsquedas por autor
- ✅ Construir perfiles de usuario inteligentes
- ✅ Consultar preferencias específicas: `"¿Cuáles son las preferencias de Chris?"`

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
- Verifica que `~/.cursor/mcp.json` existe

### "API key not configured"
- Verifica que `SUPERMEMORY_API_KEY` tenga un valor real en `.env`

### Modo simulado activo
- Configura la API key correctamente y ejecuta `./setup-env.sh`

## 📄 Licencia

MIT - Ver [LICENSE](LICENSE) para más detalles.

---

**¿Preguntas?** Abre un issue en GitHub.