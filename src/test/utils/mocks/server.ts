import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Configurar servidor MSW para interceptar requests durante os testes
export const server = setupServer(...handlers);