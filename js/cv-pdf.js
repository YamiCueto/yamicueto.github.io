'use strict';

// Build-time Executive ATS-Clean PDF renderer.
// Professional content comes exclusively from the profile and target;
// no browser state, network requests or current-time values are used.
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

function dateLabel(value, labels, locale) {
    if (value === null) return required(labels.present, 'present label');
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) throw new Error(`Invalid month: ${value}`);
    const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthsEs = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const months = locale === 'es' ? monthsEs : monthsEn;
    return `${months[Number(value.slice(5)) - 1]} ${value.slice(0, 4)}`;
}

function createCv(profile, target) {
    if (profile.id !== target.profileId || !['en', 'es'].includes(target.locale)) {
        throw new Error('Invalid profile or locale');
    }
    const isEs = target.locale === 'es';
    const cfg = target.presentation;
    if (cfg.paper !== 'A4' || cfg.columns !== 1 || cfg.maxPages > 2 || cfg.maxPages < 1 ||
        cfg.photo || cfg.showInternalSkillLevels || cfg.background !== 'white') {
        throw new Error('Unsupported print configuration');
    }
    if (cfg.bodyFontPt < 10 || cfg.bodyFontPt > 11 || cfg.marginMm < 15 || cfg.marginMm > 20) {
        throw new Error('Unreadable print configuration');
    }

    const labels = target.labels;
    const resolve = (items, id) => {
        const found = items.filter(item => item.id === id);
        if (found.length !== 1) throw new Error(`Invalid reference: ${id}`);
        return found[0];
    };
    const field = ref => ref.split('.').reduce((value, key) => value?.[key], profile);
    const org = id => required(resolve(profile.organizations, id).name, 'organization');
    const body = cfg.bodyFontPt;

    // Palette — Executive ATS-Clean (subtle dark slate/navy hierarchy on pure white)
    const COLORS = {
        navy: [15, 23, 42],       // #0f172a - Name, section headings, primary titles
        accent: [29, 78, 216],    // #1d4ed8 - Headline, links, company accent
        body: [30, 41, 59],       // #1e293b - Main body copy
        muted: [71, 85, 105],     // #475569 - Dates, metadata
        rule: [203, 213, 225]     // #cbd5e1 - Hairline section dividers
    };

    const row = (text, options = {}) => ({
        text: required(text, 'CV text'),
        size: body,
        color: COLORS.body,
        ...options
    });

    const sections = new Map();
    const add = (id, blocks) => sections.set(id, blocks);

    // 1. IDENTITY
    add('identity', [[
        row(profile.identity.name, { size: 22, bold: true, color: COLORS.navy, extraAfter: 1.0 }),
        row(field(target.headlineRef), { size: 11.5, bold: true, color: COLORS.accent, extraAfter: 0.8 })
    ]]);

    // 2. COMPACT 2-LINE CONTACT BAR WITH REAL CLICKABLE LINKS
    const relocation = cfg.showRelocation
        ? ` (${required(labels.relocation, 'relocation label').replace('{city}', profile.location.openToRelocationTo.join(', ')).replace(/\s+to\s*$/i, '')})`
        : '';
    const phoneClean = profile.contact.phone.replace(/\s/g, '');
    const linkEntries = Object.entries(profile.contact.links).map(([key, url]) => {
        if (!/^https:\/\//.test(url)) throw new Error('Invalid contact URL');
        const label = key.charAt(0).toUpperCase() + key.slice(1);
        const cleanDisplay = url.replace(/^https:\/\//, '').replace(/\/$/, '');
        return { text: `${label}: ${cleanDisplay}`, link: url };
    });

    add('contact', [[
        {
            kind: 'inline-segments',
            size: 9.5,
            extraAfter: 0.5,
            segments: [
                { text: required(`${profile.location.city}, ${profile.location.country}${relocation}`, 'location'), color: COLORS.muted },
                { text: '  |  ', color: COLORS.muted },
                { text: required(profile.contact.email, 'email'), link: `mailto:${profile.contact.email}`, color: COLORS.body },
                { text: '  |  ', color: COLORS.muted },
                { text: required(profile.contact.phone, 'phone'), link: `tel:${phoneClean}`, color: COLORS.body }
            ]
        },
        {
            kind: 'inline-segments',
            size: 9.5,
            extraAfter: 1.0,
            segments: linkEntries.flatMap((entry, idx) => [
                ...(idx > 0 ? [{ text: '  |  ', color: COLORS.muted }] : []),
                { text: required(entry.text, 'contact link'), link: entry.link, color: COLORS.accent }
            ])
        }
    ]]);

    // 3. PROFESSIONAL SUMMARY
    add('summary', [[row(field(target.summaryRef))]]);

    // 4. TECHNICAL SKILLS (Bold Category Label + Regular Skills List)
    add('skills', [target.skillGroups.map(group => {
        const skillNames = group.ids.map(id => {
            const skill = resolve(profile.skills, id);
            if (skill.status !== 'verified') throw new Error(`Unverified skill: ${id}`);
            return skill.name;
        }).join(', ');
        return {
            kind: 'labeled-line',
            size: body,
            label: required(`${group.label}: `, 'skill group label'),
            value: required(skillNames, 'skill list'),
            color: COLORS.body
        };
    })]);

    // 5. PROFESSIONAL EXPERIENCE (1-line Role | Organization + Right-Aligned Date)
    add('experience', target.experience.map(selection => {
        const job = resolve(profile.experience, selection.id);
        if (job.end !== null && job.start > job.end) throw new Error('Invalid employment dates');

        const orgName = org(job.organizationId);
        const dateRange = `${dateLabel(job.start, labels, target.locale)} - ${dateLabel(job.end, labels, target.locale)}`;

        let roleTitle = null;
        if (selection.titlePresentation === 'functional-only') {
            roleTitle = required(job.functionalRole?.value, 'functional role');
        } else if (job.title.value) {
            roleTitle = required(job.title.value, 'job title');
        } else if (selection.detail !== 'chronology-only') {
            throw new Error('Missing primary role title');
        }

        const rows = [];
        if (roleTitle) {
            rows.push({
                kind: 'split-header',
                size: 10.8,
                leftPrimary: roleTitle,
                leftSecondary: `  |  ${orgName}`,
                rightText: required(dateRange, 'date range'),
                extraAfter: 0.4
            });
        } else {
            rows.push({
                kind: 'split-header',
                size: 10.5,
                leftPrimary: orgName,
                leftSecondary: '',
                rightText: required(dateRange, 'date range'),
                extraAfter: 0.4
            });
        }

        if (job.parallelGroupId && cfg.showParallelConsultingNote) {
            const pg = resolve(profile.parallelGroups, job.parallelGroupId);
            rows.push(row(isEs && pg.descriptionEs ? pg.descriptionEs : pg.description, { size: 9.5, color: COLORS.muted }));
        }

        if (selection.assignmentIds?.length) {
            if (job.kind !== 'employment' || !cfg.groupAssignmentsUnderEmployer) {
                throw new Error('Clients require an employer');
            }
            const names = selection.assignmentIds.map(id => {
                const assignment = resolve(job.assignments, id);
                if (!assignment.public || assignment.kind !== 'client-assignment') {
                    throw new Error(`Nonpublic client: ${id}`);
                }
                return org(assignment.organizationId);
            });
            rows.push({
                kind: 'labeled-line',
                size: 9.8,
                label: required(`${labels.assignments}: `, 'assignments label'),
                value: required([...new Set(names)].join(', '), 'client names'),
                color: COLORS.muted,
                extraAfter: 0.4
            });
        }

        for (const id of selection.highlightIds || []) {
            const hl = resolve(job.highlights, id);
            const hlText = isEs ? hl.es : hl.en;
            rows.push(row(`- ${hlText}`, { indent: 3, size: 10.2 }));
        }
        return rows;
    }));

    // 6. SELECTED PROJECTS (Protagonist: CASE OS with live & repo links)
    add('projects', target.projectIds.map(id => {
        const item = resolve(profile.projects, id);
        const desc = isEs ? (item.es || item.en) : item.en;
        const rightLink = item.repoUrl || item.url || '';
        const rightDisplay = rightLink ? rightLink.replace(/^https:\/\//, '').replace(/\/$/, '') : '';
        return [
            {
                kind: 'split-header',
                size: 10.5,
                leftPrimary: required(item.name, 'project name'),
                leftSecondary: item.url ? `  |  ${required(item.url.replace(/^https:\/\//, '').replace(/\/$/, ''), 'project url')}` : '',
                leftLink: item.url || null,
                rightText: rightDisplay ? required(rightDisplay, 'project repo') : '',
                rightLink: rightLink || null,
                extraAfter: 0.3
            },
            row(required(desc, 'project description'), { size: 10.2 })
        ];
    }));

    // 7. VERIFIED EDUCATION
    add('education', target.educationIds.map(id => {
        const item = resolve(profile.education, id);
        if (item.status !== 'verified') throw new Error(`Unverified education: ${id}`);
        const cred = isEs ? item.credentialOriginal : item.credentialEn;
        return [{
            kind: 'split-header',
            size: 10.5,
            leftPrimary: required(cred, 'education credential'),
            leftSecondary: `  |  ${org(item.organizationId)}`,
            rightText: String(item.year)
        }];
    }));

    // 8. TRAINING (Only if explicitly selected and validated)
    add('training', target.trainingIds.map(id => {
        const item = resolve(profile.training, id);
        if (item.kind === 'needs-validation') throw new Error(`Unvalidated training item: ${id}`);
        return [{
            kind: 'split-header',
            size: 10.2,
            leftPrimary: required(item.name, 'training name'),
            leftSecondary: `  |  ${required(item.provider, 'training provider')}`,
            rightText: dateLabel(item.date, labels, target.locale)
        }];
    }));

    // 9. AWARDS (Only if explicitly selected)
    add('awards', target.awardIds.map(id => {
        const item = resolve(profile.awards, id);
        return [{
            kind: 'split-header',
            size: 10.2,
            leftPrimary: required(item.name, 'award name'),
            leftSecondary: `  |  ${org(item.organizationId)}`,
            rightText: dateLabel(item.date, labels, target.locale)
        }];
    }));

    // 10. LANGUAGES
    add('languages', [[{
        kind: 'inline-segments',
        size: body,
        segments: target.languageIds.flatMap((id, idx) => {
            const item = resolve(profile.languages, id);
            const langName = isEs && item.nameEs ? item.nameEs : item.name;
            const prof = isEs && item.proficiencyEs ? item.proficiencyEs : item.proficiency;
            const text = langName + (prof ? `: ${prof}` : '');
            return [
                ...(idx > 0 ? [{ text: '   |   ', color: COLORS.muted }] : []),
                { text: required(text, 'language entry'), color: COLORS.body }
            ];
        })
    }]]);

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
    doc.setLanguage(target.locale);
    doc.viewerPreferences({ DisplayDocTitle: true, PrintScaling: 'None' });

    const margin = cfg.marginMm;
    const width = doc.internal.pageSize.getWidth() - 2 * margin;
    const bottom = doc.internal.pageSize.getHeight() - margin;
    let y = margin;
    const layout = [];
    const links = [];

    const measure = rows => rows.map(item => {
        const leading = item.size * 25.4 / 72 * 1.32;
        const extra = item.extraAfter || 0;
        if (item.kind === 'inline-segments') {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(item.size);
            const fullText = item.segments.map(s => s.text).join('');
            const totalW = doc.getTextWidth(fullText);
            if (totalW > width + 0.05) throw new Error(`Inline segments exceed page width: ${fullText}`);
            return { ...item, leading, height: leading + 0.6 + extra };
        }
        if (item.kind === 'split-header') {
            doc.setFontSize(item.size);
            doc.setFont('helvetica', 'bold');
            const leftW1 = doc.getTextWidth(item.leftPrimary);
            doc.setFont('helvetica', 'normal');
            const leftW2 = item.leftSecondary ? doc.getTextWidth(item.leftSecondary) : 0;
            const rightW = item.rightText ? doc.getTextWidth(item.rightText) : 0;
            if (leftW1 + leftW2 + rightW + 4 > width) {
                throw new Error(`Split header exceeds width: ${item.leftPrimary} ${item.leftSecondary}`);
            }
            return { ...item, leading, height: leading + 0.6 + extra };
        }
        if (item.kind === 'labeled-line') {
            doc.setFontSize(item.size);
            const availWidth = width - (item.indent || 0);
            const combined = `${item.label}${item.value}`;
            doc.setFont('helvetica', 'bold');
            const lines = doc.splitTextToSize(combined, availWidth);
            return { ...item, lines, leading, height: lines.length * leading + 0.6 + extra };
        }
        doc.setFont('helvetica', item.bold ? 'bold' : 'normal');
        doc.setFontSize(item.size);
        const lines = doc.splitTextToSize(item.text, width - (item.indent || 0));
        return { ...item, lines, leading, height: lines.length * leading + (item.ruleBelow ? 2.2 : 0.6) + extra };
    });

    const height = rows => rows.reduce((sum, item) => sum + item.height, 0);

    function ensureSpace(needed) {
        if (needed > bottom - margin) throw new Error('CV block exceeds a page');
        if (y + needed > bottom) {
            if (doc.getNumberOfPages() >= cfg.maxPages) {
                throw new Error('CV exceeds max pages; edit selection instead of shrinking text');
            }
            doc.addPage();
            y = margin;
        }
    }

    function applyColor(rgb) {
        const c = rgb || COLORS.body;
        doc.setTextColor(c[0], c[1], c[2]);
    }

    function paint(rows, section, kind) {
        const page = doc.getNumberOfPages();
        const top = y;
        for (const item of rows) {
            const xBase = margin + (item.indent || 0);
            const baseline = y + item.size * 25.4 / 72;

            if (item.kind === 'inline-segments') {
                doc.setFontSize(item.size);
                let cursorX = xBase;
                for (const seg of item.segments) {
                    doc.setFont('helvetica', seg.bold ? 'bold' : 'normal');
                    applyColor(seg.color || COLORS.body);
                    const segW = doc.getTextWidth(seg.text);
                    doc.text(seg.text, cursorX, baseline);
                    if (seg.link) {
                        doc.link(cursorX, y, segW, item.leading, { url: seg.link });
                        links.push({ page, section, text: seg.text, url: seg.link });
                    }
                    cursorX += segW;
                }
                y += item.leading + 0.6 + (item.extraAfter || 0);
                continue;
            }

            if (item.kind === 'split-header') {
                doc.setFontSize(item.size);
                doc.setFont('helvetica', 'bold');
                applyColor(COLORS.navy);
                const w1 = doc.getTextWidth(item.leftPrimary);
                doc.text(item.leftPrimary, xBase, baseline);

                if (item.leftSecondary) {
                    doc.setFont('helvetica', 'normal');
                    applyColor(COLORS.accent);
                    const w2 = doc.getTextWidth(item.leftSecondary);
                    doc.text(item.leftSecondary, xBase + w1, baseline);
                    if (item.leftLink) {
                        doc.link(xBase + w1, y, w2, item.leading, { url: item.leftLink });
                        links.push({ page, section, text: item.leftSecondary.trim(), url: item.leftLink });
                    }
                }

                if (item.rightText) {
                    doc.setFont('helvetica', 'normal');
                    applyColor(COLORS.muted);
                    const rw = doc.getTextWidth(item.rightText);
                    const rx = margin + width - rw;
                    doc.text(item.rightText, rx, baseline);
                    if (item.rightLink) {
                        doc.link(rx, y, rw, item.leading, { url: item.rightLink });
                        links.push({ page, section, text: item.rightText, url: item.rightLink });
                    }
                }
                y += item.leading + 0.6 + (item.extraAfter || 0);
                continue;
            }

            if (item.kind === 'labeled-line') {
                doc.setFontSize(item.size);
                for (let idx = 0; idx < item.lines.length; idx++) {
                    const line = item.lines[idx];
                    const lineBaseline = y + item.size * 25.4 / 72;
                    if (idx === 0 && line.startsWith(item.label)) {
                        doc.setFont('helvetica', 'bold');
                        applyColor(COLORS.navy);
                        const lw = doc.getTextWidth(item.label);
                        doc.text(item.label, xBase, lineBaseline);
                        doc.setFont('helvetica', 'normal');
                        applyColor(item.color || COLORS.body);
                        doc.text(line.slice(item.label.length), xBase + lw, lineBaseline);
                    } else {
                        doc.setFont('helvetica', 'normal');
                        applyColor(item.color || COLORS.body);
                        doc.text(line, xBase, lineBaseline);
                    }
                    y += item.leading;
                }
                y += 0.6 + (item.extraAfter || 0);
                continue;
            }

            doc.setFont('helvetica', item.bold ? 'bold' : 'normal');
            doc.setFontSize(item.size);
            applyColor(item.color || COLORS.body);

            for (const line of item.lines) {
                const lineWidth = doc.getTextWidth(line);
                if (xBase + lineWidth > margin + width + 0.05) throw new Error('Text exceeds right margin');
                const lineBaseline = y + item.size * 25.4 / 72;
                doc.text(line, xBase, lineBaseline);
                if (item.link) {
                    doc.link(xBase, y, lineWidth, item.leading, { url: item.link });
                    links.push({ page, section, text: line, url: item.link });
                }
                y += item.leading;
            }

            if (item.ruleBelow) {
                doc.setDrawColor(COLORS.rule[0], COLORS.rule[1], COLORS.rule[2]);
                doc.setLineWidth(0.25);
                doc.line(margin, y + 0.6, margin + width, y + 0.6);
                y += 2.2;
            } else {
                y += 0.6;
            }
            y += (item.extraAfter || 0);
        }
        layout.push({ page, section, kind, top, bottom: y });
    }

    for (const id of target.sectionOrder) {
        const blocks = sections.get(id);
        if (!blocks) throw new Error(`Unsupported section: ${id}`);
        if (!blocks.length || !blocks[0].length) continue;

        const heading = ['identity', 'contact'].includes(id)
            ? []
            : measure([row(required(labels[id], 'section heading').toUpperCase(), {
                size: 10.5,
                bold: true,
                color: COLORS.navy,
                ruleBelow: true
            })]);
        const measured = blocks.map(measure);

        // Keep the section heading and entire first block together. Jobs never split.
        ensureSpace(height(heading) + height(measured[0]));
        if (heading.length) paint(heading, id, 'heading');
        for (const block of measured) {
            ensureSpace(height(block));
            paint(block, id, 'content');
            y += id === 'experience' ? 2.5 : 1.2;
        }
        y += id === 'contact' ? 1.5 : 2.0;
    }

    const bytes = Buffer.from(doc.output('arraybuffer'));
    const sha256 = createHash('sha256').update(bytes).digest('hex');
    return { bytes, pages: doc.getNumberOfPages(), layout, links, sha256 };
}

module.exports = { createCv };
