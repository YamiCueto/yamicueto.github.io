'use strict';
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const profile = JSON.parse(fs.readFileSync(path.join(root, 'src/data/professional-profile.json'), 'utf8'));
const target = JSON.parse(fs.readFileSync(path.join(root, 'src/data/targets/fullstack-engineer.json'), 'utf8'));
const resolve = (items, id) => {
    const matches = items.filter(item => item.id === id);
    if (matches.length !== 1) throw new Error(`Invalid portfolio reference: ${id}`);
    return matches[0];
};
const organization = id => resolve(profile.organizations, id).name;
const formatDate = value => {
    if (value === null) return 'Presente';
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${months[Number(value.slice(5)) - 1]} ${value.slice(0, 4)}`;
};
const skillGroupLabels = {
    'Backend & APIs': 'Backend y APIs',
    Frontend: 'Frontend',
    'Delivery & Cloud': 'Entrega y nube',
    'Ways of Working': 'Formas de trabajo'
};

const experience = target.experience
    .filter(selection => selection.detail !== 'chronology-only')
    .map(selection => {
        const job = resolve(profile.experience, selection.id);
        const assignments = (selection.assignmentIds || []).map(id => resolve(job.assignments, id))
            .filter(item => item.public && item.kind === 'client-assignment')
            .map(item => organization(item.organizationId));
        return {
            id: job.id,
            organization: organization(job.organizationId),
            dates: `${formatDate(job.start)} - ${formatDate(job.end)}`,
            role: selection.titlePresentation === 'functional-only' ? job.functionalRole.value : job.title.value,
            parallel: job.parallelGroupId ? resolve(profile.parallelGroups, job.parallelGroupId).descriptionEs : null,
            assignments: [...new Set(assignments)],
            highlights: (selection.highlightIds || []).map(id => {
                const highlight = resolve(job.highlights, id);
                if (!highlight.es) throw new Error(`Missing Spanish portfolio highlight: ${job.id}/${id}`);
                return highlight.es;
            })
        };
    });

const data = {
    identity: profile.identity.name,
    headline: profile.positioning.headline,
    role: 'Full Stack Engineer',
    summary: profile.summary.es,
    location: `${profile.location.city}, ${profile.location.country}`,
    relocation: 'Disponible para reubicación',
    themes: profile.positioning.primaryThemes.slice(0, 3),
    secondaryThemes: profile.positioning.secondaryThemes,
    skillGroups: target.skillGroups.map(group => ({
        label: skillGroupLabels[group.label] || group.label,
        skills: group.ids.map(id => resolve(profile.skills, id).name)
    })),
    experience,
    links: profile.contact.links,
    currentEmployer: organization('tcs')
};

const output = `'use strict';\n// Generated from src/data professional profile and target selection.\nwindow.professionalProfile = ${JSON.stringify(data, null, 2)};\n`;
fs.writeFileSync(path.join(root, 'js/professional-profile-data.js'), output);
console.log(`Portfolio profile: ${experience.length} experience entries and ${data.skillGroups.length} skill groups.`);
