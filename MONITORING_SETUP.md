# Guia de Monitoramento e Analytics - FisioFlow

Este guia explica como configurar e utilizar o sistema de monitoramento, analytics e logging de erros do FisioFlow.

## 📊 Vercel Analytics

### Configuração Automática

O Vercel Analytics já está configurado e ativo no projeto:

- **Analytics**: Rastreia pageviews, usuários únicos, e métricas de engajamento
- **Speed Insights**: Monitora Core Web Vitals e performance

### Acessando Métricas no Vercel

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Clique no seu projeto FisioFlow
3. Vá para a aba **Analytics**
4. Visualize:
   - **Visitors**: Usuários únicos e pageviews
   - **Top Pages**: Páginas mais visitadas
   - **Referrers**: Fontes de tráfego
   - **Countries**: Distribuição geográfica
   - **Devices**: Tipos de dispositivos

### Speed Insights

1. Na mesma página, clique em **Speed Insights**
2. Monitore:
   - **Core Web Vitals**: LCP, FID, CLS
   - **Performance Score**: Pontuação geral
   - **Real User Monitoring**: Dados de usuários reais

## 🚨 Sistema de Logging de Erros

### Funcionalidades Implementadas

- **Captura Automática**: Erros JavaScript, promises rejeitadas, erros de recursos
- **Error Boundary**: Captura erros em componentes React
- **Logging Personalizado**: APIs para diferentes tipos de log
- **Persistência Local**: Logs salvos no localStorage
- **Contexto Rico**: Informações detalhadas sobre cada erro

### Usando o Error Logger

```typescript
import { useErrorLogger } from '../utils/errorLogger';

function MyComponent() {
  const { logError, logWarning, logInfo, logApiError } = useErrorLogger();

  const handleApiCall = async () => {
    try {
      const response = await fetch('/api/data');
      if (!response.ok) throw new Error('API Error');
    } catch (error) {
      logApiError(error, '/api/data', 'GET');
    }
  };

  return (
    <button onClick={handleApiCall}>
      Fazer Chamada API
    </button>
  );
}
```

### Visualizando Logs

#### No Console do Navegador (Desenvolvimento)
```javascript
// Acessar logs no console
console.log(window.errorLogger?.getLogs());

// Limpar logs
window.errorLogger?.clearLogs();
```

#### No localStorage
```javascript
// Ver logs salvos
JSON.parse(localStorage.getItem('fisioflow_error_logs') || '[]');
```

## 📈 Monitor de Performance

### Métricas Coletadas

- **Page Load Time**: Tempo total de carregamento
- **DOM Content Loaded**: Tempo para DOM estar pronto
- **First Contentful Paint (FCP)**: Primeiro conteúdo visível
- **Largest Contentful Paint (LCP)**: Maior elemento visível
- **First Input Delay (FID)**: Tempo de resposta à primeira interação
- **Cumulative Layout Shift (CLS)**: Estabilidade visual
- **Route Change Time**: Tempo de navegação SPA

### Thresholds de Performance

| Métrica | Threshold | Descrição |
|---------|-----------|----------|
| Page Load Time | 3000ms | Tempo máximo aceitável de carregamento |
| FCP | 1800ms | Primeiro conteúdo deve aparecer rapidamente |
| LCP | 2500ms | Conteúdo principal deve carregar rápido |
| FID | 100ms | Resposta rápida à interação do usuário |
| CLS | 0.1 | Estabilidade visual mínima |
| Route Change | 1000ms | Navegação SPA deve ser rápida |

### Alertas Automáticos

O sistema automaticamente detecta e reporta:
- Carregamentos lentos
- Problemas de Web Vitals
- Navegação SPA lenta
- Instabilidade visual

## 🔧 Configuração Avançada

### Integrando com Serviços Externos

#### Sentry (Recomendado para Produção)

1. Instale o Sentry:
```bash
npm install @sentry/react @sentry/tracing
```

2. Configure no `src/utils/errorLogger.ts`:
```typescript
import * as Sentry from '@sentry/react';

// No método reportError
if (process.env.NODE_ENV === 'production') {
  Sentry.captureException(new Error(errorLog.message), {
    tags: {
      component: 'errorLogger',
      level: errorLog.level,
    },
    extra: errorLog.context,
  });
}
```

#### Google Analytics 4

1. Adicione o script do GA4 no `index.html`:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

2. Configure eventos personalizados no `PerformanceMonitor.tsx`:
```typescript
if (typeof gtag !== 'undefined') {
  gtag('event', 'performance_metric', {
    metric_type: type,
    metric_value: data.pageLoadTime,
    page_path: window.location.pathname,
  });
}
```

### Variáveis de Ambiente

Adicione ao `.env`:
```env
# Analytics
REACT_APP_GA_MEASUREMENT_ID=G-XXXXXXXXXX
REACT_APP_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# Monitoring
REACT_APP_ENABLE_PERFORMANCE_MONITORING=true
REACT_APP_ENABLE_ERROR_REPORTING=true
```

## 📱 Monitoramento em Produção

### Dashboard Vercel

1. **Functions**: Monitore execução de API routes
2. **Edge Network**: Performance da CDN
3. **Deployments**: Histórico e status de deploys
4. **Domains**: Status de domínios personalizados

### Alertas Recomendados

#### Via Vercel (Pro Plan)
- Erro 5xx > 1% das requests
- Tempo de resposta > 5 segundos
- Deploy falhou
- Uso de bandwidth > 80%

#### Via Uptime Monitoring
Configure serviços como:
- **UptimeRobot**: Monitoramento gratuito básico
- **Pingdom**: Monitoramento avançado
- **StatusCake**: Alternativa robusta

### Métricas Importantes para Acompanhar

#### Performance
- **TTFB** (Time to First Byte): < 200ms
- **Speed Index**: < 3000ms
- **Time to Interactive**: < 5000ms

#### Negócio
- **Taxa de Conversão**: Cadastros/Visitas
- **Bounce Rate**: < 40%
- **Session Duration**: > 2 minutos
- **Pages per Session**: > 3

#### Técnicas
- **Error Rate**: < 1%
- **API Response Time**: < 500ms
- **Database Query Time**: < 100ms
- **Memory Usage**: < 80%

## 🔍 Debugging e Troubleshooting

### Problemas Comuns

#### Analytics não aparecem
1. Verifique se está em produção (Vercel Analytics só funciona em produção)
2. Aguarde até 24h para dados aparecerem
3. Verifique se o domínio está correto no Vercel

#### Erros não são capturados
1. Verifique se o Error Boundary está ativo
2. Confirme se o errorLogger foi inicializado
3. Verifique o console para erros de inicialização

#### Performance metrics inconsistentes
1. Limpe o cache do navegador
2. Teste em modo incógnito
3. Verifique se há extensões interferindo

### Comandos Úteis

```bash
# Verificar build de produção
npm run build
npm run preview

# Analisar bundle size
npm install -g webpack-bundle-analyzer
npx webpack-bundle-analyzer build/static/js/*.js

# Lighthouse audit
npx lighthouse https://seu-dominio.vercel.app --output html
```

## 📋 Checklist de Monitoramento

### Configuração Inicial
- [ ] Vercel Analytics ativo
- [ ] Speed Insights configurado
- [ ] Error Logger implementado
- [ ] Performance Monitor ativo
- [ ] Error Boundary aplicado

### Monitoramento Contínuo
- [ ] Verificar métricas semanalmente
- [ ] Revisar logs de erro mensalmente
- [ ] Analisar performance trends
- [ ] Configurar alertas críticos
- [ ] Documentar incidentes

### Otimização
- [ ] Identificar páginas lentas
- [ ] Otimizar Core Web Vitals
- [ ] Reduzir bundle size
- [ ] Implementar lazy loading
- [ ] Configurar service worker

---

## 🚀 Próximos Passos

1. **Configurar Sentry** para error tracking avançado
2. **Implementar A/B testing** com Vercel Edge Functions
3. **Configurar Real User Monitoring** (RUM)
4. **Implementar alertas automáticos** via webhook
5. **Criar dashboard personalizado** para métricas de negócio

---

**Nota**: Este sistema de monitoramento está configurado para crescer com sua aplicação. Comece com as configurações básicas e adicione complexidade conforme necessário.