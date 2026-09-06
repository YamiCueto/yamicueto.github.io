'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const PORT = 3088;

const mimeTypes = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=UTF-8',
  '.xml': 'application/xml; charset=UTF-8'
};

function createServer() {
  return http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
    const filePath = path.join(root, reqPath.replace(/^\//, ''));
    if (!filePath.startsWith(root)) {
      res.writeHead(403);
      return res.end('Forbidden');
    }
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        return res.end('Not found');
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      res.end(data);
    });
  });
}

async function runValidation() {
  const server = createServer();
  await new Promise(resolve => server.listen(PORT, resolve));
  console.log(`[Playwright QA] Local test server listening on http://localhost:${PORT}`);

  const outDir = path.join(root, 'tmp/playwright');
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  let hasErrors = false;

  try {
    const viewports = [
      { name: 'desktop', width: 1920, height: 1080, isMobile: false },
      { name: 'mobile', width: 375, height: 812, isMobile: true }
    ];

    for (const vp of viewports) {
      console.log(`\n==============================`);
      console.log(`[Playwright QA] Testing Viewport: ${vp.name.toUpperCase()} (${vp.width}x${vp.height})`);
      console.log(`==============================`);

      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        isMobile: vp.isMobile
      });
      const page = await context.newPage();

      const consoleErrors = [];
      const failedRequests = [];

      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      page.on('pageerror', err => {
        consoleErrors.push(err.message);
      });
      page.on('requestfailed', req => {
        const url = req.url();
        if (url.includes('fonts.googleapis.com') || url.includes('cdnjs.cloudflare.com')) {
          console.warn(`[External notice] External CDN request failed: ${url}`);
        } else {
          failedRequests.push(`${req.method()} ${url} - ${req.failure()?.errorText}`);
        }
      });

      const response = await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
      console.log(`[Playwright QA] Page loaded with status: ${response.status()}`);

      await page.waitForTimeout(1000);

      const profileData = await page.evaluate(() => {
        const title = document.title;
        const headline = document.querySelector('#typing-text')?.textContent.trim();
        const summary = document.querySelector('#profile-summary')?.textContent.trim();
        const skillGroups = [...document.querySelectorAll('#profile-skills .skills-group')].map(g => ({
          label: g.querySelector('h3')?.textContent.trim(),
          count: g.querySelectorAll('.skill-tag').length
        }));
        const timelineItems = [...document.querySelectorAll('#profile-experience .timeline-item')].map(item => ({
          date: item.querySelector('.timeline-date')?.textContent.trim(),
          title: item.querySelector('.timeline-title')?.textContent.trim(),
          company: item.querySelector('.timeline-company')?.textContent.trim(),
          highlightsCount: item.querySelectorAll('.timeline-description li').length
        }));
        const scrollWidth = document.documentElement.scrollWidth;
        const innerWidth = window.innerWidth;
        const hasHorizontalScroll = scrollWidth > innerWidth;

        return {
          title,
          headline,
          summary,
          skillGroups,
          timelineItems,
          scrollWidth,
          innerWidth,
          hasHorizontalScroll
        };
      });

      console.log(`[Page Title]: ${profileData.title}`);
      console.log(`[Headline]: ${profileData.headline}`);
      console.log(`[Skill Groups Count]: ${profileData.skillGroups.length}`);
      console.log(`[Timeline Items Count]: ${profileData.timelineItems.length}`);
      profileData.timelineItems.forEach((t, idx) => {
        console.log(`  ${idx + 1}. [${t.date}] ${t.title} @ ${t.company} (${t.highlightsCount} bullets)`);
      });

      if (!profileData.headline.includes('Full Stack Engineer')) {
        console.error(`❌ [Assertion Failed] Headline does not match expected: "${profileData.headline}"`);
        hasErrors = true;
      }
      if (profileData.timelineItems.length < 5) {
        console.error(`❌ [Assertion Failed] Expected at least 5 timeline items, got: ${profileData.timelineItems.length}`);
        hasErrors = true;
      }
      const hasSoftwareOne = profileData.timelineItems.some(item => item.company.includes('SoftwareONE'));
      if (!hasSoftwareOne) {
        console.error(`❌ [Assertion Failed] Timeline is missing SoftwareONE (Intergrupo)`);
        hasErrors = true;
      }
      const hasPersonalSoft = profileData.timelineItems.some(item => item.company.includes('Personal Soft'));
      if (!hasPersonalSoft) {
        console.error(`❌ [Assertion Failed] Timeline is missing Personal Soft`);
        hasErrors = true;
      }
      const hasSennova = profileData.timelineItems.some(item => item.company.includes('SENNOVA'));
      if (!hasSennova) {
        console.error(`❌ [Assertion Failed] Timeline is missing SENNOVA`);
        hasErrors = true;
      }
      const hasExtreme = profileData.timelineItems.some(item => item.company.includes('Extreme Technologies'));
      if (!hasExtreme) {
        console.error(`❌ [Assertion Failed] Timeline is missing Extreme Technologies`);
        hasErrors = true;
      }

      if (profileData.hasHorizontalScroll) {
        console.warn(`⚠️ [Layout Warning] Horizontal scroll detected in ${vp.name}: scrollWidth (${profileData.scrollWidth}) > innerWidth (${profileData.innerWidth})`);
      } else {
        console.log(`✅ [Layout OK] No horizontal overflow detected (${profileData.scrollWidth}px / ${profileData.innerWidth}px)`);
      }

      if (consoleErrors.length > 0) {
        console.error(`❌ [Console Errors]:`, consoleErrors);
        hasErrors = true;
      } else {
        console.log(`✅ [Console OK] 0 errors`);
      }

      if (failedRequests.length > 0) {
        console.error(`❌ [Failed Requests]:`, failedRequests);
        hasErrors = true;
      } else {
        console.log(`✅ [Network OK] All local requests completed successfully`);
      }

      const shotPath = path.join(outDir, `portfolio-${vp.name}.png`);
      await page.screenshot({ path: shotPath, fullPage: true });
      console.log(`📸 [Screenshot] Saved full page to ${shotPath}`);

      await context.close();
    }
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
    console.log(`[Playwright QA] Local test server stopped.`);
  }

  if (hasErrors) {
    console.error(`\n❌ Validation completed with ERRORS.`);
    process.exit(1);
  } else {
    console.log(`\n🎉 All validations PASSED flawlessly!`);
  }
}

runValidation().catch(err => {
  console.error(`[Playwright Fatal Error]`, err);
  process.exit(1);
});
