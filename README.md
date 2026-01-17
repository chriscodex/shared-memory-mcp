# MCP Supermemory - Team Memory Sharing

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![MCP SDK](https://img.shields.io/badge/MCP-SDK-blue)](https://modelcontextprotocol.io/)

Un servidor MCP (Model Context Protocol) que integra Supermemory.ai para compartir memoria contextual entre agentes de Cursor en equipos de desarrollo.

## 🚀 Características

- **Búsqueda de Memoria**: Consulta información relevante del equipo usando búsqueda semántica
- **Almacenamiento Inteligente**: Guarda conversaciones y conocimientos importantes
- **Integración Nativa**: Funciona directamente con agentes de Cursor
- **Sin Mantenimiento**: Se ejecuta automáticamente con Cursor

## 📋 Prerrequisitos

- Node.js >= 18.0.0
- API Key de Supermemory.ai (para funcionalidad completa)
- Cursor IDE

## 🛠️ Instalación

### 1. Clona e instala dependencias

```bash
git clone <tu-repo>
cd mcp-team-memory
npm install
```

### 2. Configura tu API Key de Supermemory (Opcional)

```bash
# Crea un archivo .env
echo "SUPERMEMORY_API_KEY=tu_api_key_aqui" > .env
```

> **Nota**: Sin la API key, el prototipo funciona en modo simulado.

### 3. Verifica que funcione

```bash
npm start
```

Deberías ver: `Supermemory MCP server running on stdio`

## 🎯 Uso con Cursor

### Configuración Automática

El archivo `.cursor/mcp.json` ya está configurado. Solo reinicia Cursor para que detecte el servidor MCP.

### Uso con Agentes

Una vez configurado, los agentes de Cursor tendrán acceso automático a estas herramientas:

#### 🔍 Buscar Memoria del Equipo
```
¿Puedes buscar en la memoria del equipo sobre cómo manejamos errores de autenticación?
```

#### 💾 Almacenar Información
```
Guarda esta conversación sobre el manejo de JWT tokens en la memoria del equipo
```

## 🏗️ Arquitectura

```
src/
├── server.js          # Servidor MCP principal
├── supermemory.js     # Cliente para Supermemory API (TODO)
└── utils.js          # Utilidades auxiliares (TODO)

.cursor/
└── mcp.json          # Configuración de Cursor
```

## 🔧 Desarrollo

### Ejecutar en modo desarrollo
```bash
npm run dev
```

### Agregar nuevas herramientas
1. Edita `src/server.js`
2. Agrega la herramienta en `ListToolsRequestSchema`
3. Implementa el handler en `CallToolRequestSchema`

## 📝 Estado del Proyecto

### ✅ Implementado
- Estructura básica del proyecto
- Servidor MCP funcional
- Dos herramientas básicas (búsqueda y almacenamiento)
- Configuración de Cursor
- Modo simulado sin API key

### 🔄 Próximos Pasos
- [ ] Integración real con Supermemory API
- [ ] Autenticación y manejo de errores
- [ ] Filtrado avanzado por usuario/workspace
- [ ] Sincronización automática de conversaciones
- [ ] Interfaz web para gestión manual

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

MIT - ver [LICENSE](LICENSE) para más detalles.

## 🙋‍♂️ Soporte

- 📧 Abre un issue en GitHub
- 💬 Únete a la discusión en Discord/Slack del equipo

---

**Proyecto en desarrollo activo** - ¡Tus contribuciones son bienvenidas!