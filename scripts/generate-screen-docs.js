#!/usr/bin/env node

/**
 * Script para gerar documentação técnica automática de todas as telas da plataforma
 * 
 * Uso: node scripts/generate-screen-docs.js
 * 
 * Este script:
 * 1. Percorre todas as rotas da aplicação
 * 2. Analisa os componentes renderizados
 * 3. Identifica APIs e hooks utilizados
 * 4. Gera documentação estruturada para cada tela
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configurações
const APP_DIR = path.join(__dirname, '../app');
const DOCS_DIR = path.join(__dirname, '../docs/screens');
const TEMPLATE_DIR = path.join(__dirname, '../docs/templates');

// Estrutura de rotas conhecidas
const KNOWN_ROUTES = {
  admin: {
    dashboard: 'Dashboard Administrativo',
    changelog: 'Changelog do Sistema',
    usuarios: 'Gestão de Usuários',
    empresas: 'Gestão de Empresas',
    lojas: 'Gestão de Lojas',
    produtos: 'Catálogo de Produtos',
    orcamentos: 'Sistema de Orçamentos',
    pedidos: 'Gestão de Pedidos',
    relatorios: 'Relatórios e Analytics',
    configuracoes: 'Configurações do Sistema',
    integracoes: 'Integrações Externas',
    categorias: 'Gestão de Categorias',
    gestores: 'Gestão de Gestores',
    documentacao: 'Documentação Técnica'
  },
  store: {
    dashboard: 'Dashboard da Loja',
    catalog: 'Catálogo de Produtos',
    cart: 'Carrinho de Compras',
    checkout: 'Processo de Checkout',
    orders: 'Histórico de Pedidos',
    profile: 'Perfil do Usuário',
    points: 'Sistema de Pontos',
    product: 'Detalhes do Produto'
  },
  'gestor-app': {
    '': 'Dashboard do Gestor',
    users: 'Gestão de Funcionários',
    products: 'Gestão de Produtos',
    quotes: 'Sistema de Orçamentos',
    orders: 'Acompanhamento de Pedidos'
  },
  auth: {
    login: 'Sistema de Login',
    register: 'Cadastro de Usuário',
    forgot: 'Recuperação de Senha'
  },
  onboarding: {
    '': 'Processo de Onboarding'
  }
};

// Template base para documentação
const SCREEN_TEMPLATE = `# 📱 Tela: {TITLE}

## 🎯 Identificação e Finalidade

**Nome da Tela**: {TITLE}  
**Rota**: \`{ROUTE}\`  
**Objetivo Funcional**: {DESCRIPTION}  
**Público-Alvo**: {AUDIENCE}  
**Regra de Negócio**: {BUSINESS_RULE}

## 📋 Campos e Comportamentos

### Campos Exibidos

{/* Campos serão preenchidos automaticamente */}

### Comportamentos Dinâmicos

{/* Comportamentos serão preenchidos automaticamente */}

## 🔌 Integrações Técnicas

### APIs Chamadas

{/* APIs serão identificadas automaticamente */}

### Componentes Utilizados

{/* Componentes serão listados automaticamente */}

### Hooks e Lógica

{/* Hooks serão identificados automaticamente */}

## 🚀 Fluxo e Navegação

### Origem

{/* Origem será determinada automaticamente */}

### Destino

{/* Destino será determinado automaticamente */}

### Comportamentos Esperados

{/* Comportamentos serão documentados automaticamente */}

## 📸 Screenshot e Interface

### Layout da Tela

{/* Layout será descrito automaticamente */}

### Elementos Visuais

{/* Elementos visuais serão listados automaticamente */}

## 🧪 Dados de Teste

### Estrutura dos Dados

{/* Estruturas serão identificadas automaticamente */}

### Dados Mockados

{/* Dados mockados serão listados automaticamente */}

## 🔄 Histórico da Funcionalidade

### Timeline de Evolução

| Data | Versão | Tipo | Descrição |
|------|--------|------|-----------|
| {CURRENT_DATE} | v3.0.0 | 🚀 Feature | Documentação gerada automaticamente |

## 🚀 Melhorias Futuras Sugeridas

### Funcionalidades

{/* Sugestões serão baseadas na análise do código */}

### Técnicas

{/* Melhorias técnicas serão sugeridas automaticamente */}

## 🔗 Relacionamentos

### Telas Relacionadas

{/* Relacionamentos serão identificados automaticamente */}

### Integrações

{/* Integrações serão listadas automaticamente */}

## 📊 Métricas de Performance

### Indicadores Chave

{/* Métricas serão sugeridas automaticamente */}

### Monitoramento

{/* Estratégias de monitoramento serão sugeridas */}
`;

// Função para analisar um arquivo de componente
function analyzeComponent(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Análise básica do componente
    const analysis = {
      imports: [],
      hooks: [],
      apis: [],
      components: [],
      functions: []
    };

    // Extrair imports
    const importRegex = /import\s+.*?from\s+['"]([^'"]+)['"]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      analysis.imports.push(match[1]);
    }

    // Identificar hooks
    const hookRegex = /use[A-Z][a-zA-Z]*/g;
    analysis.hooks = [...new Set(content.match(hookRegex) || [])];

    // Identificar APIs
    const apiRegex = /\/api\/[a-zA-Z0-9\/-]+/g;
    analysis.apis = [...new Set(content.match(apiRegex) || [])];

    // Identificar componentes UI
    const uiComponentRegex = /import\s+\{[^}]*\}\s+from\s+['"]@\/components\/ui\/([^'"]+)['"]/g;
    while ((match = uiComponentRegex.exec(content)) !== null) {
      analysis.components.push(match[1]);
    }

    return analysis;
  } catch (error) {
    console.warn(`⚠️  Erro ao analisar ${filePath}:`, error.message);
    return null;
  }
}

// Função para gerar documentação para uma tela
function generateScreenDoc(route, title, filePath) {
  console.log(`📝 Gerando documentação para: ${title} (${route})`);
  
  let analysis = null;
  if (filePath && fs.existsSync(filePath)) {
    analysis = analyzeComponent(filePath);
  }

  // Substituir placeholders no template
  let doc = SCREEN_TEMPLATE
    .replace(/{TITLE}/g, title)
    .replace(/{ROUTE}/g, `/${route}`)
    .replace(/{DESCRIPTION}/g, `Funcionalidade para ${title.toLowerCase()}`)
    .replace(/{AUDIENCE}/g, determineAudience(route))
    .replace(/{BUSINESS_RULE}/g, determineBusinessRule(route))
    .replace(/{CURRENT_DATE}/g, new Date().toISOString().split('T')[0]);

  // Adicionar informações baseadas na análise
  if (analysis) {
    doc = doc.replace('{/* APIs serão identificadas automaticamente */}', 
      analysis.apis.length > 0 
        ? analysis.apis.map(api => `- **${api}** - Endpoint da API`).join('\n')
        : '- **Nenhuma API identificada** - Dados mockados localmente'
    );

    doc = doc.replace('{/* Hooks serão identificados automaticamente */}',
      analysis.hooks.length > 0
        ? analysis.hooks.map(hook => `- **${hook}** - Hook React`).join('\n')
        : '- **useState** - Controle de estado local'
    );

    doc = doc.replace('{/* Componentes serão listados automaticamente */}',
      analysis.components.length > 0
        ? analysis.components.map(comp => `- **${comp}** - Componente UI`).join('\n')
        : '- **Card** - Componente de layout'
    );
  }

  // Salvar documentação
  const fileName = route.replace(/\//g, '-').replace(/^-/, '') || 'index';
  const docPath = path.join(DOCS_DIR, `${fileName}.md`);
  
  fs.writeFileSync(docPath, doc);
  console.log(`✅ Documentação salva em: ${docPath}`);
  
  return docPath;
}

// Função para determinar o público-alvo baseado na rota
function determineAudience(route) {
  if (route.startsWith('admin')) return 'Administradores do sistema, superusuários';
  if (route.startsWith('store')) return 'Clientes da loja, usuários autenticados';
  if (route.startsWith('gestor-app')) return 'Gestores de empresa, administradores de loja';
  if (route.startsWith('auth')) return 'Todos os usuários do sistema';
  return 'Usuários do sistema';
}

// Função para determinar regras de negócio baseadas na rota
function determineBusinessRule(route) {
  if (route.includes('dashboard')) return 'Centralizar informações críticas para tomada de decisões';
  if (route.includes('cart')) return 'Sistema de carrinho persistente com múltiplos métodos de pagamento';
  if (route.includes('checkout')) return 'Processo de finalização de compra com validações';
  if (route.includes('users')) return 'Gestão de usuários com controle de permissões';
  if (route.includes('products')) return 'Catálogo de produtos com gestão de estoque';
  return 'Funcionalidade específica da plataforma';
}

// Função principal para gerar toda a documentação
function generateAllDocs() {
  console.log('🚀 Iniciando geração de documentação técnica...\n');

  // Criar diretório de documentação se não existir
  if (!fs.existsSync(DOCS_DIR)) {
    fs.mkdirSync(DOCS_DIR, { recursive: true });
    console.log('📁 Diretório de documentação criado');
  }

  let totalGenerated = 0;

  // Gerar documentação para cada rota conhecida
  for (const [mainRoute, subRoutes] of Object.entries(KNOWN_ROUTES)) {
    for (const [subRoute, title] of Object.entries(subRoutes)) {
      const fullRoute = subRoute ? `${mainRoute}/${subRoute}` : mainRoute;
      const filePath = path.join(APP_DIR, fullRoute, 'page.tsx');
      
      try {
        const docPath = generateScreenDoc(fullRoute, title, filePath);
        totalGenerated++;
      } catch (error) {
        console.error(`❌ Erro ao gerar documentação para ${fullRoute}:`, error.message);
      }
    }
  }

  // Gerar índice principal
  generateMainIndex();
  
  console.log(`\n🎉 Documentação gerada com sucesso!`);
  console.log(`📊 Total de telas documentadas: ${totalGenerated}`);
  console.log(`📁 Arquivos salvos em: ${DOCS_DIR}`);
}

// Função para gerar índice principal
function generateMainIndex() {
  const indexPath = path.join(DOCS_DIR, 'README.md');
  
  let indexContent = `# 📱 Documentação Técnica das Telas da Plataforma Yoobe

Este diretório contém a documentação técnica completa de cada tela da aplicação, incluindo detalhes funcionais, técnicos e de negócio para facilitar a continuidade do desenvolvimento.

## 🏗️ Estrutura da Documentação

Cada tela possui um arquivo de documentação com a seguinte estrutura:

1. **Identificação e Finalidade** - Objetivo funcional e público-alvo
2. **Campos e Comportamentos** - Lista de campos e validações
3. **Integrações Técnicas** - APIs, componentes e hooks utilizados
4. **Fluxo e Navegação** - Origem, destino e comportamentos esperados
5. **Screenshot** - Imagem da tela com marcações (quando disponível)

## 📋 Telas Documentadas

### 🏢 Admin
`;

  // Adicionar links para cada tela admin
  for (const [subRoute, title] of Object.entries(KNOWN_ROUTES.admin)) {
    const fileName = subRoute ? `${subRoute}.md` : 'index.md';
    indexContent += `- [${title}](./${fileName}) - ${getDescription(title)}\n`;
  }

  indexContent += `
### 🛒 Store (Loja)
`;

  // Adicionar links para cada tela store
  for (const [subRoute, title] of Object.entries(KNOWN_ROUTES.store)) {
    const fileName = subRoute ? `${subRoute}.md` : 'index.md';
    indexContent += `- [${title}](./${fileName}) - ${getDescription(title)}\n`;
  }

  indexContent += `
### 👥 Gestor App
`;

  // Adicionar links para cada tela gestor
  for (const [subRoute, title] of Object.entries(KNOWN_ROUTES['gestor-app'])) {
    const fileName = subRoute ? `${subRoute}.md` : 'index.md';
    indexContent += `- [${title}](./${fileName}) - ${getDescription(title)}\n`;
  }

  indexContent += `
### 🔐 Autenticação
`;

  // Adicionar links para cada tela de auth
  for (const [subRoute, title] of Object.entries(KNOWN_ROUTES.auth)) {
    const fileName = subRoute ? `${subRoute}.md` : 'index.md';
    indexContent += `- [${title}](./${fileName}) - ${getDescription(title)}\n`;
  }

  indexContent += `
## 🚀 Como Usar

1. **Para Desenvolvedores**: Consulte a documentação da tela que está trabalhando
2. **Para Onboarding**: Leia as telas principais para entender o fluxo da aplicação
3. **Para Manutenção**: Use como referência para implementar mudanças

## 📝 Atualizações

- Cada mudança significativa deve ser documentada
- Screenshots devem ser atualizados quando houver mudanças visuais
- APIs e integrações devem ser mantidas atualizadas

## 🔗 Links Úteis

- [Changelog da Plataforma](../CHANGELOG.md)
- [Estrutura da Base de Dados](../database/README.md)
- [APIs da Plataforma](../api/README.md)

---

*Documentação gerada automaticamente em ${new Date().toLocaleDateString('pt-BR')}*
`;

  fs.writeFileSync(indexPath, indexContent);
  console.log('📚 Índice principal gerado');
}

// Função para gerar descrições baseadas no título
function getDescription(title) {
  const descriptions = {
    'Dashboard Administrativo': 'Visão geral do sistema administrativo',
    'Changelog do Sistema': 'Histórico de mudanças da plataforma',
    'Gestão de Usuários': 'Controle completo de usuários do sistema',
    'Gestão de Empresas': 'Controle de empresas e multi-tenancy',
    'Gestão de Lojas': 'Gestão de lojas por empresa',
    'Catálogo de Produtos': 'Catálogo de produtos base',
    'Sistema de Orçamentos': 'Sistema de orçamentos',
    'Gestão de Pedidos': 'Gestão de pedidos',
    'Relatórios e Analytics': 'Analytics e métricas',
    'Dashboard da Loja': 'Visão geral da loja',
    'Catálogo de Produtos': 'Listagem de produtos',
    'Carrinho de Compras': 'Gestão do carrinho de compras',
    'Processo de Checkout': 'Processo de finalização',
    'Histórico de Pedidos': 'Histórico de pedidos',
    'Perfil do Usuário': 'Dados do usuário',
    'Sistema de Pontos': 'Sistema de pontos e recompensas',
    'Dashboard do Gestor': 'Visão geral para gestores',
    'Gestão de Funcionários': 'Gestão de funcionários',
    'Gestão de Produtos': 'Gestão de produtos da empresa',
    'Sistema de Orçamentos': 'Sistema de orçamentos',
    'Acompanhamento de Pedidos': 'Acompanhamento de pedidos',
    'Sistema de Login': 'Sistema de autenticação',
    'Cadastro de Usuário': 'Processo de registro',
    'Recuperação de Senha': 'Recuperação de credenciais',
    'Processo de Onboarding': 'Processo de primeiro acesso'
  };

  return descriptions[title] || 'Funcionalidade da plataforma';
}

// Executar se chamado diretamente
if (require.main === module) {
  try {
    generateAllDocs();
  } catch (error) {
    console.error('❌ Erro durante geração da documentação:', error);
    process.exit(1);
  }
}

module.exports = {
  generateScreenDoc,
  generateAllDocs,
  analyzeComponent
};
