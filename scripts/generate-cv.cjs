'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { createCv } = require('../js/cv-pdf');

const root = path.resolve(__dirname, '..');
const profile = JSON.parse(fs.readFileSync(path.join(root, 'src/data/professional-profile.json'), 'utf8'));

const targetsToBuild = [
    {
        targetFile: 'src/data/targets/fullstack-engineer.json',
        outputFiles: ['Yamid_Cueto_Fullstack_Engineer_CV.pdf']
    },
    {
        targetFile: 'src/data/targets/amadeus-r35120.json',
        outputFiles: ['Yamid_Cueto_Amadeus_R35120.pdf']
    },
    {
        targetFile: 'src/data/targets/fullstack-engineer-es.json',
        outputFiles: ['Yamid_Cueto_Fullstack_Engineer_CV_ES.pdf']
    }
];

const outputDir = path.join(root, 'output/pdf');
const cvDir = path.join(root, 'cv');
fs.mkdirSync(outputDir, { recursive: true });
fs.mkdirSync(cvDir, { recursive: true });

const manifest = {};

for (const entry of targetsToBuild) {
    const target = JSON.parse(fs.readFileSync(path.join(root, entry.targetFile), 'utf8'));
    const result = createCv(profile, target);
    const repeated = createCv(profile, target);

    if (!result.bytes.equals(repeated.bytes) || result.sha256 !== repeated.sha256) {
        throw new Error(`PDF generation is not deterministic for target: ${target.id}`);
    }

    const diskSha = createHash('sha256').update(result.bytes).digest('hex');
    if (diskSha !== result.sha256) {
        throw new Error(`SHA-256 mismatch for target: ${target.id}`);
    }

    for (const fileName of entry.outputFiles) {
        fs.writeFileSync(path.join(outputDir, fileName), result.bytes);
        fs.writeFileSync(path.join(cvDir, fileName), result.bytes);
    }

    if (target.id === 'fullstack-engineer') {
        fs.writeFileSync(path.join(outputDir, 'layout.json'), JSON.stringify(result.layout, null, 2) + '\n');
    }

    manifest[target.id] = {
        files: entry.outputFiles,
        locale: target.locale,
        pages: result.pages,
        bytes: result.bytes.length,
        sha256: result.sha256,
        linksCount: result.links.length,
        links: result.links
    };

    console.log(`[CV Build] ${target.id} (${target.locale.toUpperCase()}): ${result.pages} A4 pages, ${result.bytes.length} bytes, ${result.links.length} clickable links | SHA-256: ${result.sha256.slice(0, 16)}...`);
}

fs.writeFileSync(path.join(outputDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
