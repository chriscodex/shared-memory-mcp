# Team Memory MCP Server

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)

**Memoria compartida global para equipos usando Cursor + Supermemory.ai**

Permite a los agentes de Cursor almacenar y recuperar conocimientos, decisiones y contexto del proyecto de forma persistente desde cualquier proyecto.

## 🚀 Instalación Global

```bash
# Desde la raíz del proyecto
./install-global.sh
```

Este script instala el MCP globalmente y configura todo automáticamente.

### Configuración
```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Configura tus variables:
# - SUPERMEMORY_API_KEY: Tu API key de Supermemory
# - LANGUAGE: en (inglés) o es (español)
# - DEFAULT_USER_ID: Tu nombre

# Aplicar configuración global
./setup-env.sh
```

### Obtener API Key
1. Ve a [Supermemory.ai](https://supermemory.ai/)
2. Regístrate y obtén tu API key gratuita
3. Pégala en `SUPERMEMORY_API_KEY`

### ¡Listo! ✅
Reinicia Cursor y tendrás memoria de equipo en todos tus proyectos:
- `memory/team_memory_search` 🔍 - Buscar información del equipo
- `memory/team_memory_store` 💾 - Guardar información automáticamente

**¿Por qué global?** La memoria del equipo debe ser consistente across todos los proyectos donde trabajes.

> **Nota:** La instalación local por proyecto no es recomendable ya que fragmentaría la memoria del equipo y requeriría configuración duplicada en cada repositorio.

## 📋 Requisitos

- **Node.js** >= 18.0.0
- **Cursor IDE**
- **API Key** de Supermemory.ai (gratuita)


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

**Nota:** Todas las memorias se guardan automáticamente con tu nombre (`DEFAULT_USER_ID`) y se formatean según el idioma configurado (`LANGUAGE`) para mejor identificación en búsquedas del equipo.


## ✨ Formateo Automático de Usuario

**Todas las memorias se formatean automáticamente** con atribución clara del usuario:

```
"Guarda que me gusta viajar"
→ Se guarda como: "Preferencias - El usuario Chris ha guardado: me gusta viajar"
```

Esto asegura que:
- ✅ Toda la información tenga atribución clara del autor
- ✅ Las búsquedas incluyan el contexto de quién guardó cada memoria
- ✅ La trazabilidad del equipo sea perfecta

## 🌍 Internacionalización (i18n)

El servidor soporta múltiples idiomas. Para cambiar el idioma:

1. **Configura la variable de entorno:**
   ```bash
   LANGUAGE=en  # Para inglés (default)
   LANGUAGE=es  # Para español
   ```

2. **Archivos de traducción:**
   - `locales/es.json` - Traducciones en español
   - `locales/en.json` - Traducciones en inglés

3. **Agregar nuevos idiomas:**
   - Crea `locales/[código].json`
   - Añade las traducciones necesarias
   - Configura `LANGUAGE=[código]`

**Idiomas soportados:** 🇺🇸 English (default), 🇪🇸 Español

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