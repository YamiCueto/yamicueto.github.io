'use strict';

(() => {
    const profile = window.professionalProfile;
    if (!profile) throw new Error('Professional profile data was not generated');
    const byId = id => document.getElementById(id);
    const setText = (id, value) => { const node = byId(id); if (node) node.textContent = value; };
    const make = (tag, className, text) => {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text) node.textContent = text;
        return node;
    };

    document.title = `${profile.identity} | ${profile.headline}`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', profile.summary);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', `${profile.identity} | ${profile.headline}`);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', profile.summary);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', `${profile.identity} | ${profile.headline}`);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', profile.summary);
    const structuredData = document.querySelector('script[type="application/ld+json"]');
    if (structuredData) {
        const person = JSON.parse(structuredData.textContent);
        person.name = profile.identity;
        person.jobTitle = profile.headline.split(' | ')[0];
        person.description = profile.summary;
        person.worksFor.name = profile.currentEmployer;
        person.knowsAbout = profile.skillGroups.flatMap(group => group.skills);
        structuredData.textContent = JSON.stringify(person);
    }
    setText('profile-name', profile.identity);
    setText('typing-text', profile.headline);
    setText('profile-summary', profile.summary);
    setText('profile-location', `${profile.location} | ${profile.relocation}`);
    setText('profile-role', `"${profile.role || profile.headline.split(' | ')[0]}"`);
    setText('profile-employer', `"${profile.currentEmployer}"`);
    const aboutSummary = document.querySelector('.about-description p');
    if (aboutSummary) aboutSummary.textContent = profile.summary;

    const themes = byId('profile-themes');
    if (themes) {
        themes.replaceChildren(...profile.themes.map(theme => {
            const item = make('div', 'metric');
            item.append(make('span', 'metric-number', theme), make('span', 'metric-label', 'Enfoque profesional'));
            return item;
        }));
    }

    const skills = byId('profile-skills');
    if (skills) {
        const groupMeta = {
            'Backend y APIs': { icon: 'fas fa-server', subtitle: 'Arquitectura Empresarial & Servicios' },
            'Frontend': { icon: 'fas fa-layer-group', subtitle: 'Interfaces Reactivas & Estado' },
            'Entrega y nube': { icon: 'fas fa-cloud', subtitle: 'CI/CD, Contenedores & Infraestructura' },
            'Formas de trabajo': { icon: 'fas fa-users-cog', subtitle: 'Metodologías & Cultura de Ingeniería' }
        };
        const skillIcons = {
            'Java': 'fab fa-java',
            'Spring Boot': 'fas fa-leaf',
            'Java EE': 'fas fa-cubes',
            'REST APIs': 'fas fa-exchange-alt',
            'SOAP': 'fas fa-project-diagram',
            'Angular': 'fab fa-angular',
            'TypeScript': 'fas fa-code',
            'JavaScript': 'fab fa-js',
            'HTML': 'fab fa-html5',
            'CSS': 'fab fa-css3-alt',
            'RxJS': 'fas fa-stream',
            'Bootstrap': 'fab fa-bootstrap',
            'Git': 'fab fa-git-alt',
            'CI/CD': 'fas fa-sync-alt',
            'Jenkins': 'fab fa-jenkins',
            'SonarQube': 'fas fa-shield-alt',
            'Docker': 'fab fa-docker',
            'AWS': 'fab fa-aws',
            'Kubernetes': 'fas fa-dharmachakra',
            'IBM WebSphere Application Server': 'fas fa-hdd',
            'Scrum': 'fas fa-tasks'
        };
        skills.replaceChildren(...profile.skillGroups.map(group => {
            const container = make('div', 'skills-group');
            const meta = groupMeta[group.label] || { icon: 'fas fa-code', subtitle: 'Competencias Técnicas' };

            const header = make('div', 'skills-group-header');
            const iconWrap = make('div', 'skills-group-icon');
            iconWrap.append(make('i', meta.icon));
            const titleWrap = make('div', 'skills-group-titles');
            titleWrap.append(make('h3', '', group.label), make('span', 'skills-group-sub', meta.subtitle));
            const countBadge = make('span', 'skills-group-count', `${group.skills.length}`);
            header.append(iconWrap, titleWrap, countBadge);
            container.append(header);

            const tags = make('div', 'skills-tags');
            tags.append(...group.skills.map(skill => {
                const pill = make('span', 'skill-tag');
                const iconClass = skillIcons[skill] || 'fas fa-check-circle';
                pill.append(make('i', iconClass), document.createTextNode(skill));
                return pill;
            }));
            container.append(tags);
            return container;
        }));
    }

    const timeline = byId('profile-experience');
    if (timeline) {
        timeline.replaceChildren(...profile.experience.map((job, idx) => {
            const item = make('div', idx === 0 ? 'timeline-item timeline-item--current' : 'timeline-item');
            const dateBadge = make('div', 'timeline-date', job.dates);
            item.append(dateBadge);

            const content = make('div', 'timeline-content');
            const topRow = make('div', 'timeline-header-row');
            const titleGroup = make('div', 'timeline-title-group');
            if (job.role) titleGroup.append(make('h3', 'timeline-title', job.role));
            titleGroup.append(make('h4', 'timeline-company', job.organization));
            topRow.append(titleGroup);

            const inlineDate = make('span', 'timeline-date-inline', job.dates);
            topRow.append(inlineDate);
            content.append(topRow);

            if (job.assignments.length) {
                const clientsWrap = make('div', 'timeline-clients');
                const label = make('span', 'timeline-clients-label', 'Asignaciones de cliente:');
                clientsWrap.append(label);
                job.assignments.forEach(client => {
                    clientsWrap.append(make('span', 'timeline-client-chip', client));
                });
                content.append(clientsWrap);
            }
            if (job.parallel) content.append(make('p', 'timeline-parallel', job.parallel));
            const list = make('ul', 'timeline-description');
            list.append(...job.highlights.map(highlight => make('li', '', highlight)));
            if (job.highlights.length) content.append(list);
            item.append(content);
            return item;
        }));
        const github = document.querySelector('.github-stats-section');
        if (github) timeline.after(github);
    }
})();
