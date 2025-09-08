import { beforeAll, afterAll } from '@jest/globals';
import puppeteer, { Browser, Page } from 'puppeteer';

let browser: Browser;
let page: Page;

// Configuração global do Puppeteer para testes E2E
beforeAll(async () => {
  console.log('🚀 Iniciando browser para testes E2E...');
  
  browser = await puppeteer.launch({
    headless: process.env.CI === 'true',
    slowMo: process.env.CI ? 0 : 50,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--window-size=1920,1080',
    ],
  });
  
  page = await browser.newPage();
  
  // Configurar viewport
  await page.setViewport({ width: 1920, height: 1080 });
  
  // Configurar user agent
  await page.setUserAgent('FisioFlow-E2E-Tests');
  
  // Interceptar console logs para debugging
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('🔴 Console Error:', msg.text());
    }
  });
  
  // Interceptar erros de página
  page.on('pageerror', error => {
    console.log('🔴 Page Error:', error.message);
  });
  
  console.log('✅ Browser configurado para testes E2E');
});

afterAll(async () => {
  if (browser) {
    console.log('🛑 Fechando browser...');
    await browser.close();
    console.log('✅ Browser fechado');
  }
});

// Utilitários para testes E2E
export const e2eUtils = {
  // Navegar para página
  async goToPage(url: string) {
    const baseUrl = process.env.E2E_BASE_URL || 'http://localhost:5173';
    await page.goto(`${baseUrl}${url}`, { waitUntil: 'networkidle0' });
  },
  
  // Fazer login
  async login(email: string = 'admin@fisioflow.com', password: string = 'admin123') {
    await this.goToPage('/login');
    
    await page.type('[data-testid="email-input"]', email);
    await page.type('[data-testid="password-input"]', password);
    await page.click('[data-testid="login-button"]');
    
    // Aguardar redirecionamento
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
  },
  
  // Fazer logout
  async logout() {
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
  },
  
  // Aguardar elemento aparecer
  async waitForElement(selector: string, timeout: number = 10000) {
    await page.waitForSelector(selector, { timeout });
  },
  
  // Aguardar elemento desaparecer
  async waitForElementToDisappear(selector: string, timeout: number = 10000) {
    await page.waitForSelector(selector, { hidden: true, timeout });
  },
  
  // Aguardar texto aparecer
  async waitForText(text: string, timeout: number = 10000) {
    await page.waitForFunction(
      (searchText) => document.body.innerText.includes(searchText),
      { timeout },
      text
    );
  },
  
  // Capturar screenshot
  async takeScreenshot(name: string) {
    const screenshotPath = `./screenshots/${name}-${Date.now()}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Screenshot salvo: ${screenshotPath}`);
  },
  
  // Limpar dados de teste
  async clearTestData() {
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  },
  
  // Simular delay de rede
  async simulateSlowNetwork() {
    const client = await page.target().createCDPSession();
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: 1000000, // 1 Mbps
      uploadThroughput: 1000000,   // 1 Mbps
      latency: 100,                // 100ms
    });
  },
  
  // Resetar rede
  async resetNetwork() {
    const client = await page.target().createCDPSession();
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: -1,
      uploadThroughput: -1,
      latency: 0,
    });
  },
  
  // Verificar acessibilidade básica
  async checkAccessibility() {
    const violations = await page.evaluate(() => {
      // Verificações básicas de acessibilidade
      const issues = [];
      
      // Verificar se existem imagens sem alt
      const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
      if (imagesWithoutAlt.length > 0) {
        issues.push(`${imagesWithoutAlt.length} imagens sem atributo alt`);
      }
      
      // Verificar se existem botões sem texto
      const buttonsWithoutText = document.querySelectorAll('button:empty');
      if (buttonsWithoutText.length > 0) {
        issues.push(`${buttonsWithoutText.length} botões sem texto`);
      }
      
      // Verificar se existem inputs sem labels
      const inputsWithoutLabels = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
      if (inputsWithoutLabels.length > 0) {
        issues.push(`${inputsWithoutLabels.length} inputs sem labels`);
      }
      
      return issues;
    });
    
    if (violations.length > 0) {
      console.warn('⚠️ Problemas de acessibilidade encontrados:', violations);
    }
    
    return violations;
  },
  
  // Obter métricas de performance
  async getPerformanceMetrics() {
    const metrics = await page.metrics();
    console.log('📊 Métricas de performance:', metrics);
    return metrics;
  },
  
  // Página atual
  getCurrentPage() {
    return page;
  },
  
  // Browser atual
  getCurrentBrowser() {
    return browser;
  },
};