// Script para verificar títulos das páginas do FisioFlow
const fs = require('fs');
const path = require('path');

// Lista de todas as páginas disponíveis no sistema
const pages = [
  { name: 'Login', path: '/login', access: 'Público' },
  { name: 'Register', path: '/register', access: 'Público' },
  { name: 'Demo', path: '/demo', access: 'Público' },
  { name: 'Presentation', path: '/presentation', access: 'Público' },
  { name: 'Dashboard', path: '/dashboard', access: 'Todos usuários autenticados' },
  { name: 'Profile', path: '/profile', access: 'Todos usuários autenticados' },
  { name: 'Settings', path: '/settings', access: 'Todos usuários autenticados' },
  { name: 'Patients', path: '/patients', access: 'Staff (Admin, Fisioterapeuta, Secretária)' },
  { name: 'Appointments', path: '/appointments', access: 'Staff (Admin, Fisioterapeuta, Secretária)' },
  { name: 'Exercises', path: '/exercises', access: 'Fisioterapeuta' },
  { name: 'AI Assistant', path: '/ai', access: 'Fisioterapeuta' },
  { name: 'Financial', path: '/financial', access: 'Staff (Admin, Fisioterapeuta, Secretária)' },
  { name: 'Partnerships', path: '/partnerships', access: 'Admin' },
  { name: 'Body Map', path: '/bodymap', access: 'Staff (Admin, Fisioterapeuta, Secretária)' },
  { name: 'Reports', path: '/reports', access: 'Admin' },
  { name: 'Notifications', path: '/notifications', access: 'Admin' },
  { name: 'Mobile', path: '/mobile', access: 'Admin' },
  { name: 'Users Management', path: '/users', access: 'Admin' },
  { name: 'Patient Portal', path: '/portal', access: 'Paciente' },
  { name: 'Partner Portal', path: '/partner', access: 'Parceiro' }
];

// Função para verificar se um arquivo de página existe
function checkPageFile(pageName) {
  const possiblePaths = [
    path.join(__dirname, 'src', 'pages', `${pageName}.tsx`),
    path.join(__dirname, 'src', 'pages', `${pageName}.jsx`),
    path.join(__dirname, 'src', 'components', `${pageName}.tsx`),
    path.join(__dirname, 'src', 'components', `${pageName}.jsx`)
  ];
  
  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      return { exists: true, path: filePath };
    }
  }
  
  return { exists: false, path: null };
}

// Função para extrair título de um arquivo de componente
function extractTitleFromFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Procurar por document.title ou useEffect que define o título
    const titleMatches = [
      content.match(/document\.title\s*=\s*['"`]([^'"`]+)['"`]/),
      content.match(/useEffect\(\(\)\s*=>\s*{[^}]*document\.title\s*=\s*['"`]([^'"`]+)['"`]/),
      content.match(/<title[^>]*>([^<]+)<\/title>/),
      content.match(/title:\s*['"`]([^'"`]+)['"`]/)
    ];
    
    for (const match of titleMatches) {
      if (match && match[1]) {
        return match[1];
      }
    }
    
    // Se não encontrar título explícito, procurar por h1 ou título na página
    const h1Match = content.match(/<h1[^>]*>([^<]+)<\/h1>/);
    if (h1Match && h1Match[1]) {
      return h1Match[1].replace(/\{[^}]+\}/g, '').trim();
    }
    
    return 'Título não encontrado';
  } catch (error) {
    return `Erro ao ler arquivo: ${error.message}`;
  }
}

// Gerar relatório
console.log('='.repeat(80));
console.log('RELATÓRIO DE PÁGINAS E TÍTULOS - FISIOFLOW');
console.log('='.repeat(80));
console.log(`Data/Hora: ${new Date().toLocaleString('pt-BR')}`);
console.log('');

let implementedPages = 0;
let totalPages = pages.length;

pages.forEach((page, index) => {
  console.log(`${index + 1}. ${page.name}`);
  console.log(`   Rota: ${page.path}`);
  console.log(`   Acesso: ${page.access}`);
  
  const fileCheck = checkPageFile(page.name.replace(/\s+/g, ''));
  
  if (fileCheck.exists) {
    implementedPages++;
    const title = extractTitleFromFile(fileCheck.path);
    console.log(`   ✅ Implementada: ${fileCheck.path}`);
    console.log(`   📄 Título: ${title}`);
  } else {
    console.log(`   ❌ Não implementada ou não encontrada`);
  }
  
  console.log('');
});

console.log('='.repeat(80));
console.log('RESUMO');
console.log('='.repeat(80));
console.log(`Total de páginas: ${totalPages}`);
console.log(`Páginas implementadas: ${implementedPages}`);
console.log(`Páginas não implementadas: ${totalPages - implementedPages}`);
console.log(`Percentual de implementação: ${((implementedPages / totalPages) * 100).toFixed(1)}%`);
console.log('');

console.log('CREDENCIAIS DE TESTE:');
console.log('Admin: admin@fisioflow.com / admin123');
console.log('Fisioterapeuta: fisio@fisioflow.com / fisio123');
console.log('Paciente: paciente@fisioflow.com / paciente123');
console.log('');

console.log('SERVIDORES:');
console.log('Frontend: http://localhost:3003');
console.log('Backend: http://localhost:5000');
console.log('='.repeat(80));

// Salvar relatório em arquivo
const reportContent = `RELATÓRIO DE PÁGINAS E TÍTULOS - FISIOFLOW\n${'='.repeat(80)}\nData/Hora: ${new Date().toLocaleString('pt-BR')}\n\n${pages.map((page, index) => {
  const fileCheck = checkPageFile(page.name.replace(/\s+/g, ''));
  const status = fileCheck.exists ? '✅ Implementada' : '❌ Não implementada';
  const title = fileCheck.exists ? extractTitleFromFile(fileCheck.path) : 'N/A';
  
  return `${index + 1}. ${page.name}\n   Rota: ${page.path}\n   Acesso: ${page.access}\n   Status: ${status}\n   Título: ${title}\n`;
}).join('\n')}\n${'='.repeat(80)}\nRESUMO\n${'='.repeat(80)}\nTotal de páginas: ${totalPages}\nPáginas implementadas: ${implementedPages}\nPáginas não implementadas: ${totalPages - implementedPages}\nPercentual de implementação: ${((implementedPages / totalPages) * 100).toFixed(1)}%\n\nCREDENCIAIS DE TESTE:\nAdmin: admin@fisioflow.com / admin123\nFisioterapeuta: fisio@fisioflow.com / fisio123\nPaciente: paciente@fisioflow.com / paciente123\n\nSERVIDORES:\nFrontend: http://localhost:3003\nBackend: http://localhost:5000\n${'='.repeat(80)}`;

fs.writeFileSync('fisioflow_pages_report.txt', reportContent, 'utf8');
console.log('📄 Relatório salvo em: fisioflow_pages_report.txt');