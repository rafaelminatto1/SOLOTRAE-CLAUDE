// Teste básico para verificar se o ambiente está funcionando
console.log('Teste básico executado com sucesso!');
console.log('Data:', new Date().toISOString());

// Verificar se as dependências básicas estão disponíveis
try {
  const fs = require('fs');
  console.log('Node.js e módulos básicos funcionando');
} catch (error) {
  console.error('Erro ao carregar módulos:', error.message);
}