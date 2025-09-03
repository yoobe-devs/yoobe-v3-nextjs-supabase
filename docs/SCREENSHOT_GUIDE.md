# 📸 Guia de Screenshots: Captura e Atualização de Imagens

## 🎯 Objetivo

Este guia explica como capturar, organizar e manter screenshots atualizados de todas as telas da plataforma Yoobe para a documentação técnica.

## 📱 Ferramentas Recomendadas

### Captura de Tela
- **Desktop**: 
  - **macOS**: `Cmd + Shift + 4` (seleção), `Cmd + Shift + 3` (tela inteira)
  - **Windows**: `Win + Shift + S` (seleção), `PrtScn` (tela inteira)
  - **Linux**: `Shift + PrtScn` (seleção), `PrtScn` (tela inteira)

- **Ferramentas Especializadas**:
  - **Snipping Tool** (Windows)
  - **Grab** (macOS)
  - **Flameshot** (Linux)
  - **Greenshot** (Cross-platform)

### Edição e Anotação
- **Ferramentas Online**:
  - **Canva**: Templates e edição profissional
  - **Figma**: Design colaborativo
  - **Photopea**: Alternativa gratuita ao Photoshop

- **Aplicativos Desktop**:
  - **GIMP**: Editor gratuito e poderoso
  - **Paint.NET**: Windows, interface simples
  - **Pinta**: Cross-platform, similar ao Paint

### Captura Automática
- **Playwright**: Para screenshots em CI/CD
- **Puppeteer**: Para capturas programáticas
- **Selenium**: Para testes automatizados

## 🎨 Padrões de Captura

### Resolução e Formato
- **Resolução**: Mínimo 1920x1080 (Full HD)
- **Formato**: PNG para melhor qualidade
- **Compressão**: Otimizar para web (máximo 500KB)

### Orientação e Layout
- **Desktop**: Captura horizontal (landscape)
- **Mobile**: Captura vertical (portrait)
- **Tablet**: Captura horizontal (landscape)

### Estado da Tela
- **Estado Padrão**: Tela carregada com dados normais
- **Estados Especiais**: Loading, erro, vazio, etc.
- **Interações**: Hover, focus, seleção

## 📋 Checklist de Captura

### Antes da Captura
- [ ] **Limpar Dados**: Usar dados de teste consistentes
- [ ] **Verificar Estado**: Tela carregada completamente
- [ ] **Configurar Tamanho**: Janela do navegador em tamanho padrão
- [ ] **Remover Sensíveis**: Ocultar dados pessoais ou confidenciais
- [ ] **Verificar Responsividade**: Testar em diferentes breakpoints

### Durante a Captura
- [ ] **Capturar Estado Principal**: Tela funcionando normalmente
- [ ] **Capturar Estados de Erro**: Mensagens de erro e validação
- [ ] **Capturar Loading**: Spinners e estados de carregamento
- [ ] **Capturar Interações**: Hover, focus, seleção
- [ ] **Capturar Responsividade**: Mobile, tablet, desktop

### Após a Captura
- [ ] **Renomear Arquivo**: Nomenclatura consistente
- [ ] **Anotar Imagem**: Marcar elementos importantes
- [ ] **Otimizar Tamanho**: Comprimir para web
- [ ] **Organizar Pasta**: Estrutura de diretórios clara
- [ ] **Atualizar Documentação**: Referenciar nova imagem

## 📁 Estrutura de Organização

### Diretório de Screenshots
```
docs/screenshots/
├── admin/                    # Telas administrativas
│   ├── dashboard/           # Dashboard admin
│   ├── usuarios/            # Gestão de usuários
│   ├── empresas/            # Gestão de empresas
│   └── ...
├── store/                   # Telas da loja
│   ├── catalog/             # Catálogo de produtos
│   ├── cart/                # Carrinho de compras
│   ├── checkout/            # Processo de checkout
│   └── ...
├── gestor/                  # Telas do gestor
│   ├── dashboard/           # Dashboard gestor
│   ├── users/               # Gestão de funcionários
│   └── ...
└── shared/                  # Componentes compartilhados
    ├── auth/                # Telas de autenticação
    ├── loading/             # Estados de carregamento
    └── errors/              # Estados de erro
```

### Nomenclatura de Arquivos
```
{modulo}-{tela}-{estado}-{resolucao}.png

Exemplos:
admin-dashboard-default-1920x1080.png
store-cart-with-items-1920x1080.png
gestor-dashboard-mobile-375x667.png
auth-login-error-1920x1080.png
```

## 🎯 Tipos de Screenshots

### Screenshots Principais
- **Estado Padrão**: Tela funcionando normalmente
- **Com Dados**: Tela com dados de exemplo
- **Vazia**: Tela sem dados (estado inicial)
- **Responsiva**: Diferentes tamanhos de tela

### Screenshots de Estados
- **Loading**: Spinners e indicadores de carregamento
- **Erro**: Mensagens de erro e validação
- **Sucesso**: Confirmações e mensagens positivas
- **Vazio**: Estados sem dados ou resultados

### Screenshots de Interação
- **Hover**: Elementos com hover ativo
- **Focus**: Campos com foco
- **Seleção**: Itens selecionados
- **Modal**: Popups e overlays

## 🔧 Captura com Playwright (Automatizada)

### Configuração Básica
```typescript
// playwright.config.ts
import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  use: {
    viewport: { width: 1920, height: 1080 },
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'Desktop',
      use: { viewport: { width: 1920, height: 1080 } },
    },
    {
      name: 'Tablet',
      use: { viewport: { width: 768, height: 1024 } },
    },
    {
      name: 'Mobile',
      use: { viewport: { width: 375, height: 667 } },
    },
  ],
};

export default config;
```

### Script de Captura
```typescript
// scripts/capture-screenshots.ts
import { chromium, Browser, Page } from 'playwright';

async function captureScreenshots() {
  const browser: Browser = await chromium.launch();
  const page: Page = await browser.newPage();
  
  // Configurar viewport
  await page.setViewportSize({ width: 1920, height: 1080 });
  
  // Capturar telas principais
  const screens = [
    { url: '/admin/dashboard', name: 'admin-dashboard-default' },
    { url: '/store/cart', name: 'store-cart-with-items' },
    { url: '/gestor/dashboard', name: 'gestor-dashboard-default' },
  ];
  
  for (const screen of screens) {
    await page.goto(`http://localhost:3000${screen.url}`);
    await page.waitForLoadState('networkidle');
    
    // Capturar screenshot
    await page.screenshot({
      path: `docs/screenshots/${screen.name}-1920x1080.png`,
      fullPage: true,
    });
    
    console.log(`✅ Capturado: ${screen.name}`);
  }
  
  await browser.close();
}

captureScreenshots().catch(console.error);
```

### Execução Automática
```bash
# Instalar Playwright
npm install -D @playwright/test

# Executar captura
npx playwright test --grep "screenshot"

# Ou executar script diretamente
npx ts-node scripts/capture-screenshots.ts
```

## 🎨 Anotação e Marcação

### Elementos a Marcar
- **Campos Importantes**: Inputs, botões, links
- **Validações**: Mensagens de erro, sucesso
- **Navegação**: Menus, breadcrumbs, paginação
- **Dados**: Tabelas, gráficos, métricas
- **Estados**: Loading, erro, vazio

### Ferramentas de Anotação
- **Figma**: Para anotações colaborativas
- **Canva**: Para templates profissionais
- **GIMP**: Para edição avançada
- **Paint.NET**: Para marcações simples

### Estilo de Anotação
- **Cores**: 
  - 🔴 Vermelho: Erros e problemas
  - 🟢 Verde: Sucesso e funcionalidades
  - 🟡 Amarelo: Avisos e atenção
  - 🔵 Azul: Informações e navegação
  
- **Tipos de Marcação**:
  - **Retângulos**: Áreas importantes
  - **Setas**: Direção e fluxo
  - **Círculos**: Pontos específicos
  - **Texto**: Explicações e labels

## 📱 Responsividade e Breakpoints

### Breakpoints Padrão
```css
/* Desktop First */
@media (max-width: 1024px) { /* Tablet */ }
@media (max-width: 768px)  { /* Tablet Portrait */ }
@media (max-width: 480px)  { /* Mobile */ }
@media (max-width: 320px)  { /* Small Mobile */ }
```

### Captura por Dispositivo
- **Desktop**: 1920x1080, 1366x768
- **Tablet**: 1024x768, 768x1024
- **Mobile**: 375x667, 320x568

### Script de Captura Responsiva
```typescript
async function captureResponsive() {
  const breakpoints = [
    { width: 1920, height: 1080, name: 'desktop' },
    { width: 1024, height: 768, name: 'tablet' },
    { width: 375, height: 667, name: 'mobile' },
  ];
  
  for (const bp of breakpoints) {
    await page.setViewportSize(bp);
    await page.screenshot({
      path: `docs/screenshots/${screen.name}-${bp.name}.png`,
    });
  }
}
```

## 🔄 Atualização de Screenshots

### Quando Atualizar
- **Mudanças Visuais**: Layout, cores, componentes
- **Novas Funcionalidades**: Campos, botões, seções
- **Correções de Bug**: Estados de erro, validações
- **Melhorias de UX**: Navegação, feedback

### Processo de Atualização
1. **Identificar Mudanças**: Listar o que foi alterado
2. **Capturar Novas Imagens**: Usar ferramentas apropriadas
3. **Revisar Anotações**: Atualizar marcações se necessário
4. **Substituir Arquivos**: Manter nomenclatura consistente
5. **Atualizar Documentação**: Referenciar novas imagens

### Versionamento
```bash
# Estrutura de versionamento
docs/screenshots/
├── v3.1.0/                  # Versão atual
├── v2.9.0/                  # Versão anterior
└── archive/                 # Versões antigas
```

## 🚀 Integração com CI/CD

### GitHub Actions
```yaml
# .github/workflows/screenshots.yml
name: Update Screenshots

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  capture-screenshots:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Start application
        run: npm run dev &
        env:
          CI: true
      
      - name: Wait for app
        run: sleep 30
      
      - name: Capture screenshots
        run: npx playwright test --grep "screenshot"
      
      - name: Commit screenshots
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add docs/screenshots/
          git commit -m "📸 Update screenshots" || exit 0
          git push
```

### Validação Automática
```typescript
// tests/screenshot-validation.spec.ts
import { test, expect } from '@playwright/test';

test('screenshots are up to date', async ({ page }) => {
  // Verificar se screenshots existem
  const screenshots = [
    'admin-dashboard-default-1920x1080.png',
    'store-cart-with-items-1920x1080.png',
    'gestor-dashboard-default-1920x1080.png',
  ];
  
  for (const screenshot of screenshots) {
    const fs = require('fs');
    const path = `docs/screenshots/${screenshot}`;
    
    expect(fs.existsSync(path)).toBeTruthy();
  }
});
```

## 📊 Monitoramento de Qualidade

### Métricas de Screenshots
- **Cobertura**: % de telas com screenshots
- **Atualização**: Data da última captura
- **Qualidade**: Resolução e tamanho dos arquivos
- **Anotações**: % de screenshots com marcações

### Relatórios de Status
```typescript
// scripts/screenshot-status.ts
import fs from 'fs';
import path from 'path';

function generateStatusReport() {
  const screenshotsDir = 'docs/screenshots';
  const files = fs.readdirSync(screenshotsDir, { recursive: true });
  
  const report = {
    total: files.length,
    byModule: {},
    outdated: [],
    missing: [],
  };
  
  // Analisar estrutura e identificar problemas
  // ...
  
  return report;
}
```

## 🎓 Treinamento da Equipe

### Workshops de Captura
1. **Ferramentas**: Apresentar ferramentas disponíveis
2. **Padrões**: Explicar convenções estabelecidas
3. **Prática**: Exercícios de captura e anotação
4. **Automação**: Como usar scripts de captura

### Documentação de Processos
- **Checklists**: Listas de verificação para captura
- **Templates**: Modelos para diferentes tipos de tela
- **Exemplos**: Screenshots de referência
- **Troubleshooting**: Solução de problemas comuns

## 🔮 Melhorias Futuras

### Ferramentas Avançadas
- **IA para Anotação**: Identificação automática de elementos
- **Comparação Visual**: Detecção de mudanças entre versões
- **Geração Automática**: Screenshots baseados em testes
- **Integração com Design**: Sincronização com Figma/Sketch

### Automação Inteligente
- **Detecção de Mudanças**: Identificar quando atualizar
- **Captura Seletiva**: Apenas telas modificadas
- **Validação Automática**: Verificar qualidade das imagens
- **Deploy Automático**: Atualização em produção

---

## 📞 Suporte e Recursos

### Ferramentas Recomendadas
- **Captura**: Playwright, Puppeteer, Selenium
- **Edição**: Figma, Canva, GIMP
- **Organização**: GitHub, Git LFS
- **Validação**: Playwright Test, Jest

### Comunidade
- **Issues**: Reportar problemas de captura
- **Discussões**: Compartilhar técnicas e dicas
- **Contribuições**: Melhorar scripts e processos
- **Feedback**: Sugerir melhorias

---

*Este guia garante que todas as telas da plataforma tenham screenshots atualizados e bem organizados para facilitar o desenvolvimento e onboarding.*
