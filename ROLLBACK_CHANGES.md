# Escopo da Fase 0+1: Hardening de Acessos e Validação Core

Esta fase tem como objetivo estabilizar a plataforma Yoobe v3.3 após a grande atualização, focando em:

1.  **Segurança e Acesso**: Corrigir e padronizar todo o fluxo de login, redirecionamento e proteção de rotas, unificando a gestão de papéis (roles) e provedores de autenticação.
2.  **Orquestração de Ferramentas**: Integrar e configurar o gestor de middleware e o orquestrador de MCPs (Context v7), estabelecendo prioridades e fallbacks para garantir a confiabilidade do código.
3.  **Validação Funcional**: Auditar e validar as funcionalidades core (Budgets, Replicação de Produtos, Tags, Criação de Lojas) no ambiente local, garantindo que operem conforme o schema real do banco de dados.
4.  **Guardas de Regressão**: Implementar testes e verificações automatizadas (Playwright, Spec Kit, Monitoring) para prevenir a reintrodução de bugs e garantir a estabilidade contínua.
5.  **Documentação**: Gerar relatórios detalhados e atualizar a documentação técnica para refletir o estado atual e as correções aplicadas.
