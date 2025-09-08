import { rest } from 'msw';

// Mock handlers para interceptar chamadas de API durante os testes
export const handlers = [
  // Autenticação
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        user: {
          id: '1',
          email: 'test@fisioflow.com',
          full_name: 'Usuário Teste',
          role: 'admin',
        },
        token: 'mock-jwt-token',
      })
    );
  }),

  rest.post('/api/auth/logout', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ success: true }));
  }),

  rest.get('/api/auth/me', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: '1',
        email: 'test@fisioflow.com',
        full_name: 'Usuário Teste',
        role: 'admin',
      })
    );
  }),

  // Pacientes
  rest.get('/api/patients', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: '1',
          name: 'João Silva',
          email: 'joao@email.com',
          phone: '(11) 99999-9999',
          birth_date: '1985-05-15',
          status: 'active',
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          name: 'Maria Santos',
          email: 'maria@email.com',
          phone: '(11) 88888-8888',
          birth_date: '1990-10-20',
          status: 'active',
          created_at: '2024-01-02T00:00:00Z',
        },
      ])
    );
  }),

  rest.post('/api/patients', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        id: '3',
        name: 'Novo Paciente',
        email: 'novo@email.com',
        phone: '(11) 77777-7777',
        birth_date: '1988-03-10',
        status: 'active',
        created_at: new Date().toISOString(),
      })
    );
  }),

  rest.get('/api/patients/:id', (req, res, ctx) => {
    const { id } = req.params;
    return res(
      ctx.status(200),
      ctx.json({
        id,
        name: 'João Silva',
        email: 'joao@email.com',
        phone: '(11) 99999-9999',
        birth_date: '1985-05-15',
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
      })
    );
  }),

  // Consultas/Agendamentos
  rest.get('/api/appointments', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: '1',
          patient_id: '1',
          patient_name: 'João Silva',
          physiotherapist_id: '1',
          physiotherapist_name: 'Dr. Pedro Costa',
          date: '2024-02-15',
          time: '14:00',
          status: 'scheduled',
          notes: 'Primeira consulta',
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          patient_id: '2',
          patient_name: 'Maria Santos',
          physiotherapist_id: '1', 
          physiotherapist_name: 'Dr. Pedro Costa',
          date: '2024-02-16',
          time: '10:00',
          status: 'confirmed',
          notes: 'Sessão de acompanhamento',
          created_at: '2024-01-02T00:00:00Z',
        },
      ])
    );
  }),

  rest.post('/api/appointments', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        id: '3',
        patient_id: '1',
        patient_name: 'João Silva',
        physiotherapist_id: '1',
        physiotherapist_name: 'Dr. Pedro Costa',
        date: '2024-02-17',
        time: '16:00',
        status: 'scheduled',
        notes: 'Nova consulta',
        created_at: new Date().toISOString(),
      })
    );
  }),

  // Fisioterapeutas
  rest.get('/api/physiotherapists', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: '1',
          name: 'Dr. Pedro Costa',
          email: 'pedro@fisioflow.com',
          phone: '(11) 99999-0001',
          specialties: ['Ortopedia', 'Neurologia'],
          crefito: 'CREFITO-3/123456',
          status: 'active',
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          name: 'Dra. Ana Lima',
          email: 'ana@fisioflow.com',
          phone: '(11) 99999-0002',
          specialties: ['Pediatria', 'Geriatra'],
          crefito: 'CREFITO-3/654321',
          status: 'active',
          created_at: '2024-01-01T00:00:00Z',
        },
      ])
    );
  }),

  // Planos de Tratamento
  rest.get('/api/treatment-plans', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: '1',
          patient_id: '1',
          patient_name: 'João Silva',
          physiotherapist_id: '1',
          physiotherapist_name: 'Dr. Pedro Costa',
          title: 'Reabilitação Pós-Cirúrgica',
          description: 'Plano de reabilitação após cirurgia no joelho',
          status: 'active',
          start_date: '2024-01-15',
          end_date: '2024-04-15',
          sessions_total: 20,
          sessions_completed: 5,
          created_at: '2024-01-01T00:00:00Z',
        },
      ])
    );
  }),

  // Dashboard/Métricas
  rest.get('/api/dashboard/stats', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        total_patients: 150,
        total_appointments: 45,
        appointments_today: 12,
        appointments_week: 67,
        revenue_month: 15750.50,
        completion_rate: 92.5,
      })
    );
  }),

  // Exercícios
  rest.get('/api/exercises', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: '1',
          name: 'Flexão de Joelho',
          category: 'Fortalecimento',
          description: 'Exercício para fortalecimento do quadríceps',
          instructions: 'Sente-se na cadeira e estenda a perna...',
          duration: 30,
          repetitions: 15,
          sets: 3,
          difficulty: 'beginner',
          muscle_groups: ['quadriceps', 'hamstrings'],
          equipment: ['cadeira'],
          created_at: '2024-01-01T00:00:00Z',
        },
      ])
    );
  }),

  // Erro genérico para endpoints não mockados
  rest.get('*', (req, res, ctx) => {
    console.warn(`Unhandled ${req.method} request to ${req.url}`);
    return res(
      ctx.status(404),
      ctx.json({ error: 'Endpoint não encontrado nos mocks' })
    );
  }),
];