/**
 * GitHub Repositories Fetcher
 * Obtiene los repositorios públicos del usuario y actualiza la sección de proyectos
 */

const GITHUB_USERNAME = 'YamiCueto';
const GITHUB_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`;

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

    // Crear tags de tecnología basados en topics y lenguaje
    const techTags = [];
    if (repo.language) techTags.push(repo.language);
    if (repo.topics && repo.topics.length > 0) {
        techTags.push(...repo.topics.slice(0, 3));
    }

    const techTagsHTML = techTags
        .map(tag => `<span class="tech-tag">${tag}</span>`)
        .join('\n                                ');

    return `
                    <!-- ${repo.name} -->
                    <div class="project-card" data-category="${categories.join(' ')}">
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
                            <h3 class="project-title">${repo.name.replace(/-/g, ' ')}${repo.stargazers_count > 0 ? ' ⭐' : ''}</h3>
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
 * Obtiene los repositorios de GitHub y actualiza la sección de proyectos
 */
async function fetchAndUpdateProjects() {
    try {
        console.log('🔄 Obteniendo repositorios de GitHub...');

        const response = await fetch(GITHUB_API_URL);
        if (!response.ok) {
            throw new Error(`Error al obtener repositorios: ${response.status}`);
        }

        const repos = await response.json();
        console.log(`✅ Se obtuvieron ${repos.length} repositorios`);

        // Filtrar repositorios públicos y no archivados
        const publicRepos = repos.filter(repo => !repo.private && !repo.archived && !repo.fork);
        console.log(`📦 Repositorios públicos activos: ${publicRepos.length}`);

        // Ordenar por fecha de actualización (más recientes primero)
        publicRepos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

        // Generar HTML para todos los proyectos
        const projectsHTML = publicRepos.map(repo => createProjectCard(repo)).join('\n');

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
        } else {
            console.error('❌ No se encontró el contenedor .projects-track');
        }

        return publicRepos;

    } catch (error) {
        console.error('❌ Error al obtener repositorios:', error);
        showErrorMessage('No se pudieron cargar los proyectos desde GitHub. Por favor, recarga la página.');
        return [];
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
                <button onclick="fetchAndUpdateProjects()" class="btn btn-primary" style="margin-top: 1rem;">
                    <i class="fas fa-sync-alt"></i> Reintentar
                </button>
            </div>
        `;
    }
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
