const puppeteer = require('puppeteer');

(async () => {
  try {
    console.log('Iniciando teste de login...');
    
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ['--start-maximized']
    });
    
    const page = await browser.newPage();
    
    // Navegar para a página de login
    console.log('Navegando para http://localhost:3003');
    await page.goto('http://localhost:3003', { waitUntil: 'networkidle2' });
    
    // Verificar título da página de login
    const loginTitle = await page.title();
    console.log('Título da página de login:', loginTitle);
    
    // Aguardar os campos de login aparecerem
    await page.waitForSelector('input[type="email"]', { timeout: 5000 });
    await page.waitForSelector('input[type="password"]', { timeout: 5000 });
    
    // Preencher credenciais de admin
    console.log('Preenchendo credenciais de admin...');
    await page.type('input[type="email"]', 'admin@fisioflow.com');
    await page.type('input[type="password"]', 'admin123');
    
    // Clicar no botão de login
    console.log('Clicando no botão de login...');
    await page.click('button[type="submit"]');
    
    // Aguardar navegação
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });
    
    // Verificar título após login
    const dashboardTitle = await page.title();
    console.log('Título após login:', dashboardTitle);
    console.log('URL atual:', page.url());
    
    // Aguardar um pouco para ver a página
    await page.waitForTimeout(2000);
    
    console.log('Teste de login admin concluído com sucesso!');
    
    await browser.close();
  } catch (error) {
    console.error('Erro durante o teste:', error.message);
    process.exit(1);
  }
})();