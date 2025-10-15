# 🏗️ Portfolio Build System

Este portfolio ahora incluye un sistema moderno de build con CSS modular y deploy automático.

## 📁 Nueva Estructura CSS

```
src/css/
├── main.css              # Archivo principal que importa todo
├── utils/
│   ├── variables.css     # Variables CSS personalizadas
│   ├── reset.css         # Reset y base styles
│   ├── animations.css    # Todas las animaciones
│   ├── utilities.css     # Clases de utilidad
│   └── responsive.css    # Media queries
├── components/
│   ├── navigation.css    # Navegación
│   ├── buttons.css       # Botones y CTAs
│   ├── cards.css         # Tarjetas de proyectos
│   ├── metrics.css       # Métricas del hero
│   └── ...
└── sections/
    ├── hero.css          # Sección hero
    ├── about.css         # Sección sobre mí
    ├── projects.css      # Sección proyectos
    └── ...
```

## 🚀 Scripts Disponibles

### Desarrollo
```bash
npm run dev          # Desarrollo con watch y servidor
npm run build        # Build para producción
npm run serve        # Servidor local
```

### Build CSS
```bash
npm run build:css         # Build CSS con watch
npm run build:css:prod    # Build CSS optimizado para producción
```

### Optimización
```bash
npm run minify       # Minifica CSS y JS
npm run minify:css   # Solo CSS
npm run minify:js    # Solo JavaScript
```

### Calidad
```bash
npm run lint:css     # Linter para CSS
npm run clean        # Limpia archivos generados
```

## 📦 Tecnologías del Build System

- **PostCSS**: Procesamiento moderno de CSS
- **Autoprefixer**: Prefijos automáticos para navegadores
- **CSSNano**: Minificación y optimización
- **PurgeCSS**: Elimina CSS no usado
- **Stylelint**: Linting para CSS
- **Terser**: Minificación de JavaScript

## 🌐 Deploy Automático

El deploy se ejecuta automáticamente con **GitHub Actions** cuando haces push a `main`:

1. **Build**: Procesa y optimiza CSS/JS
2. **Lint**: Verifica calidad del código
3. **Deploy**: Sube a GitHub Pages
4. **Lighthouse**: Auditoría de rendimiento

## 🔧 Configuración Local

### Primera instalación
```bash
npm install
```

### Desarrollo diario
```bash
npm run dev
```
Esto:
- Compila CSS automáticamente
- Inicia servidor en `http://localhost:3000`
- Recarga automática en cambios

### Para producción
```bash
npm run deploy
```

## 📊 Beneficios

✅ **CSS Modular**: Fácil de mantener y editar  
✅ **Build Automático**: Sin intervención manual  
✅ **Deploy Automático**: Push = Deploy inmediato  
✅ **Optimización**: CSS/JS minificados automáticamente  
✅ **Calidad**: Linting y auditorías automáticas  
✅ **Performance**: PurgeCSS elimina código no usado  

## 🎯 Flujo de Trabajo

1. **Edita** archivos en `src/css/`
2. **Push** a main
3. **GitHub Actions** hace el build
4. **Deploy automático** a GitHub Pages
5. **Lighthouse audit** reporta performance

¡Tu portfolio ahora tiene un sistema de build profesional! 🎉