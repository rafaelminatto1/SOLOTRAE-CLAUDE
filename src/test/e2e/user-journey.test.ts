import { e2eUtils } from '../utils/setupE2E';

describe('User Journey E2E Tests', () => {
  beforeEach(async () => {
    await e2eUtils.clearTestData();
  });

  describe('Admin User Journey', () => {
    it('deve completar jornada completa do administrador', async () => {
      // 1. Fazer login
      await e2eUtils.goToPage('/login');
      await e2eUtils.login('admin@fisioflow.com', 'admin123');
      
      // Verificar redirecionamento para dashboard
      await e2eUtils.waitForText('Dashboard');
      await e2eUtils.waitForText('Bem-vindo');

      // 2. Acessar página de pacientes
      const page = e2eUtils.getCurrentPage();
      await page.click('[data-testid="nav-patients"]');
      await e2eUtils.waitForText('Pacientes');
      
      // 3. Criar novo paciente
      await page.click('[data-testid="add-patient-button"]');
      await e2eUtils.waitForText('Novo Paciente');
      
      await page.type('[data-testid="patient-name"]', 'João da Silva');
      await page.type('[data-testid="patient-email"]', 'joao@email.com');
      await page.type('[data-testid="patient-phone"]', '(11) 99999-9999');
      await page.type('[data-testid="patient-birthdate"]', '1985-05-15');
      
      await page.click('[data-testid="save-patient-button"]');
      await e2eUtils.waitForText('Paciente criado com sucesso');

      // 4. Agendar consulta para o paciente
      await page.click('[data-testid="nav-appointments"]');
      await e2eUtils.waitForText('Consultas');
      
      await page.click('[data-testid="add-appointment-button"]');
      await e2eUtils.waitForText('Nova Consulta');
      
      await page.select('[data-testid="appointment-patient"]', '1');
      await page.select('[data-testid="appointment-physiotherapist"]', '1');
      await page.type('[data-testid="appointment-date"]', '2024-12-31');
      await page.type('[data-testid="appointment-time"]', '14:00');
      await page.type('[data-testid="appointment-notes"]', 'Primeira consulta');
      
      await page.click('[data-testid="save-appointment-button"]');
      await e2eUtils.waitForText('Consulta agendada com sucesso');

      // 5. Verificar dashboard atualizado
      await page.click('[data-testid="nav-dashboard"]');
      await e2eUtils.waitForText('Dashboard');
      
      // Verificar se estatísticas foram atualizadas
      await e2eUtils.waitForElement('[data-testid="stats-patients"]');
      await e2eUtils.waitForElement('[data-testid="stats-appointments"]');

      // 6. Fazer logout
      await e2eUtils.logout();
      await e2eUtils.waitForText('Login');
    }, 60000); // Timeout de 60 segundos
  });

  describe('Physiotherapist User Journey', () => {
    it('deve completar jornada do fisioterapeuta', async () => {
      // Login como fisioterapeuta
      await e2eUtils.login('fisio@fisioflow.com', 'fisio123');
      
      const page = e2eUtils.getCurrentPage();

      // Verificar acesso limitado baseado em role
      await e2eUtils.waitForText('Dashboard');
      
      // Tentar acessar área administrativa (deve ser bloqueado)
      const adminLink = await page.$('[data-testid="nav-admin"]');
      expect(adminLink).toBeNull();

      // Acessar consultas (permitido)
      await page.click('[data-testid="nav-appointments"]');
      await e2eUtils.waitForText('Minhas Consultas');

      // Acessar exercícios (permitido)
      await page.click('[data-testid="nav-exercises"]');
      await e2eUtils.waitForText('Exercícios');

      // Criar novo exercício
      await page.click('[data-testid="add-exercise-button"]');
      await e2eUtils.waitForText('Novo Exercício');
      
      await page.type('[data-testid="exercise-name"]', 'Flexão de Joelho');
      await page.select('[data-testid="exercise-category"]', 'Fortalecimento');
      await page.type('[data-testid="exercise-description"]', 'Exercício para fortalecimento');
      await page.type('[data-testid="exercise-duration"]', '30');
      await page.type('[data-testid="exercise-repetitions"]', '15');

      await page.click('[data-testid="save-exercise-button"]');
      await e2eUtils.waitForText('Exercício criado com sucesso');

      await e2eUtils.logout();
    }, 45000);
  });

  describe('Patient Portal Journey', () => {
    it('deve completar jornada do portal do paciente', async () => {
      // Login como paciente
      await e2eUtils.login('paciente@email.com', 'paciente123');
      
      const page = e2eUtils.getCurrentPage();

      // Verificar redirecionamento para portal do paciente
      await e2eUtils.waitForText('Portal do Paciente');

      // Visualizar consultas
      await e2eUtils.waitForElement('[data-testid="patient-appointments"]');
      
      // Visualizar plano de tratamento
      await e2eUtils.waitForElement('[data-testid="treatment-plan"]');
      
      // Visualizar exercícios prescritos
      await e2eUtils.waitForElement('[data-testid="prescribed-exercises"]');

      // Marcar exercício como concluído
      const exerciseCheckbox = await page.$('[data-testid="exercise-completed-1"]');
      if (exerciseCheckbox) {
        await exerciseCheckbox.click();
        await e2eUtils.waitForText('Progresso atualizado');
      }

      await e2eUtils.logout();
    }, 30000);
  });

  describe('Responsive Design Journey', () => {
    it('deve funcionar em dispositivos móveis', async () => {
      const page = e2eUtils.getCurrentPage();
      
      // Simular dispositivo móvel
      await page.setViewport({ width: 375, height: 667 });
      
      await e2eUtils.login();
      
      // Verificar se menu hamburger aparece
      await e2eUtils.waitForElement('[data-testid="mobile-menu-button"]');
      
      // Abrir menu móvel
      await page.click('[data-testid="mobile-menu-button"]');
      await e2eUtils.waitForElement('[data-testid="mobile-nav"]');
      
      // Navegar usando menu móvel
      await page.click('[data-testid="mobile-nav-patients"]');
      await e2eUtils.waitForText('Pacientes');

      // Verificar se tabela é responsiva
      await e2eUtils.waitForElement('[data-testid="responsive-table"]');

      await e2eUtils.logout();
    }, 30000);
  });

  describe('Performance Journey', () => {
    it('deve manter boa performance durante navegação', async () => {
      await e2eUtils.login();
      
      const page = e2eUtils.getCurrentPage();

      // Medir tempo de carregamento de páginas
      const startTime = Date.now();
      
      await page.click('[data-testid="nav-patients"]');
      await e2eUtils.waitForText('Pacientes');
      
      const patientsLoadTime = Date.now() - startTime;
      expect(patientsLoadTime).toBeLessThan(3000); // Menos que 3 segundos

      // Medir navegação entre páginas
      const navStartTime = Date.now();
      
      await page.click('[data-testid="nav-appointments"]');
      await e2eUtils.waitForText('Consultas');
      
      const navTime = Date.now() - navStartTime;
      expect(navTime).toBeLessThan(2000); // Menos que 2 segundos

      // Obter métricas de performance
      const metrics = await e2eUtils.getPerformanceMetrics();
      expect(metrics.JSHeapUsedSize).toBeLessThan(50 * 1024 * 1024); // Menos que 50MB

      await e2eUtils.logout();
    }, 45000);
  });

  describe('Accessibility Journey', () => {
    it('deve ser acessível para usuários com deficiência', async () => {
      await e2eUtils.login();
      
      // Verificar acessibilidade básica
      const violations = await e2eUtils.checkAccessibility();
      expect(violations.length).toBe(0);

      const page = e2eUtils.getCurrentPage();

      // Testar navegação por teclado
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
      
      // Verificar se navegação por teclado funciona
      await e2eUtils.waitForElement('[data-testid="focused-element"]');

      // Testar leitores de tela (verificar ARIA labels)
      const ariaLabels = await page.$$eval('[aria-label]', elements => 
        elements.map(el => el.getAttribute('aria-label'))
      );
      expect(ariaLabels.length).toBeGreaterThan(0);

      await e2eUtils.logout();
    }, 30000);
  });
});