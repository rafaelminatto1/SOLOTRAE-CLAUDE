/**
 * Teste para verificar a criação automática de perfil de fisioterapeuta
 * Task 16: Corrigir criação automática de perfil de fisioterapeuta após registro
 */

const API_BASE_URL = 'http://localhost:5000/api';

// Helper function para fazer requests HTTP
async function makeRequest(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  const data = await response.json();
  return { status: response.status, data };
}

async function testPhysiotherapistRegistration() {
  console.log('🧪 Testando criação automática de perfil de fisioterapeuta...');
  
  try {
    // Dados de teste para registro de fisioterapeuta
    const testPhysio = {
      email: `test.physio.${Date.now()}@fisioflow.com`,
      password: 'senha123',
      name: 'Dr. Teste Fisioterapeuta',
      role: 'physiotherapist',
      phone: '11999888777',
      specialization: 'Ortopedia'
    };
    
    console.log('📝 Registrando novo fisioterapeuta...');
    console.log('Email:', testPhysio.email);
    
    // 1. Registrar fisioterapeuta
    const registerResponse = await makeRequest(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      body: JSON.stringify(testPhysio)
    });
    
    if (registerResponse.status !== 201) {
      throw new Error(`Falha no registro: ${registerResponse.status}`);
    }
    
    console.log('✅ Usuário registrado com sucesso!');
    console.log('User ID:', registerResponse.data.data.user.id);
    console.log('Role:', registerResponse.data.data.user.role);
    
    const token = registerResponse.data.data.access_token;
    const userId = registerResponse.data.data.user.id;
    
    // 2. Verificar se o perfil de fisioterapeuta foi criado
    console.log('🔍 Verificando criação do perfil de fisioterapeuta...');
    
    const profileResponse = await makeRequest(`${API_BASE_URL}/physiotherapists/by-user/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (profileResponse.status !== 200) {
      throw new Error(`Perfil de fisioterapeuta não encontrado: ${profileResponse.status}`);
    }
    
    const physiotherapistProfile = profileResponse.data;
    console.log('✅ Perfil de fisioterapeuta criado automaticamente!');
    console.log('Physio ID:', physiotherapistProfile.id);
    console.log('User ID associado:', physiotherapistProfile.user_id);
    console.log('Especialização:', physiotherapistProfile.specialization || physiotherapistProfile.specialties);
    console.log('Licença:', physiotherapistProfile.license_number || physiotherapistProfile.crefito);
    
    // 3. Verificar se os dados estão corretos
    if (physiotherapistProfile.user_id !== userId) {
      throw new Error('User ID não corresponde no perfil de fisioterapeuta');
    }
    
    console.log('✅ Dados do perfil estão corretos!');
    
    // 4. Testar login com o fisioterapeuta criado
    console.log('🔐 Testando login do fisioterapeuta...');
    
    const loginResponse = await makeRequest(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: testPhysio.email,
        password: testPhysio.password
      })
    });
    
    if (loginResponse.status !== 200) {
      throw new Error(`Falha no login: ${loginResponse.status}`);
    }
    
    console.log('✅ Login realizado com sucesso!');
    console.log('Role no login:', loginResponse.data.data.user.role);
    
    console.log('\n🎉 TESTE CONCLUÍDO COM SUCESSO!');
    console.log('✅ A criação automática de perfil de fisioterapeuta está funcionando corretamente.');
    console.log('✅ Task 16 - RESOLVIDA: O sistema cria automaticamente o perfil quando role=\'physiotherapist\'');
    
    return true;
    
  } catch (error) {
    console.error('❌ ERRO no teste:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    return false;
  }
}

// Executar o teste
testPhysiotherapistRegistration()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Erro fatal:', error);
    process.exit(1);
  });

export { testPhysiotherapistRegistration };