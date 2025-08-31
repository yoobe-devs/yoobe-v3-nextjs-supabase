# Yoobe Platform - Visão Geral

## 🎯 **SOBRE A PLATAFORMA**

A **Yoobe** é uma plataforma completa de gestão de brindes corporativos e gamificação, oferecendo:

- **Gestão de Produtos**: Catálogo completo de brindes
- **Sistema de Pontos**: Gamificação integrada
- **Fulfillment**: Integração com Cubbo para logística
- **Integrações**: Conectividade com ERPs, CRMs e plataformas de gamificação

## 🏗️ **ARQUITETURA**

### **Frontend**
- **Framework**: Next.js 14 com App Router
- **UI**: Tailwind CSS + Radix UI
- **Estado**: React Hooks + Context API
- **Autenticação**: Supabase Auth

### **Backend**
- **APIs**: Next.js API Routes
- **Banco**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Storage**: Supabase Storage

### **Integrações**
- **Fulfillment**: Cubbo (global)
- **Gamificação**: Workvivo, Applause, Human
- **Automação**: Zapier, Floui, Make
- **ERPs**: SAP, Salesforce, Oracle

## 👥 **PERFIS DE USUÁRIO**

### **Admin Global**
- Configuração de integrações globais
- Gestão de todas as lojas
- Configuração do sistema

### **Gestor**
- Gestão da sua loja
- Produtos e funcionários
- Integrações específicas

### **Funcionário**
- Visualização da loja
- Compra de produtos
- Gestão de pontos

## 🔗 **INTEGRAÇÕES DISPONÍVEIS**

### **Fulfillment (Global)**
- **Cubbo**: Fulfillment centralizado para todas as lojas

### **Gamificação (Por Loja)**
- **Workvivo**: Pontos de reconhecimento
- **Applause**: Pontos de feedback
- **Human**: Pontos de bem-estar

### **Automação (Por Loja)**
- **Zapier**: Workflows automatizados
- **Floui**: Automação empresarial
- **Make**: Cenários de automação

### **ERP/CRM (Por Loja)**
- **SAP**: Sincronização de dados
- **Salesforce**: Integração CRM
- **Oracle**: Conectividade ERP

### **Gestão de Usuários (Por Loja)**
- **Active Directory**: Sincronização de usuários
- **Google Workspace**: Usuários Google
- **Microsoft 365**: Usuários M365

## 📊 **FLUXO DE DADOS**

```
Admin Global → Configura Cubbo → Todas as Lojas
Gestor → Configura Integrações → Sua Loja
Funcionário → Usa Pontos → Compra Produtos
Cubbo → Gerencia Estoque → Fulfillment
```

## 🚀 **PRÓXIMAS VERSÕES**

### **v2.1.0** (Próxima)
- Webhooks para integrações
- Dashboard avançado
- Relatórios detalhados

### **v2.2.0** (Futuro)
- IA para recomendações
- Mobile app
- Analytics avançado
