const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
};

function createStaticServer(root, port = 3099) {
  const server = http.createServer((req, res) => {
    let filePath = path.join(root, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
    if (!fs.existsSync(filePath)) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  });
  return new Promise((resolve) => server.listen(port, () => resolve(server)));
}

(async () => {
  const root = path.resolve(__dirname, '..');
  const server = await createStaticServer(root, 3099);
  console.log('[Audit] Server running on http://localhost:3099');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  await page.goto('http://localhost:3099', { waitUntil: 'networkidle' });

  // 1. Audit Hero Code Window Tabs
  console.log('[Audit 1/5] Testing Hero Code Tabs...');
  const javaTab = page.locator('.code-tab[data-tab="java"]');
  await javaTab.click();
  const javaPanel = page.locator('.code-tab-panel[data-tab="java"]');
  const isJavaVisible = await javaPanel.isVisible();
  console.log(` - Java tab active & visible: ${isJavaVisible}`);
  if (!isJavaVisible) throw new Error('Java tab panel failed to become visible');

  // Copy button
  const copyBtn = page.locator('#code-copy-btn');
  await copyBtn.click();
  const toast = page.locator('#toast');
  const toastVisible = await toast.isVisible();
  const toastText = await toast.textContent();
  console.log(` - Code Copy Toast: visible=${toastVisible}, text="${toastText}"`);

  // 2. Audit Scroll Progress
  console.log('[Audit 2/5] Testing Scroll Progress Bar...');
  const scrollBar = page.locator('#scroll-progress');
  const barExists = await scrollBar.count() > 0;
  console.log(` - Scroll progress bar present: ${barExists}`);
  await page.evaluate(() => window.scrollTo(0, 1500));
  await page.waitForTimeout(200);
  const transformStyle = await scrollBar.evaluate(el => el.style.transform);
  console.log(` - Scroll progress bar transform on scroll: ${transformStyle}`);

  // 3. Audit Awards Section
  console.log('[Audit 3/5] Testing TCS Awards Vitrine...');
  const awardsCount = await page.locator('.award-row').count();
  console.log(` - Award rows count: ${awardsCount}`);
  if (awardsCount < 3) throw new Error(`Expected at least 3 award rows, found ${awardsCount}`);

  // 4. Audit Projects Direct CTAs & Tech Tag filtering
  console.log('[Audit 4/5] Testing Project Card Actions & Tag Filtering...');
  const projectActions = await page.locator('.project-actions').count();
  console.log(` - Project action containers: ${projectActions}`);
  
  const techTag = page.locator('.projects-grid .tech-tag').first();
  const tagText = await techTag.textContent();
  await techTag.click();
  console.log(` - Clicked tech-tag "${tagText.trim()}"`);

  // 5. Audit Availability Card & Copy Email
  console.log('[Audit 5/5] Testing Availability & Copy Email...');
  const availCard = page.locator('.availability-card');
  const isAvailVisible = await availCard.isVisible();
  console.log(` - Availability card visible: ${isAvailVisible}`);

  const copyEmailBtn = page.locator('#copy-email-btn');
  await copyEmailBtn.click();
  await page.waitForTimeout(100);
  const emailToastText = await toast.textContent();
  console.log(` - Email Copy Toast: text="${emailToastText}"`);

  // Take screenshot of hero & awards
  const heroScreenshot = path.join(root, 'tmp', 'playwright', 'interactive-hero.png');
  await page.locator('.hero').screenshot({ path: heroScreenshot });
  console.log(`📸 Hero screenshot saved to ${heroScreenshot}`);

  const contactScreenshot = path.join(root, 'tmp', 'playwright', 'interactive-contact.png');
  await page.locator('#contact').screenshot({ path: contactScreenshot });
  console.log(`📸 Contact screenshot saved to ${contactScreenshot}`);

  console.log(`\nConsole Errors count: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.error('Console errors:', consoleErrors);
    throw new Error('Console errors encountered');
  }

  await browser.close();
  server.close();
  console.log('✅ ALL INTERACTIVE AUDIT CHECKS PASSED!');
})();
