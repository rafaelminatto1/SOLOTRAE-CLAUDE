import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config({ path: path.join(__dirname, '..', '.env') });

console.log('🚀 Guia para Criar Novo Projeto Supabase');
console.log('==========================================\n');

console.log('📋 Passos para configurar um novo projeto Supabase:');
console.log('\n1. 🌐 Acesse https://supabase.com/dashboard');
console.log('2. 🔑 Faça login ou crie uma conta');
console.log('3. ➕ Clique em "New Project"');
console.log('4. 📝 Preencha os dados do projeto:');
console.log('   - Nome: FisioFlow');
console.log('   - Organização: Sua organização');
console.log('   - Senha do banco: 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');
console.log('   - Região: Escolha a mais próxima (ex: South America)');
console.log('5. ⏳ Aguarde a criação do projeto (pode levar alguns minutos)');
console.log('\n6. 🔧 Após criado, vá em Settings > API:');
console.log('   - Copie a "Project URL"');
console.log('   - Copie a "anon public" key');
console.log('   - Copie a "service_role" key (clique em "Reveal" primeiro)');

console.log('\n7. 📄 Atualize o arquivo .env com as novas credenciais:');
console.log('\n```');
console.log('SUPABASE_URL=https://seu-novo-projeto.supabase.co');
console.log('SUPABASE_ANON_KEY=sua-nova-anon-key');
console.log('SUPABASE_SERVICE_ROLE_KEY=sua-nova-service-role-key');
console.log('```');

console.log('\n8. 🧪 Teste a conexão executando:');
console.log('   node scripts/setup-supabase-simple.js');

console.log('\n📊 Status atual das credenciais:');
const currentUrl = process.env.SUPABASE_URL;
const currentAnon = process.env.SUPABASE_ANON_KEY;
const currentService = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log(`URL atual: ${currentUrl || 'Não configurada'}`);
console.log(`Anon Key: ${currentAnon ? 'Configurada' : 'Não configurada'}`);
console.log(`Service Key: ${currentService ? 'Configurada' : 'Não configurada'}`);

if (currentUrl && currentUrl.includes('cvolnqbjiisvaqyzwjgi')) {
  console.log('\n⚠️  ATENÇÃO: Você está usando um projeto antigo que pode estar inativo.');
  console.log('   É recomendado criar um novo projeto seguindo os passos acima.');
}

console.log('\n💡 Dicas importantes:');
console.log('- Guarde as credenciais em local seguro');
console.log('- A service_role key tem privilégios administrativos');
console.log('- Nunca exponha as chaves em código público');
console.log('- O projeto gratuito tem limitações de uso');

console.log('\n✅ Após configurar as credenciais, execute novamente o script de setup!');