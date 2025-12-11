/**
 * GitHub Repositories Fetcher
 * Obtiene los repositorios públicos del usuario y actualiza la sección de proyectos
 * con filtrado inteligente y caching
 */

const GITHUB_USERNAME = 'YamiCueto';
const GITHUB_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`;

// Configuración de caché
const CACHE_KEY = 'github_repos_cache';
const CACHE_DURATION = 3600000; // 1 hora en milisegundos

// Criterios para proyectos destacados
const FEATURED_CRITERIA = {
    minStars: 0,
    hasDemo: true,
    hasDescription: true,
    minDescriptionLength: 20
};

// Mapeo de tecnologías a categorías para el filtrado
const TECH_CATEGORIES = {
    'ai': ['ollama', 'openai', 'ia', 'ai', 'llm', 'gpt', 'chatbot', 'machine-learning'],
    'angular': ['angular', 'ng', 'typescript'],
    'java': ['java', 'spring', 'boot', 'gradle', 'maven', 'webflux'],
    'web': ['javascript', 'html', 'css', 'web', 'frontend', 'react', 'vue']
};

// Iconos para tecnologías comunes
const TECH_ICONS = {
    'angular': 'fab fa-angular',
    'java': 'fab fa-java',
    'javascript': 'fab fa-js',
    'typescript': 'fas fa-code',
    'python': 'fab fa-python',
    'react': 'fab fa-react',
    'node': 'fab fa-node-js',
    'docker': 'fab fa-docker',
    'spring': 'fas fa-leaf',
    'maps': 'fas fa-map-marked-alt',
    'calendar': 'fas fa-calendar-alt',
    'ai': 'fas fa-robot',
    'ia': 'fas fa-robot',
    'cloud': 'fas fa-cloud',
    'api': 'fas fa-server',
    'ecommerce': 'fas fa-shopping-cart',
    'education': 'fas fa-graduation-cap',
    'diagram': 'fas fa-project-diagram',
    'tasks': 'fas fa-tasks',
    'law': 'fas fa-balance-scale',
    'portfolio': 'fas fa-user-circle',
    'recipe': 'fas fa-utensils',
    'users': 'fas fa-users',
    'webflux': 'fas fa-bolt'
};

/**
 * Obtiene el icono apropiado basado en el nombre y tecnologías del proyecto
 */
function getProjectIcon(name, description, topics) {
    const searchText = `${name} ${description} ${topics.join(' ')}`.toLowerCase();

    for (const [key, icon] of Object.entries(TECH_ICONS)) {
        if (searchText.includes(key)) {
            return icon;
        }
    }

    return 'fas fa-code'; // Icono por defecto
}

/**
 * Determina las categorías del proyecto basado en topics y lenguajes
 */
function getProjectCategories(repo) {
    const categories = new Set();
    const searchText = `${repo.name} ${repo.description || ''} ${repo.topics.join(' ')} ${repo.language || ''}`.toLowerCase();

    for (const [category, keywords] of Object.entries(TECH_CATEGORIES)) {
        if (keywords.some(keyword => searchText.includes(keyword))) {
            categories.add(category);
        }
    }

    // Si no tiene categoría específica, agregar 'web' como categoría por defecto
    if (categories.size === 0) {
        categories.add('web');
    }

    return Array.from(categories);
}

/**
 * Formatea la fecha a formato legible
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const month = date.toLocaleDateString('es-ES', { month: 'short' });
    const year = date.getFullYear();
    return `${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
}

/**
 * Crea el HTML para una tarjeta de proyecto
 */
function createProjectCard(repo) {
    const categories = getProjectCategories(repo);
    const icon = getProjectIcon(repo.name, repo.description || '', repo.topics || []);
    const hasDemo = repo.homepage && repo.homepage.trim() !== '';
    const isFeatured = repo.relevanceScore > 80; // Proyectos destacados

    // Crear tags de tecnología basados en topics y lenguaje
    const techTags = [];
    if (repo.language) techTags.push(repo.language);
    if (repo.topics && repo.topics.length > 0) {
        techTags.push(...repo.topics.slice(0, 3));
    }

    const techTagsHTML = techTags
        .map(tag => `<span class="tech-tag">${tag}</span>`)
        .join('\n                                ');

    // Agregar badge de proyecto destacado
    const featuredBadge = isFeatured ? '<span class="featured-badge">⭐ Destacado</span>' : '';

    return `
                    <!-- ${repo.name} -->
                    <div class="project-card${isFeatured ? ' featured' : ''}" data-category="${categories.join(' ')}" data-score="${repo.relevanceScore}">
                        ${featuredBadge}
                        <div class="project-image">
                            <div class="project-overlay">
                                <div class="project-links">
                                    ${hasDemo ? `
                                    <a rel="noopener noreferrer" title="${repo.name} demo"
                                        href="${repo.homepage}" target="_blank"
                                        class="project-link">
                                        <i class="fas fa-external-link-alt"></i>
                                    </a>` : ''}
                                    <a rel="noopener noreferrer" title="${repo.name} repository"
                                        href="${repo.html_url}" target="_blank"
                                        class="project-link">
                                        <i class="fab fa-github"></i>
                                    </a>
                                </div>
                            </div>
                            <div class="project-placeholder">
                                <i class="${icon}"></i>
                            </div>
                        </div>
                        <div class="project-content">
                            <h3 class="project-title">${repo.name.replace(/-/g, ' ')}${repo.stargazers_count > 0 ? ` ⭐${repo.stargazers_count}` : ''}</h3>
                            <p class="project-description">${repo.description || 'Proyecto en desarrollo'}</p>
                            <div class="project-tech">
                                ${techTagsHTML}
                            </div>
                            <div class="project-meta">
                                <span class="project-date">${formatDate(repo.updated_at)}</span>
                                ${repo.license ? `<span class="project-license">${repo.license.spdx_id}</span>` : ''}
                            </div>
                        </div>
                    </div>
`;
}

/**
 * Verifica si los datos en caché son válidos
 */
function getCachedRepos() {
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (!cached) return null;

        const { data, timestamp } = JSON.parse(cached);
        const now = Date.now();

        if (now - timestamp < CACHE_DURATION) {
            console.log('📦 Usando repositorios desde caché');
            return data;
        }

        console.log('⏰ Caché expirado, obteniendo datos frescos');
        return null;
    } catch (error) {
        console.error('❌ Error al leer caché:', error);
        return null;
    }
}

/**
 * Guarda los repositorios en caché
 */
function cacheRepos(repos) {
    try {
        const cacheData = {
            data: repos,
            timestamp: Date.now()
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        console.log('💾 Repositorios guardados en caché');
    } catch (error) {
        console.error('❌ Error al guardar en caché:', error);
    }
}

/**
 * Calcula la puntuación de relevancia de un repositorio
 */
function calculateRelevanceScore(repo) {
    let score = 0;

    // Puntos por estrellas
    score += repo.stargazers_count * 10;

    // Puntos por tener homepage/demo
    if (repo.homepage && repo.homepage.trim() !== '') {
        score += 50;
    }

    // Puntos por descripción de calidad
    if (repo.description && repo.description.length >= FEATURED_CRITERIA.minDescriptionLength) {
        score += 30;
    }

    // Puntos por topics
    if (repo.topics && repo.topics.length > 0) {
        score += repo.topics.length * 5;
    }

    // Penalización por repositorios muy antiguos sin actualizar
    const monthsSinceUpdate = (Date.now() - new Date(repo.updated_at)) / (1000 * 60 * 60 * 24 * 30);
    if (monthsSinceUpdate > 12) {
        score -= 20;
    } else if (monthsSinceUpdate < 3) {
        score += 15; // Bonus por repositorios recientes
    }

    // Bonus por lenguajes relevantes
    const relevantLanguages = ['Java', 'JavaScript', 'TypeScript', 'HTML', 'CSS'];
    if (relevantLanguages.includes(repo.language)) {
        score += 10;
    }

    return score;
}

/**
 * Filtra y ordena los repositorios más relevantes
 */
function filterRelevantRepos(repos) {
    // Calcular scores
    const reposWithScores = repos.map(repo => ({
        ...repo,
        relevanceScore: calculateRelevanceScore(repo)
    }));

    // Ordenar por score de relevancia
    reposWithScores.sort((a, b) => b.relevanceScore - a.relevanceScore);

    console.log('🎯 Top 5 proyectos por relevancia:');
    reposWithScores.slice(0, 5).forEach((repo, i) => {
        console.log(`${i + 1}. ${repo.name} - Score: ${repo.relevanceScore}`);
    });

    return reposWithScores;
}

/**
 * Muestra un estado de carga
 */
function showLoadingState() {
    const projectsTrack = document.querySelector('.projects-track');
    if (projectsTrack) {
        projectsTrack.innerHTML = `
            <div class="projects-loading" style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                <i class="fab fa-github" style="font-size: 4rem; color: var(--primary-color); margin-bottom: 1rem; animation: pulse 2s infinite;"></i>
                <p style="font-size: 1.2rem; margin-bottom: 0.5rem;">🔄 Cargando proyectos desde GitHub...</p>
                <p style="font-size: 0.9rem; color: var(--text-secondary);">Obteniendo repositorios más relevantes</p>
            </div>
        `;
    }
}

/**
 * Obtiene los repositorios de GitHub y actualiza la sección de proyectos
 */
async function fetchAndUpdateProjects() {
    try {
        // Intentar usar caché primero
        let repos = getCachedRepos();
        
        if (!repos) {
            showLoadingState();
            console.log('🔄 Obteniendo repositorios de GitHub API...');

            const response = await fetch(GITHUB_API_URL);
            if (!response.ok) {
                throw new Error(`Error al obtener repositorios: ${response.status}`);
            }

            repos = await response.json();
            console.log(`✅ Se obtuvieron ${repos.length} repositorios`);

            // Guardar en caché
            cacheRepos(repos);
        }

        // Filtrar repositorios públicos y no archivados
        const publicRepos = repos.filter(repo => !repo.private && !repo.archived && !repo.fork);
        console.log(`📦 Repositorios públicos activos: ${publicRepos.length}`);

        // Filtrar y ordenar por relevancia
        const relevantRepos = filterRelevantRepos(publicRepos);

        // Generar HTML para todos los proyectos
        const projectsHTML = relevantRepos.map(repo => createProjectCard(repo)).join('\n');

        // Actualizar el contenedor de proyectos
        const projectsTrack = document.querySelector('.projects-track');
        if (projectsTrack) {
            projectsTrack.innerHTML = projectsHTML;
            console.log('✨ Proyectos actualizados exitosamente');

            // Refrescar el slider si existe
            if (window.projectsSlider && typeof window.projectsSlider.refresh === 'function') {
                window.projectsSlider.refresh();
                console.log('🎨 Slider refrescado');
            }

            // Actualizar contador de proyectos en "Sobre Mí"
            updateProjectCount(relevantRepos.length);
        } else {
            console.error('❌ No se encontró el contenedor .projects-track');
        }

        return relevantRepos;

    } catch (error) {
        console.error('❌ Error al obtener repositorios:', error);
        showErrorMessage('No se pudieron cargar los proyectos desde GitHub. Por favor, recarga la página.');
        return [];
    }
}

/**
 * Actualiza el contador de proyectos en la sección "Sobre Mí"
 */
function updateProjectCount(count) {
    const projectCountElement = document.querySelector('.about-stats .stat:nth-child(3) .stat-number');
    if (projectCountElement) {
        projectCountElement.textContent = `${count}`;
        console.log(`📊 Contador de proyectos actualizado: ${count}`);
    }
}

/**
 * Muestra un mensaje de error al usuario
 */
function showErrorMessage(message) {
    const projectsTrack = document.querySelector('.projects-track');
    if (projectsTrack) {
        projectsTrack.innerHTML = `
            <div class="projects-error" style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                <i class="fab fa-github" style="font-size: 4rem; color: var(--primary-color); margin-bottom: 1rem;"></i>
                <p style="font-size: 1.2rem; margin-bottom: 0.5rem;">⚠️ ${message}</p>
                <button onclick="clearCacheAndReload()" class="btn btn-primary" style="margin-top: 1rem;">
                    <i class="fas fa-sync-alt"></i> Reintentar
                </button>
            </div>
        `;
    }
}

/**
 * Limpia el caché y recarga los proyectos
 */
function clearCacheAndReload() {
    localStorage.removeItem(CACHE_KEY);
    console.log('🗑️ Caché limpiado');
    fetchAndUpdateProjects();
}

/**
 * Inicializa la carga de proyectos cuando el DOM esté listo
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fetchAndUpdateProjects);
} else {
    fetchAndUpdateProjects();
}

// Exportar funciones para uso global
window.fetchAndUpdateProjects = fetchAndUpdateProjects;
window.clearCacheAndReload = clearCacheAndReload;
