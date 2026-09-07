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
        skills.replaceChildren(...profile.skillGroups.map(group => {
            const container = make('div', 'skills-group');
            container.append(make('h3', '', group.label));
            const tags = make('div', 'skills-tags');
            tags.append(...group.skills.map(skill => make('span', 'skill-tag', skill)));
            container.append(tags);
            return container;
        }));
    }

    const timeline = byId('profile-experience');
    if (timeline) {
        timeline.replaceChildren(...profile.experience.map(job => {
            const item = make('div', 'timeline-item');
            item.append(make('div', 'timeline-date', job.dates));
            const content = make('div', 'timeline-content');
            if (job.role) content.append(make('h3', 'timeline-title', job.role));
            content.append(make('h4', 'timeline-company', job.organization));
            if (job.assignments.length) content.append(make('p', 'timeline-clients', `Asignaciones de cliente: ${job.assignments.join(', ')}`));
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
