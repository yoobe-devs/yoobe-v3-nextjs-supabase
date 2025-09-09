/**
 * Configuração do Sistema de Monitoramento
 * Define parâmetros para manter o sistema sempre disponível
 */

module.exports = {
  // Configurações gerais
  general: {
    baseUrl: 'http://localhost:3000',
    environment: process.env.NODE_ENV || 'development',
    version: '3.1.0',
  },

  // Configurações de health check
  healthCheck: {
    interval: 30000, // 30 segundos
    timeout: 10000, // 10 segundos
    maxRetries: 3,
    retryDelay: 5000, // 5 segundos
  },

  // Endpoints para monitorar
  endpoints: [
    {
      name: 'Health Check API',
      url: '/api/system/health-public',
      expectedStatus: 200,
      critical: true,
    },
    {
      name: 'Metrics API',
      url: '/api/system/metrics-public',
      expectedStatus: 200,
      critical: true,
    },
    {
      name: 'System Status API',
      url: '/api/system/status',
      expectedStatus: 200,
      critical: true,
    },
    {
      name: 'Main Application',
      url: '/',
      expectedStatus: 200,
      critical: true,
    },
    {
      name: 'Documentation',
      url: '/docs',
      expectedStatus: 200,
      critical: false,
    },
    {
      name: 'Admin Panel',
      url: '/admin',
      expectedStatus: 200,
      critical: false,
    },
  ],

  // Configurações de recuperação
  recovery: {
    enabled: true,
    strategies: [
      'clear_cache',
      'restart_services',
      'check_network',
      'check_resources',
    ],
    maxRecoveryAttempts: 3,
    recoveryDelay: 10000, // 10 segundos
  },

  // Configurações de alertas
  alerts: {
    enabled: true,
    channels: ['console', 'log'],
    thresholds: {
      errorRate: 0.1, // 10%
      responseTime: 5000, // 5 segundos
      uptime: 0.95, // 95%
    },
  },

  // Configurações de logging
  logging: {
    level: 'info',
    format: 'json',
    file: 'logs/system-monitor.log',
    maxSize: '10MB',
    maxFiles: 5,
  },

  // Configurações específicas por ambiente
  environments: {
    development: {
      healthCheck: {
        interval: 30000,
        timeout: 10000,
      },
      logging: {
        level: 'debug',
      },
    },
    production: {
      healthCheck: {
        interval: 60000, // 1 minuto
        timeout: 15000, // 15 segundos
      },
      logging: {
        level: 'info',
      },
      recovery: {
        maxRecoveryAttempts: 5,
      },
    },
  },
}

