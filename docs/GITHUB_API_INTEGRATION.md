# 🚀 GitHub API Integration - Documentación

## 📋 Descripción General

El sistema de integración con GitHub API permite que el portfolio se actualice automáticamente con los repositorios más relevantes del usuario, sin necesidad de actualizar manualmente el código HTML.

## ✨ Características Principales

### 1. **Obtención Automática de Repositorios**
- Realiza llamadas a la API de GitHub para obtener todos los repositorios públicos
- Filtra automáticamente repositorios archivados, privados y forks
- Se ejecuta automáticamente al cargar la página

### 2. **Sistema de Caché Inteligente**
- **Duración**: 1 hora (3600000 ms)
- **Almacenamiento**: LocalStorage del navegador
- **Beneficios**:
  - Reduce llamadas a la API de GitHub
  - Mejora el rendimiento de carga
  - Evita rate limiting de la API
  - Funciona offline después de la primera carga

### 3. **Algoritmo de Relevancia**
El sistema calcula un score de relevancia para cada proyecto basado en:

#### Criterios de Puntuación:
```javascript
- Estrellas en GitHub: +10 puntos por estrella
- Tiene demo/homepage: +50 puntos
- Descripción de calidad (>20 caracteres): +30 puntos
- Número de topics: +5 puntos por topic
- Actualizado recientemente (<3 meses): +15 puntos
- Antiguo sin actualizar (>12 meses): -20 puntos
- Lenguaje relevante (Java, JavaScript, TypeScript): +10 puntos
```

### 4. **Proyectos Destacados**
- Proyectos con score > 80 reciben badge "⭐ Destacado"
- Estilo visual diferenciado con borde dorado
- Animación de pulso en el badge

### 5. **Estados Visuales**

#### Loading State:
```
🔄 Cargando proyectos desde GitHub...
Obteniendo repositorios más relevantes
```

#### Error State:
```
⚠️ [Mensaje de error]
[Botón Reintentar]
```

## 🛠️ Configuración

### Archivo Principal: `js/github-repos.js`

```javascript
// Usuario de GitHub
const GITHUB_USERNAME = 'YamiCueto';

// Duración del caché (1 hora)
const CACHE_DURATION = 3600000;

// Criterios para proyectos destacados
const FEATURED_CRITERIA = {
    minStars: 0,
    hasDemo: true,
    hasDescription: true,
    minDescriptionLength: 20
};
```

## 📊 Flujo de Funcionamiento

```
1. Página carga
   ↓
2. Verificar caché en localStorage
   ↓
3. ¿Caché válido?
   ├─ Sí → Usar datos en caché
   └─ No → Fetch desde GitHub API
           ↓
           Guardar en caché
   ↓
4. Filtrar repositorios
   - Excluir privados
   - Excluir archivados
   - Excluir forks
   ↓
5. Calcular score de relevancia
   ↓
6. Ordenar por score
   ↓
7. Generar HTML
   ↓
8. Actualizar DOM
   ↓
9. Refrescar slider (si existe)
   ↓
10. Actualizar contador de proyectos
```

## 🎨 Categorización Automática

### Categorías Disponibles:
- **AI**: Proyectos con IA, LLM, Ollama, OpenAI
- **Angular**: Proyectos Angular/TypeScript
- **Java**: Proyectos Java, Spring Boot, WebFlux
- **Web**: HTML, CSS, JavaScript puro

### Mapeo de Tecnologías:
```javascript
const TECH_CATEGORIES = {
    'ai': ['ollama', 'openai', 'ia', 'ai', 'llm', 'gpt', 'chatbot'],
    'angular': ['angular', 'ng', 'typescript'],
    'java': ['java', 'spring', 'boot', 'gradle', 'maven', 'webflux'],
    'web': ['javascript', 'html', 'css', 'web', 'frontend']
};
```

## 🔧 Funciones Principales

### `fetchAndUpdateProjects()`
Función principal que orquesta todo el proceso.

### `getCachedRepos()`
Verifica y retorna datos desde el caché si son válidos.

### `cacheRepos(repos)`
Guarda los repositorios en localStorage con timestamp.

### `calculateRelevanceScore(repo)`
Calcula el score de relevancia basado en múltiples criterios.

### `filterRelevantRepos(repos)`
Filtra y ordena los repositorios por relevancia.

### `createProjectCard(repo)`
Genera el HTML para una tarjeta de proyecto.

### `updateProjectCount(count)`
Actualiza el contador de proyectos en la sección "Sobre Mí".

### `clearCacheAndReload()`
Limpia el caché y recarga los proyectos (útil para forzar actualización).

## 🎯 Iconos Automáticos

El sistema asigna iconos automáticamente basándose en el nombre, descripción y topics:

```javascript
const TECH_ICONS = {
    'angular': 'fab fa-angular',
    'java': 'fab fa-java',
    'javascript': 'fab fa-js',
    'ai': 'fas fa-robot',
    'cloud': 'fas fa-cloud',
    'api': 'fas fa-server',
    // ... más iconos
};
```

## 📱 Responsive Design

- Las tarjetas se adaptan automáticamente
- El slider funciona en dispositivos móviles
- Touch-friendly en tablets y móviles

## 🐛 Manejo de Errores

### Casos Manejados:
1. **API no disponible**: Muestra mensaje de error con botón de reintentar
2. **Rate limit excedido**: El caché ayuda a prevenir esto
3. **Caché corrupto**: Se limpia automáticamente
4. **Sin conexión**: Usa datos en caché si están disponibles

## 🔄 Actualización Manual

Para forzar una actualización:

```javascript
// Desde la consola del navegador
clearCacheAndReload();

// O
localStorage.removeItem('github_repos_cache');
fetchAndUpdateProjects();
```

## 📈 Métricas y Logging

El sistema registra en consola:
- ✅ Repositorios obtenidos
- 📦 Repositorios públicos activos
- 🎯 Top 5 proyectos por relevancia
- 💾 Estado del caché
- ✨ Actualizaciones exitosas

Ejemplo de log:
```
🔄 Obteniendo repositorios de GitHub API...
✅ Se obtuvieron 25 repositorios
📦 Repositorios públicos activos: 20
🎯 Top 5 proyectos por relevancia:
1. code-agent-arena - Score: 115
2. promptly - Score: 95
3. fotomultaslab - Score: 90
4. Flowly - Score: 85
5. todo-list-app - Score: 80
💾 Repositorios guardados en caché
✨ Proyectos actualizados exitosamente
🎨 Slider refrescado
📊 Contador de proyectos actualizado: 20
```

## 🚀 Mejoras Futuras

- [ ] Integración con GitHub GraphQL API (más eficiente)
- [ ] Filtros adicionales (por lenguaje, fecha, estrellas)
- [ ] Búsqueda en tiempo real
- [ ] Modo "todos" vs "destacados"
- [ ] Sincronización automática cada X horas
- [ ] Estadísticas agregadas de tecnologías
- [ ] Preview de README en modal

## 📝 Notas Importantes

1. **Rate Limiting**: GitHub API tiene límite de 60 requests/hora para usuarios no autenticados
2. **Caché**: Es crucial para evitar rate limiting
3. **Performance**: El sistema es muy rápido gracias al caché
4. **Mantenimiento**: No requiere actualización manual del HTML

## 🔐 Seguridad

- No se almacenan tokens ni datos sensibles
- Todo el código es client-side
- No hay riesgo de exposición de credenciales
- CORS es manejado por GitHub API

## 🤝 Contribuciones

Para agregar nuevas categorías o iconos, edita:
- `TECH_CATEGORIES` para categorías
- `TECH_ICONS` para iconos
- `FEATURED_CRITERIA` para criterios de destacados

---

**Desarrollado con ❤️ para un portfolio dinámico y siempre actualizado**
