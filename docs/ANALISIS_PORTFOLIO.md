# 🔍 Análisis Completo del Portfolio — yamicueto.github.io

> Fecha del análisis: 12 de agosto de 2026
> Repositorio: `YamiCueto/yamicueto.github.io`
> URL: https://yamicueto.github.io/

---

## 1. Descripción general

Portfolio personal / CV de **Yamid Cueto Mazo**, alojado en GitHub Pages y desplegado desde la rama `main`.

**Stack real en producción:**

- `index.html` — página única (single-page)
- `css/style.css` — estilos compilados (PostCSS), ~78 KB sin minificar
- `css/projects-slider.css` — cargado pero sin utilidad (ver sección de código muerto)
- `js/script.js` — toda la funcionalidad JS (~46 KB, no minificado)
- `assets/*.png` — 7 imágenes (~3.8 MB en total)
- `sitemap.xml`, `robots.txt` — SEO
- `.github/workflows/deploy.yml` — CI/CD con build + deploy + Lighthouse

**Stack declarado pero NO usado en producción:**

- PostCSS / Rollup (build system presente pero producción sirve los archivos fuente)
- `js/script.hybrid.js`, `js/script.bundle.js`, `js/github-repos.js`, `js/projects-slider.js`, `js/typing-gsap.js`, `js/animations/*`
- `css/swiper-custom.css`, `css/projects-slider.css` (parcialmente)

---

## 2. Fortalezas ✅

### SEO
- JSON-LD `Person` con `sameAs`, `knowsAbout`, `worksFor`, dirección
- Open Graph + Twitter Cards completos (título, descripción, imagen 1200×630)
- `canonical`, `robots.txt`, `sitemap.xml`, `dns-prefetch`, `preconnect`
- Meta geo, author, theme-color

### Contenido
- Narrativa profesional sólida y cuantificable: 500K+ usuarios, 99.9% uptime, 60% mejora de performance, 40% automatización IA
- 5 premios TCS documentados (Star of the Month x2, Best Team Award, Beyond Performance x2)
- Timeline de experiencia desde 2015
- Testimonios con nombres reales
- Sección de contacto con valor proposicional (empresas / colaboración / innovación)

### Funcionalidad
- CV en PDF generado en cliente (jsPDF) con foto, certificaciones, premios y paginación
- Formulario funcional vía Formspree con validación y contador de caracteres
- "Ver más proyectos" dinámico con GitHub API
- Estadísticas de GitHub (github-readme-stats + streak-stats)
- Compartir perfil (Web Share API + clipboard), WhatsApp flotante, scroll-to-top
- Responsive design + hamburguesa móvil

### CI/CD
- GitHub Actions con build, deploy a Pages y auditoría Lighthouse automática

---

## 3. Bugs encontrados 🐛

### 🔴 Críticos

| # | Bug | Ubicación | Impacto |
|---|-----|-----------|---------|
| 1 | Emoji corrupto en el nombre del step: `name: � Upload build artifacts` | `.github/workflows/deploy.yml:59` | Byte inválido en YAML que puede romper el workflow |
| 2 | El workflow solo copia `css/style.css` y `js/script.js`, pero `index.html:78` también carga `css/projects-slider.css` | `deploy.yml` + `index.html:78` | Si Pages usa el deploy por Actions, ese CSS da 404 y se pierden estilos. Hoy funciona porque Pages sirve desde la rama |
| 3 | `npm run build` se cuelga: usa `build:css` que está en modo `--watch` (nunca termina) | `package.json:8` | Comando documentado roto; debe usar `build:css:prod` |
| 4 | Error de género en testimonio: *"excelente desarrolladora"* | `index.html:986` | Debe decir "excelente desarrollador" |
| 5 | Inconsistencia de fechas SoftwareONE: HTML dice *Feb 2021 - Nov 2023*, PDF dice *Ago 2020 - Mar 2021* | `index.html:799` vs `js/script.js:564` | Datos contradictorios entre CV web y PDF descargable |

### 🟠 Medios

| # | Problema | Ubicación |
|---|----------|-----------|
| 6 | `user_stats.json` contiene un error 403 de la API de GitHub (archivo muerto) | `user_stats.json` |
| 7 | README afirma "tema claro/oscuro con persistencia en localStorage" pero **no existe implementación**: no hay toggle ni CSS `data-theme="light"` | `README.md:29` vs `index.html:136` |
| 8 | README dice versión 1.0.0, package.json dice 2.0.0 | `README.md:6` vs `package.json:3` |
| 9 | README afirma "Lighthouse 95+ en todas las métricas" sin evidencia | `README.md:160` |
| 10 | Código muerto / duplicado: `github-repos.js`, `projects-slider.js`, `typing-gsap.js`, `script.hybrid.js`, `script.bundle.js`, `animations/*`, `swiper-custom.css` no se cargan en producción | `js/`, `css/` |
| 11 | `css/projects-slider.css` se carga pero sus clases (`.projects-slider`, `.projects-track`, `.slider-*`) ya no existen en el HTML (se reemplazó slider por grid) | `index.html:78` |
| 12 | Dos implementaciones de `window.loadMoreProjects` (se pisan) | `js/github-repos.js:215` y `js/script.js:1081` |
| 13 | `setupLazyLoading()` busca `img[data-src]` pero ninguna imagen lo tiene (se usa `loading="lazy"` nativo) → no hace nada | `js/script.js:322` |
| 14 | Cursor personalizado: el `scale(2)` del hover se pierde en cada frame porque `animateFollower` sobrescribe el `transform` | `js/script.js:79-99` |
| 15 | `script.hybrid.js:51-54` duplica llamadas a `setupLazyLoading`/`setupAnalytics` | `js/script.hybrid.js` |

### 🟡 Menores

| # | Problema | Ubicación |
|---|----------|-----------|
| 16 | Typos "Expert en Java" → "Experto en Java" (x3) | `index.html:9, 18, 36` |
| 17 | `twitter:card` debería ser `summary_large_image` (hay OG image 1200×630) | `index.html:31` |
| 18 | `apple-touch-icon` usa SVG data-URI; iOS requiere PNG real | `index.html:83` |
| 19 | Imágenes pesadas: 7 PNGs ≈ 3.8 MB (400–700 KB c/u) | `assets/*.png` |
| 20 | `setupContactForm()` se llama a nivel de top-level en vez de dentro de `initializeApp()` | `js/script.js:962` |
| 21 | Metas obsoletas: `rating`, `revisit-after`, `language` (los buscadores las ignoran) | `index.html:46-48` |
| 22 | Solapamiento de fechas en el timeline (Intergrupo vs SoftwareONE; SENA 2015-2018 vs SENA 2017-2018) | `index.html:735-874` |

---

## 4. Mejoras recomendadas 🚀

### Rendimiento (performance)
- Convertir las 7 imágenes PNG a **WebP/AVIF** (~ahorro del 60-80%)
- Añadir `width` y `height` a todas las imágenes (evita CLS / layout shift)
- Minificar el CSS/JS que realmente se sirve (`style.css`, `script.js`)
- Cache-busting automático en vez de `?v=2.0` manual (`index.html:77`)
- Añadir `fetchpriority="high"` a la imagen más importante del hero

### Accesibilidad (a11y)
- `aria-label` en hamburguesa, botón de share y scroll-to-top (hoy solo tienen `title`)
- `aria-live="polite"` en el elemento del typewriter
- Respetar `prefers-reduced-motion` (desactivar animaciones)
- `pointer-events: none` en el cursor personalizado
- Focus-trap + `aria-modal` en el modal del formulario
- `aria-expanded`/`aria-controls` consistentes en la navegación móvil

### SEO
- Corregir typos en meta description ("Expert" → "Experto")
- `twitter:card` → `summary_large_image`
- `dateModified` en el JSON-LD
- hreflang ES/EN (si se añade versión en inglés)
- Sección blog para generar más URLs indexables reales

### Funcionalidad / UX
- Implementar el **toggle de tema claro/oscuro** que ya promete el README (con persistencia en localStorage)
- Honeypot anti-spam en el formulario de contacto
- Página 404 personalizada
- Revisar/unificar las fechas de experiencia entre HTML y el PDF generado
- Añadir `aria-hidden` y `role="presentation"` a elementos puramente decorativos

### Limpieza / Mantenibilidad
- Eliminar archivos muertos: `js/github-repos.js`, `js/projects-slider.js`, `js/typing-gsap.js`, `js/script.hybrid.js`, `js/script.bundle.js`, `js/animations/`, `css/swiper-custom.css`
- Eliminar `css/projects-slider.css` de `index.html` (o volver a añadir el slider)
- Eliminar `user_stats.json`
- Arreglar `npm run build` → usar `build:css:prod`
- Arreglar el emoji corrupto en `deploy.yml`
- Copiar todos los assets referenciados en el workflow de deploy
- Actualizar README: versión, claim de tema dual, claim de Lighthouse, estructura real
- Añadir archivo `LICENSE` (README promete MIT pero no existe el archivo)
- Unificar la configuración de lint (`.hintrc`, `.stylelintrc.json`)

---

## 5. Resumen ejecutivo

El sitio cumple bien su función como CV online: contenido sólido, SEO bueno, interacciones correctas y un deploy funcional. Los problemas principales son de **higiene técnica** (código muerto, claims del README falsos, workflow frágil) y de **consistencia de datos** (fechas contradictorias entre web y PDF, solapamientos en el timeline).

**Prioridad de acción sugerida:**
1. ✅ Bugs críticos (workflow, build, typo de género, fechas)
2. 🧹 Limpieza de código muerto y claims falsos del README
3. ⚡ Performance (imágenes WebP, minificación)
4. ♿ Accesibilidad
5. 🚀 Features nuevas (tema claro, 404, blog)
