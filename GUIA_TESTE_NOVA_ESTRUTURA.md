# 🧪 Guia de Teste - Nova Estrutura Yoobe

## 🚀 Como Testar

### 1️⃣ **Abra seu navegador e acesse:**

```
http://localhost:3000/
```

### 2️⃣ **Teste a Landing Page:**
- ✅ Verifique se a página carrega
- ✅ Teste as abas "Empresas" e "Plataformas de Gamificação"
- ✅ Clique nos botões "Criar Loja Gratuitamente"
- ✅ Teste a responsividade (redimensione a janela)

### 3️⃣ **Teste o Cadastro:**
```
http://localhost:3000/auth/register
```
- ✅ Preencha a **Etapa 1**: Informações da Empresa
- ✅ Clique em "Próximo"
- ✅ Preencha a **Etapa 2**: Dados do Contato
- ✅ Clique em "Próximo"
- ✅ Selecione um plano na **Etapa 3**
- ✅ Aceite os termos
- ✅ Clique em "Criar Conta"

### 4️⃣ **Teste o Onboarding:**
```
http://localhost:3000/onboarding
```
- ✅ **Etapa 1**: Configure nome da loja e domínio
- ✅ **Etapa 2**: Escolha cores e adicione informações
- ✅ **Etapa 3**: Selecione integrações (Workvivo, etc.)
- ✅ **Etapa 4**: Revise e ative a loja

## 📱 **Teste de Responsividade**

### Desktop (1920x1080)
- Verifique se todos os elementos estão alinhados
- Teste a navegação entre seções

### Tablet (768x1024)
- Redimensione a janela para testar layout responsivo
- Verifique se os menus se adaptam

### Mobile (375x667)
- Use as ferramentas de desenvolvedor do navegador
- Teste em modo mobile

## 🎯 **O que Verificar**

### ✅ **Landing Page**
- [ ] Logo da Yoobe aparece
- [ ] Tabs funcionam corretamente
- [ ] Botões de CTA são clicáveis
- [ ] Design é responsivo
- [ ] Seções carregam corretamente

### ✅ **Cadastro**
- [ ] 3 etapas funcionam
- [ ] Validação de campos obrigatórios
- [ ] Seleção de planos
- [ ] Checkbox de termos
- [ ] Redirecionamento para onboarding

### ✅ **Onboarding**
- [ ] 4 etapas de configuração
- [ ] Seleção de cores
- [ ] Upload de logo (simulado)
- [ ] Seleção de integrações
- [ ] Resumo final

## 🐛 **Se Algo Não Funcionar**

### Problema: Página não carrega
**Solução:**
```bash
# Verifique se o servidor está rodando
lsof -i :3000

# Se não estiver, inicie:
npm run dev
```

### Problema: Erro 500
**Solução:**
```bash
# Reinicie o servidor
pkill -f "next dev"
npm run dev
```

### Problema: Redirecionamento para login
**Solução:**
- Verifique se a rota está na lista de rotas públicas no `middleware.ts`

## 📞 **Suporte**

Se encontrar problemas:
1. Verifique o console do navegador (F12)
2. Verifique os logs do servidor
3. Teste em modo incógnito
4. Limpe o cache do navegador

---

**Status**: ✅ Pronto para Teste  
**Versão**: v3.0.0  
**Data**: Janeiro 2024
