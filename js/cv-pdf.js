'use strict';

// Build-time renderer. Professional content comes exclusively from the profile
// and target; no browser state, network requests or current-time values are used.
const { jsPDF } = require('jspdf');
const { createHash } = require('node:crypto');

function required(value, description) {
    if (typeof value !== 'string' || !value.trim()) throw new Error(`Missing ${description}`);
    // Standard PDF fonts extract reliably as ASCII across ATS parsers. Keep the
    // canonical spelling in the model and normalize only the rendered document.
    const normalized = value.normalize('NFD').replace(/\p{M}/gu, '')
        .replace(/[\u00b7\u2022]/g, '|').replace(/[\u2013\u2014]/g, '-');
    if (/[^\x20-\x7e]/u.test(normalized)) throw new Error(`Unsupported glyph in ${description}`);
    return normalized;
}

function dateLabel(value, labels) {
    if (value === null) return required(labels.present, 'present label');
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) throw new Error(`Invalid month: ${value}`);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[Number(value.slice(5)) - 1]} ${value.slice(0, 4)}`;
}

function createCv(profile, target) {
    if (profile.id !== target.profileId || target.locale !== 'en') throw new Error('Invalid profile or locale');
    const cfg = target.presentation;
    if (cfg.paper !== 'A4' || cfg.columns !== 1 || cfg.maxPages > 2 || cfg.maxPages < 1 ||
        cfg.photo || cfg.showInternalSkillLevels || cfg.background !== 'white') throw new Error('Unsupported print configuration');
    if (cfg.bodyFontPt < 10 || cfg.bodyFontPt > 11 || cfg.marginMm < 15 || cfg.marginMm > 20) throw new Error('Unreadable print configuration');
    const labels = target.labels;
    const resolve = (items, id) => {
        const found = items.filter(item => item.id === id);
        if (found.length !== 1) throw new Error(`Invalid reference: ${id}`);
        return found[0];
    };
    const field = ref => ref.split('.').reduce((value, key) => value?.[key], profile);
    const org = id => required(resolve(profile.organizations, id).name, 'organization');
    const body = cfg.bodyFontPt;
    const row = (text, options = {}) => ({ text: required(text, 'CV text'), size: body, ...options });
    const sections = new Map();
    const add = (id, blocks) => sections.set(id, blocks);
    add('identity', [[row(profile.identity.name, { size: 21, bold: true }), row(field(target.headlineRef), { size: 11, bold: true })]]);
    const relocation = cfg.showRelocation
        ? ` | ${required(labels.relocation, 'relocation label').replace('{city}', profile.location.openToRelocationTo.join(', '))}` : '';
    add('contact', [[
        row(`${profile.location.city}, ${profile.location.country}${relocation}`, { size: 10 }),
        row(`Email: ${profile.contact.email}`, { size: 10, link: `mailto:${profile.contact.email}` }),
        row(`Phone: ${profile.contact.phone}`, { size: 10, link: `tel:${profile.contact.phone.replace(/\s/g, '')}` }),
        ...Object.values(profile.contact.links).map(url => {
            if (!/^https:\/\//.test(url)) throw new Error('Invalid contact URL');
            return row(url, { size: 10, link: url });
        })
    ]]);
    add('summary', [[row(field(target.summaryRef))]]);
    add('skills', [target.skillGroups.map(group => row(`${group.label}: ${group.ids.map(id => {
        const skill = resolve(profile.skills, id);
        if (skill.status !== 'verified') throw new Error(`Unverified skill: ${id}`);
        return skill.name;
    }).join(', ')}`))]);
    add('experience', target.experience.map(selection => {
        const job = resolve(profile.experience, selection.id);
        if (job.end !== null && job.start > job.end) throw new Error('Invalid employment dates');
        const rows = [row(org(job.organizationId), { bold: true }), row(`${dateLabel(job.start, labels)} - ${dateLabel(job.end, labels)}`)];
        if (selection.titlePresentation === 'functional-only') {
            rows.push(row(required(job.functionalRole?.value, 'functional role'), { bold: true }));
        } else if (job.title.value) {
            rows.push(row(job.title.value));
        } else if (selection.detail !== 'chronology-only') throw new Error('Missing primary role title');
        if (job.parallelGroupId && cfg.showParallelConsultingNote) rows.push(row(resolve(profile.parallelGroups, job.parallelGroupId).description));
        if (selection.assignmentIds?.length) {
            if (job.kind !== 'employment' || !cfg.groupAssignmentsUnderEmployer) throw new Error('Clients require an employer');
            const names = selection.assignmentIds.map(id => {
                const assignment = resolve(job.assignments, id);
                if (!assignment.public || assignment.kind !== 'client-assignment') throw new Error(`Nonpublic client: ${id}`);
                return org(assignment.organizationId);
            });
            rows.push(row(`${labels.assignments}: ${[...new Set(names)].join(', ')}`));
        }
        for (const id of selection.highlightIds || []) rows.push(row(`- ${resolve(job.highlights, id).en}`, { indent: 3 }));
        return rows;
    }));
    add('education', target.educationIds.map(id => {
        const item = resolve(profile.education, id);
        return [row(required(item.credentialEn, 'English education'), { bold: true }), row(`${org(item.organizationId)} | ${item.year}`)];
    }));
    add('training', target.trainingIds.map(id => {
        const item = resolve(profile.training, id);
        return [row(item.name), row(`${item.provider} | ${dateLabel(item.date, labels)}`)];
    }));
    add('awards', target.awardIds.map(id => {
        const item = resolve(profile.awards, id);
        return [row(`${item.name} | ${org(item.organizationId)} | ${dateLabel(item.date, labels)}`)];
    }));
    add('projects', target.projectIds.map(id => {
        const item = resolve(profile.projects, id);
        return [row(item.name, { bold: true }), row(required(item.en, 'English project description'))];
    }));
    add('languages', [target.languageIds.map(id => {
        const item = resolve(profile.languages, id);
        return row(item.name + (item.proficiency ? `: ${item.proficiency}` : ''));
    })]);

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true, putOnlyUsedFonts: true, precision: 4 });
    const revision = target.pdfRevision;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(revision)) throw new Error('Missing fixed PDF revision date');
    doc.setCreationDate(`D:${revision.replace(/-/g, '')}000000+00'00'`);
    doc.setFileId(createHash('sha256').update(JSON.stringify({ profile, target })).digest('hex').slice(0, 32).toUpperCase());
    const pdfTitle = target.pdfTitle || (target.company ? `${profile.identity.name} - ${target.company} ${target.jobId || ''} CV`.trim() : `${profile.identity.name} - ${target.role} CV`);
    doc.setProperties({
        title: required(pdfTitle, 'PDF title'),
        author: required(profile.identity.name, 'PDF author'),
        subject: required(`${field(target.headlineRef)} - ${target.role}`, 'PDF subject'),
        creator: 'Professional Profile CV Generator',
        keywords: required(target.skillGroups.flatMap(group => group.ids.map(id => resolve(profile.skills, id).name)).join(', '), 'PDF keywords')
    });
    doc.setLanguage('en');
    doc.viewerPreferences({ DisplayDocTitle: true, PrintScaling: 'None' });
    doc.setTextColor(25);
    const margin = cfg.marginMm;
    const width = doc.internal.pageSize.getWidth() - 2 * margin;
    const bottom = doc.internal.pageSize.getHeight() - margin;
    let y = margin;
    const layout = [];
    const measure = rows => rows.map(item => {
        doc.setFont('helvetica', item.bold ? 'bold' : 'normal');
        doc.setFontSize(item.size);
        const lines = doc.splitTextToSize(item.text, width - (item.indent || 0));
        const leading = item.size * 25.4 / 72 * 1.3;
        return { ...item, lines, leading, height: lines.length * leading + 0.6 };
    });
    const height = rows => rows.reduce((sum, item) => sum + item.height, 0);
    function ensureSpace(needed) {
        if (needed > bottom - margin) throw new Error('CV block exceeds a page');
        if (y + needed > bottom) {
            if (doc.getNumberOfPages() >= cfg.maxPages) throw new Error('CV exceeds two pages; edit selection instead of shrinking text');
            doc.addPage(); y = margin;
        }
    }
    function paint(rows, section, kind) {
        const page = doc.getNumberOfPages();
        const top = y;
        for (const item of rows) {
            doc.setFont('helvetica', item.bold ? 'bold' : 'normal'); doc.setFontSize(item.size);
            const x = margin + (item.indent || 0);
            for (const line of item.lines) {
                const lineWidth = doc.getTextWidth(line);
                if (x + lineWidth > margin + width + 0.05) throw new Error('Text exceeds right margin');
                const baseline = y + item.size * 25.4 / 72;
                doc.text(line, x, baseline);
                if (item.link) doc.link(x, y, lineWidth, item.leading, { url: item.link });
                y += item.leading;
            }
            y += 0.6;
        }
        layout.push({ page, section, kind, top, bottom: y });
    }
    for (const id of target.sectionOrder) {
        const blocks = sections.get(id);
        if (!blocks) throw new Error(`Unsupported section: ${id}`);
        if (!blocks.length || !blocks[0].length) continue;
        const heading = ['identity', 'contact'].includes(id) ? [] : measure([row(required(labels[id], 'section heading'), { size: 11, bold: true })]);
        const measured = blocks.map(measure);
        // Keep the section heading and entire first block together. Jobs never split.
        ensureSpace(height(heading) + height(measured[0]));
        if (heading.length) paint(heading, id, 'heading');
        for (const block of measured) {
            ensureSpace(height(block)); paint(block, id, 'content'); y += id === 'experience' ? 3 : 1.5;
        }
        y += 2;
    }
    return { bytes: Buffer.from(doc.output('arraybuffer')), pages: doc.getNumberOfPages(), layout };
}

module.exports = { createCv };
