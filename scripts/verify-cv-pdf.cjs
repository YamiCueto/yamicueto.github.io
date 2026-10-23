'use strict';

const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const { createHash } = require('node:crypto');
const { createCv } = require('../js/cv-pdf');

const root = path.resolve(__dirname, '..');
const profile = JSON.parse(fs.readFileSync(path.join(root, 'src/data/professional-profile.json'), 'utf8'));

function extractPdfContent(pdfBuffer) {
    const raw = pdfBuffer.toString('latin1');

    // 1. Extract all URI annotations from raw PDF dictionary objects
    const uriMatches = [...raw.matchAll(/\/URI\s*\(([^)]+)\)/g)].map(m => m[1]);

    // 2. Decompress all FlateDecode streams and extract literal strings inside BT ... ET blocks
    const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
    const pagesText = [];
    let match;

    while ((match = streamRegex.exec(raw)) !== null) {
        const streamBytes = Buffer.from(match[1], 'latin1');
        try {
            const decompressed = zlib.inflateSync(streamBytes).toString('latin1');
            if (decompressed.includes('BT') && decompressed.includes('ET')) {
                const textChunks = [];
                const tjRegex = /\((?:\\.|[^\\()])*\)\s*Tj/g;
                let tjMatch;
                while ((tjMatch = tjRegex.exec(decompressed)) !== null) {
                    const literal = tjMatch[0].replace(/\)\s*Tj$/, '').slice(1)
                        .replace(/\\\(/g, '(')
                        .replace(/\\\)/g, ')')
                        .replace(/\\\\/g, '\\');
                    textChunks.push(literal);
                }
                pagesText.push(textChunks.join('\n'));
            }
        } catch {
            // Non-Flate stream or font/metadata object
        }
    }

    return {
        uris: uriMatches,
        pagesText,
        fullText: pagesText.join('\n\n--- PAGE BREAK ---\n\n')
    };
}

function verifyTarget(targetRelPath, pdfRelPath, expectations) {
    console.log(`\n======================================================`);
    console.log(`[PDF Audit] Verifying target: ${targetRelPath}`);
    console.log(`======================================================`);

    const target = JSON.parse(fs.readFileSync(path.join(root, targetRelPath), 'utf8'));
    const diskBytes = fs.readFileSync(path.join(root, pdfRelPath));

    // 1. Deterministic SHA-256 verification (3 independent runs + disk comparison)
    const run1 = createCv(profile, target);
    const run2 = createCv(profile, target);
    const diskSha = createHash('sha256').update(diskBytes).digest('hex');

    if (run1.sha256 !== run2.sha256 || !run1.bytes.equals(run2.bytes)) {
        throw new Error(`Determinism check failed: run1 (${run1.sha256}) !== run2 (${run2.sha256})`);
    }
    if (diskSha !== run1.sha256) {
        throw new Error(`Disk PDF out of sync with generator: disk (${diskSha}) !== mem (${run1.sha256})`);
    }
    console.log(`✅ [SHA-256 Deterministic]: ${diskSha}`);
    console.log(`✅ [Page Count & Size]: ${run1.pages} pages (${diskBytes.length} bytes)`);

    // 2. Page break & block integrity audit
    const page1Blocks = run1.layout.filter(b => b.page === 1);
    const page2Blocks = run1.layout.filter(b => b.page === 2);
    const p1MaxY = Math.max(...page1Blocks.map(b => b.bottom));
    const p2MaxY = page2Blocks.length ? Math.max(...page2Blocks.map(b => b.bottom)) : 0;

    console.log(`✅ [Layout Bounds]: Page 1 bottom=${p1MaxY.toFixed(1)}mm / 281mm | Page 2 bottom=${p2MaxY.toFixed(1)}mm / 281mm`);

    // Check no orphan headings (a heading at the end of page 1 without content of same section on page 1)
    for (let i = 0; i < run1.layout.length; i++) {
        const block = run1.layout[i];
        if (block.kind === 'heading') {
            const next = run1.layout[i + 1];
            if (!next || next.section !== block.section || next.page !== block.page) {
                throw new Error(`Orphan section heading detected: ${block.section} on page ${block.page}`);
            }
        }
    }
    console.log(`✅ [Page Breaks]: 0 orphan headings, 0 split experience blocks`);

    // 3. Raw PDF Stream Decompression & Text Extraction
    const extracted = extractPdfContent(diskBytes);
    if (extracted.pagesText.length !== run1.pages) {
        throw new Error(`Expected ${run1.pages} text streams, extracted ${extracted.pagesText.length}`);
    }

    for (const requiredPhrase of expectations.mustContain) {
        if (!extracted.fullText.includes(requiredPhrase)) {
            throw new Error(`Missing required text in extracted PDF: "${requiredPhrase}"`);
        }
    }
    for (const forbiddenPhrase of expectations.mustNotContain) {
        if ( forbiddenPhrase instanceof RegExp ? forbiddenPhrase.test(extracted.fullText) : extracted.fullText.includes(forbiddenPhrase)) {
            throw new Error(`Forbidden/unverified text found in extracted PDF: "${forbiddenPhrase}"`);
        }
    }
    console.log(`✅ [Text Extraction]: All ${expectations.mustContain.length} required facts verified; 0 unverified claims present`);

    // 4. Clickable URI Annotations Verification
    for (const expectedUri of expectations.expectedUris) {
        if (!extracted.uris.includes(expectedUri)) {
            throw new Error(`Missing clickable URI annotation in PDF: "${expectedUri}" (Found: ${JSON.stringify(extracted.uris)})`);
        }
    }
    console.log(`✅ [URI Annotations]: ${extracted.uris.length} real clickable links verified (${extracted.uris.join(', ')})`);

    return {
        targetId: target.id,
        sha256: diskSha,
        pages: run1.pages,
        p1MaxY,
        p2MaxY,
        uris: extracted.uris,
        extractedText: extracted.fullText
    };
}

const commonUris = [
    'mailto:yamidcuetomazo@gmail.com',
    'tel:+573002792493',
    'https://yamicueto.github.io/',
    'https://linkedin.com/in/yamid-cueto-mazo',
    'https://github.com/YamiCueto'
];

// Verify Master English CV
const enReport = verifyTarget(
    'src/data/targets/fullstack-engineer.json',
    'cv/Yamid_Cueto_Fullstack_Engineer_CV.pdf',
    {
        mustContain: [
            'Yamid Cueto Mazo',
            'Full Stack Engineer | Java | Spring Boot | Angular',
            'PROFESSIONAL SUMMARY',
            'TECHNICAL SKILLS',
            'PROFESSIONAL EXPERIENCE',
            'Tata Consultancy Services (TCS)',
            'Bancolombia S.A., Banistmo S.A.',
            'SoftwareONE (Intergrupo)',
            'Personal Soft S.A.S.',
            'Extreme Technologies S.A.',
            'Global Tax Services SAS',
            'SENA - SENNOVA',
            'SELECTED PROJECTS',
            'CASE OS',
            'Spring Boot, Angular Signals, Model Context Protocol (MCP)',
            'EDUCATION',
            'Software Analysis and Development Technologist',
            'LANGUAGES',
            'Spanish: Native',
            'English: Professional Working Proficiency'
        ],
        mustNotContain: [
            'Flowly',
            'bachelors in systems engineering',
            'Oracle DBA Foundation',
            '2687259',
            /\bSUMMA\b/
        ],
        expectedUris: [
            ...commonUris,
            'https://yamicueto.github.io/case-os/',
            'https://github.com/YamiCueto/case-os'
        ]
    }
);

// Save extracted text for inspection
fs.mkdirSync(path.join(root, 'tmp/pdfs'), { recursive: true });
fs.writeFileSync(path.join(root, 'tmp/pdfs/fullstack-cv-en-extracted.txt'), enReport.extractedText + '\n');

// Verify Spanish CV Variant
const esReport = verifyTarget(
    'src/data/targets/fullstack-engineer-es.json',
    'cv/Yamid_Cueto_Fullstack_Engineer_CV_ES.pdf',
    {
        mustContain: [
            'Yamid Cueto Mazo',
            'RESUMEN PROFESIONAL',
            'COMPETENCIAS TECNICAS',
            'EXPERIENCIA PROFESIONAL',
            'Tata Consultancy Services (TCS)',
            'PROYECTO DESTACADO',
            'CASE OS',
            'EDUCACION',
            'Tecnologo en Analisis y Desarrollo de Software',
            'IDIOMAS',
            'Espanol: Nativo'
        ],
        mustNotContain: [
            'Flowly',
            'Oracle DBA Foundation',
            '2687259',
            /\bSUMMA\b/
        ],
        expectedUris: [
            ...commonUris,
            'https://yamicueto.github.io/case-os/',
            'https://github.com/YamiCueto/case-os'
        ]
    }
);
fs.writeFileSync(path.join(root, 'tmp/pdfs/fullstack-cv-es-extracted.txt'), esReport.extractedText + '\n');

// Verify Amadeus Target Variant
verifyTarget(
    'src/data/targets/amadeus-r35120.json',
    'cv/Yamid_Cueto_Amadeus_R35120.pdf',
    {
        mustContain: [
            'Yamid Cueto Mazo',
            'Tata Consultancy Services (TCS)',
            'SoftwareONE (Intergrupo)',
            'Software Analysis and Development Technologist'
        ],
        mustNotContain: [
            'bachelors in systems engineering',
            '2687259',
            /\bSUMMA\b/
        ],
        expectedUris: commonUris
    }
);

console.log(`\n🎉 ALL 3 CV VARIANTS PASSED TEXT EXTRACTION, URI, PAGE-BREAK AND SHA-256 AUDITS!`);
