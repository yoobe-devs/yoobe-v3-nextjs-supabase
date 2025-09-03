#!/usr/bin/env node

/**
 * Script para capturar screenshots das telas principais da plataforma
 * 
 * Uso: node scripts/capture-screenshots.js
 * 
 * Este script:
 * 1. Inicia o servidor de desenvolvimento
 * 2. Captura screenshots das telas principais
 * 3. Organiza os screenshots por módulo
 * 4. Atualiza a documentação com as imagens
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configurações
const SCREENSHOTS_DIR = path.join(__dirname, '../docs/screens/screenshots');
const SCREENSHOT_CONFIG = {
  width: 1920,
  height: 1080,
  fullPage: true,
  quality: 90
};

// Lista de telas para capturar
const SCREENS_TO_CAPTURE = [
  // Admin Module
  {
    name: 'admin-dashboard',
    url: 'http://localhost:3000/admin/dashboard',
    description: 'Dashboard Administrativo',
    module: 'admin'
  },
  {
    name: 'admin-changelog',
    url: 'http://localhost:3000/admin/changelog',
    description: 'Changelog do Sistema',
    module: 'admin'
  },
  {
    name: 'admin-usuarios',
    url: 'http://localhost:3000/admin/usuarios',
    description: 'Gestão de Usuários',
    module: 'admin'
  },
  // Store Module
  {
    name: 'store-dashboard',
    url: 'http://localhost:3000/store/dashboard',
    description: 'Dashboard da Loja',
    module: 'store'
  },
  {
    name: 'store-cart',
    url: 'http://localhost:3000/store/cart',
    description: 'Carrinho de Compras',
    module: 'store'
  },
  // Gestor Module
  {
    name: 'gestor-dashboard',
    url: 'http://localhost:3000/gestor/dashboard',
    description: 'Dashboard do Gestor',
    module: 'gestor'
  }
];

// Função para criar diretórios
function createDirectories() {
  const dirs = [
    SCREENSHOTS_DIR,
    path.join(SCREENSHOTS_DIR, 'admin'),
    path.join(SCREENSHOTS_DIR, 'store'),
    path.join(SCREENSHOTS_DIR, 'gestor'),
    path.join(SCREENSHOTS_DIR, 'auth')
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Diretório criado: ${dir}`);
    }
  });
}

// Função para verificar se o servidor está rodando
function checkServer() {
  try {
    const response = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:3000', { encoding: 'utf8' });
    return response.trim() === '200';
  } catch (error) {
    return false;
  }
}

// Função para iniciar o servidor
function startServer() {
  console.log('🚀 Iniciando servidor de desenvolvimento...');
  try {
    execSync('npm run dev', { 
      cwd: process.cwd(),
      stdio: 'pipe',
      detached: true 
    });
  } catch (error) {
    console.log('⚠️  Servidor já está rodando ou erro ao iniciar');
  }
}

// Função para aguardar o servidor
function waitForServer(maxAttempts = 30) {
  console.log('⏳ Aguardando servidor ficar disponível...');
  
  return new Promise((resolve, reject) => {
    let attempts = 0;
    
    const check = () => {
      attempts++;
      if (checkServer()) {
        console.log('✅ Servidor disponível!');
        resolve();
      } else if (attempts >= maxAttempts) {
        reject(new Error('Timeout aguardando servidor'));
      } else {
        setTimeout(check, 2000);
      }
    };
    
    check();
  });
}

// Função para capturar screenshot
async function captureScreenshot(browser, screen) {
  try {
    console.log(`📸 Capturando: ${screen.description}`);
    
    const page = await browser.newPage();
    await page.setViewportSize({ 
      width: SCREENSHOT_CONFIG.width, 
      height: SCREENSHOT_CONFIG.height 
    });
    
    // Navegar para a página
    await page.goto(screen.url, { waitUntil: 'networkidle' });
    
    // Aguardar um pouco para carregar completamente
    await page.waitForTimeout(2000);
    
    // Capturar screenshot
    const screenshotPath = path.join(SCREENSHOTS_DIR, screen.module, `${screen.name}.png`);
    await page.screenshot({
      path: screenshotPath,
      fullPage: SCREENSHOT_CONFIG.fullPage,
      quality: SCREENSHOT_CONFIG.quality
    });
    
    await page.close();
    console.log(`✅ Screenshot salvo: ${screenshotPath}`);
    
    return screenshotPath;
  } catch (error) {
    console.error(`❌ Erro ao capturar ${screen.name}:`, error.message);
    return null;
  }
}

// Função para atualizar documentação com screenshots
function updateDocumentationWithScreenshots() {
  console.log('📝 Atualizando documentação com screenshots...');
  
  SCREENS_TO_CAPTURE.forEach(screen => {
    const docPath = path.join(__dirname, `../docs/screens/${screen.name}.md`);
    const screenshotPath = `./screenshots/${screen.module}/${screen.name}.png`;
    
    if (fs.existsSync(docPath)) {
      let content = fs.readFileSync(docPath, 'utf8');
      
      // Substituir placeholder de screenshot
      if (content.includes('{/* Layout será descrito automaticamente */}')) {
        content = content.replace(
          '{/* Layout será descrito automaticamente */}',
          `![${screen.description}](${screenshotPath})\n\n**Screenshot da tela ${screen.description}**`
        );
      }
      
      // Adicionar seção de screenshot se não existir
      if (!content.includes('## 📸 Screenshot e Interface')) {
        const screenshotSection = `
## 📸 Screenshot e Interface

### Screenshot da Tela

![${screen.description}](${screenshotPath})

### Layout da Tela

A tela apresenta uma interface moderna e responsiva com os seguintes elementos principais:

- **Header**: Título e navegação principal
- **Conteúdo**: Área principal com funcionalidades específicas
- **Sidebar**: Menu lateral com opções de navegação
- **Footer**: Informações e links úteis

### Elementos Visuais

- Design responsivo e adaptável
- Paleta de cores consistente com a identidade da marca
- Tipografia clara e legível
- Ícones intuitivos e bem posicionados
`;
        
        // Inserir antes da seção de dados de teste
        const insertPoint = content.indexOf('## 🧪 Dados de Teste');
        if (insertPoint !== -1) {
          content = content.slice(0, insertPoint) + screenshotSection + content.slice(insertPoint);
        } else {
          content += screenshotSection;
        }
      }
      
      fs.writeFileSync(docPath, content);
      console.log(`📝 Documentação atualizada: ${screen.name}.md`);
    }
  });
}

// Função para gerar relatório de screenshots
function generateScreenshotReport() {
  const reportPath = path.join(SCREENSHOTS_DIR, 'README.md');
  
  let report = `# 📸 Screenshots das Telas da Plataforma

## 📊 Resumo

Este diretório contém screenshots das principais telas da plataforma Yoobe v3.0.0, organizados por módulo para facilitar a documentação e onboarding.

## 📁 Estrutura

\`\`\`
screenshots/
├── admin/          # Telas administrativas
├── store/          # Telas da loja
├── gestor/         # Telas do gestor
├── auth/           # Telas de autenticação
└── README.md       # Este arquivo
\`\`\`

## 🖼️ Telas Capturadas

### 🏢 Admin

`;

  // Adicionar telas admin
  SCREENS_TO_CAPTURE
    .filter(screen => screen.module === 'admin')
    .forEach(screen => {
      report += `- **${screen.description}** - \`${screen.name}.png\`\n`;
    });

  report += `
### 🛒 Store

`;

  // Adicionar telas store
  SCREENS_TO_CAPTURE
    .filter(screen => screen.module === 'store')
    .forEach(screen => {
      report += `- **${screen.description}** - \`${screen.name}.png\`\n`;
    });

  report += `
### 👥 Gestor

`;

  // Adicionar telas gestor
  SCREENS_TO_CAPTURE
    .filter(screen => screen.module === 'gestor')
    .forEach(screen => {
      report += `- **${screen.description}** - \`${screen.name}.png\`\n`;
    });

  report += `
## 🚀 Como Usar

### Para Desenvolvedores
1. Use os screenshots na documentação técnica
2. Referencie as imagens nos guias de usuário
3. Mantenha as imagens atualizadas após mudanças visuais

### Para Designers
1. Analise a consistência visual entre telas
2. Identifique oportunidades de melhoria
3. Use como referência para novas funcionalidades

### Para Product Managers
1. Apresente funcionalidades em reuniões
2. Documente mudanças visuais
3. Use para treinamento da equipe

## 📝 Manutenção

- **Atualização**: Execute \`node scripts/capture-screenshots.js\` após mudanças visuais
- **Qualidade**: Screenshots em 1920x1080 com qualidade 90%
- **Organização**: Mantenha a estrutura de diretórios por módulo
- **Versionamento**: Commit screenshots junto com mudanças de código

## 🔧 Configuração

- **Resolução**: 1920x1080 pixels
- **Formato**: PNG com qualidade 90%
- **Captura**: Full page (página completa)
- **Navegador**: Chromium via Playwright

---

*Screenshots gerados automaticamente em ${new Date().toLocaleDateString('pt-BR')}*
`;

  fs.writeFileSync(reportPath, report);
  console.log('📋 Relatório de screenshots gerado');
}

// Função principal
async function main() {
  console.log('🚀 Iniciando captura de screenshots...\n');
  
  try {
    // Criar diretórios
    createDirectories();
    
    // Verificar/iniciar servidor
    if (!checkServer()) {
      startServer();
      await waitForServer();
    } else {
      console.log('✅ Servidor já está rodando');
    }
    
    // Iniciar navegador
    console.log('🌐 Iniciando navegador...');
    const browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    // Capturar screenshots
    console.log('\n📸 Iniciando captura de screenshots...\n');
    const results = [];
    
    for (const screen of SCREENS_TO_CAPTURE) {
      const result = await captureScreenshot(browser, screen);
      if (result) {
        results.push({ ...screen, screenshotPath: result });
      }
    }
    
    // Fechar navegador
    await browser.close();
    
    // Atualizar documentação
    updateDocumentationWithScreenshots();
    
    // Gerar relatório
    generateScreenshotReport();
    
    // Resumo final
    console.log('\n🎉 Captura de screenshots concluída!');
    console.log(`📊 Screenshots capturados: ${results.length}/${SCREENS_TO_CAPTURE.length}`);
    console.log(`📁 Localização: ${SCREENSHOTS_DIR}`);
    console.log('\n📝 Próximos passos:');
    console.log('1. Revisar qualidade dos screenshots');
    console.log('2. Atualizar documentação com as imagens');
    console.log('3. Commit das mudanças no repositório');
    
  } catch (error) {
    console.error('❌ Erro durante captura de screenshots:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = {
  captureScreenshots: main,
  SCREENS_TO_CAPTURE,
  SCREENSHOT_CONFIG
};
