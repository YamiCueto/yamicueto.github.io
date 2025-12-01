# GitHub Repositories Auto-Sync Feature

## 🎯 Descripción

Esta funcionalidad permite que la sección de proyectos de tu portfolio se actualice automáticamente obteniendo los repositorios públicos desde tu perfil de GitHub.

## ✨ Características

- ✅ Obtiene automáticamente todos tus repositorios públicos de GitHub
- ✅ Filtra repositorios archivados y forks
- ✅ Ordena por fecha de actualización (más recientes primero)
- ✅ Categoriza automáticamente los proyectos por tecnología
- ✅ Muestra información relevante: descripción, tecnologías, licencia, fecha
- ✅ Integra perfectamente con el slider de proyectos existente
- ✅ Maneja errores con reintentos
- ✅ Funciona sin autenticación (API pública de GitHub)

## 📁 Archivos Involucrados

### 1. `js/github-repos.js` (Nuevo)
Script principal que:
- Obtiene los repositorios desde GitHub API
- Categoriza automáticamente los proyectos
- Genera el HTML para cada proyecto
- Actualiza el DOM dinámicamente
- Integra con el slider existente

### 2. `js/projects-slider.js` (Modificado)
Actualizado para:
- Soportar múltiples categorías por proyecto
- Incluir método `refresh()` para reinicializar
- Funcionar con contenido dinámico

### 3. `index.html` (Modificado)
Incluye el script `github-repos.js` antes del `projects-slider.js`

## 🔧 Configuración

### Cambiar el Usuario de GitHub

Edita el archivo `js/github-repos.js` línea 6:

```javascript
const GITHUB_USERNAME = 'TuUsuario'; // Cambia por tu usuario
```

### Personalizar Categorías

Edita el objeto `TECH_CATEGORIES` en `js/github-repos.js`:

```javascript
const TECH_CATEGORIES = {
    'ai': ['ollama', 'openai', 'ia', 'ai', 'llm'],
    'angular': ['angular', 'ng', 'typescript'],
    'java': ['java', 'spring', 'boot'],
    'web': ['javascript', 'html', 'css', 'web']
};
```

### Agregar Iconos Personalizados

Edita el objeto `TECH_ICONS` en `js/github-repos.js`:

```javascript
const TECH_ICONS = {
    'angular': 'fab fa-angular',
    'java': 'fab fa-java',
    // Agrega más aquí
};
```

## 🚀 Uso

### Automático
El script se ejecuta automáticamente cuando la página carga:
- Se conecta a la GitHub API
- Obtiene los repositorios
- Los renderiza en la sección de proyectos
- Inicializa el slider

### Manual
También puedes actualizar manualmente los proyectos desde la consola del navegador:

```javascript
// Refrescar proyectos
fetchAndUpdateProjects();
```

## 🔍 Cómo Funciona la Categorización

El script analiza:
1. **Nombre del repositorio**: `fotomultaslab` → detecta 'maps'
2. **Descripción**: "Proyecto con IA" → detecta 'ai'
3. **Topics de GitHub**: ['angular', 'typescript'] → detecta 'angular'
4. **Lenguaje principal**: 'Java' → detecta 'java'

Los proyectos pueden pertenecer a múltiples categorías simultáneamente.

## 📊 Información Mostrada

Para cada repositorio se muestra:
- ✅ Nombre del proyecto
- ✅ Descripción
- ✅ Icono representativo
- ✅ Tecnologías/Topics
- ✅ Fecha de última actualización
- ✅ Licencia (si existe)
- ✅ Indicador de estrellas (⭐ si tiene stars)
- ✅ Link al demo (si tiene `homepage` configurado)
- ✅ Link al repositorio

## 🎨 Personalización Visual

Los proyectos mantienen el estilo visual del portfolio:
- Diseño de tarjetas consistente
- Animaciones GSAP
- Responsive design
- Temas oscuro/claro

## ⚠️ Limitaciones

1. **Rate Limit**: GitHub API permite 60 requests/hora sin autenticación
   - Suficiente para uso normal del portfolio
   - Para mayor límite, considera usar un token de GitHub

2. **Datos Públicos**: Solo obtiene repositorios públicos
   - No muestra repos privados
   - No requiere autenticación

3. **Cache**: No hay cache implementado
   - Los datos se obtienen en cada carga de página
   - Para agregar cache, considera usar localStorage

## 🔐 Autenticación (Opcional)

Para aumentar el rate limit a 5000 requests/hora:

1. Genera un Personal Access Token en GitHub
2. Modifica el fetch en `github-repos.js`:

```javascript
const response = await fetch(GITHUB_API_URL, {
    headers: {
        'Authorization': 'token TU_GITHUB_TOKEN'
    }
});
```

⚠️ **Nota**: Nunca subas tokens al repositorio público. Usa variables de entorno o servicios de backend.

## 🐛 Solución de Problemas

### Los proyectos no se cargan

1. Verifica la consola del navegador
2. Comprueba que el usuario de GitHub existe
3. Revisa el rate limit: https://api.github.com/rate_limit

### El filtrado no funciona

1. Verifica que los proyectos tengan categorías asignadas
2. Revisa la consola para errores
3. Asegúrate que GSAP esté cargado

### El slider no se actualiza

1. Verifica que `window.projectsSlider` existe
2. Comprueba que el método `refresh()` esté disponible
3. Reinicia la página

## 📝 Mejoras Futuras

- [ ] Implementar cache con localStorage
- [ ] Agregar paginación para muchos proyectos
- [ ] Mostrar estadísticas detalladas (stars, forks, issues)
- [ ] Agregar filtro de búsqueda por texto
- [ ] Mostrar lenguajes con porcentajes
- [ ] Integrar con GitHub GraphQL API

## 📚 Recursos

- [GitHub REST API](https://docs.github.com/en/rest)
- [GSAP Docs](https://greensock.com/docs/)
- [Font Awesome Icons](https://fontawesome.com/icons)

---

**Desarrollado por**: Yamid Cueto Mazo
**Fecha**: Diciembre 2025
**Versión**: 1.0.0
