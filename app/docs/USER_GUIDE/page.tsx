'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  BookOpen, 
  ArrowLeft, 
  ExternalLink,
  Users,
  Shield,
  ShoppingCart,
  Building,
  CreditCard,
  Package,
  BarChart3,
  Globe,
  FileText,
  Settings,
  HelpCircle,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'

export default function UserGuidePage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/docs">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-blue-600" />
              Manual do Usuário v3.1.0
            </h1>
            <p className="text-gray-600 mt-2">
              Guia completo para usuários da plataforma com todas as funcionalidades v3.1.0
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            v3.1.0
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Ativo
          </Badge>
        </div>
      </div>

      <Separator />

      {/* Índice */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📋 Índice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Link href="#introducao" className="text-blue-600 hover:underline">• Introdução</Link>
            <Link href="#perfis-usuario" className="text-blue-600 hover:underline">• Perfis de Usuário</Link>
            <Link href="#primeiros-passos" className="text-blue-600 hover:underline">• Primeiros Passos</Link>
            <Link href="#sistema-orcamentos" className="text-blue-600 hover:underline">• Sistema de Orçamentos</Link>
            <Link href="#checkout-resgates" className="text-blue-600 hover:underline">• Checkout e Resgates</Link>
            <Link href="#gestao-usuarios" className="text-blue-600 hover:underline">• Gestão de Usuários</Link>
            <Link href="#enderecos" className="text-blue-600 hover:underline">• Gestão de Endereços</Link>
            <Link href="#carteira-pontos" className="text-blue-600 hover:underline">• Carteira de Pontos</Link>
            <Link href="#dashboards" className="text-blue-600 hover:underline">• Dashboards</Link>
            <Link href="#configuracoes" className="text-blue-600 hover:underline">• Configurações</Link>
            <Link href="#suporte" className="text-blue-600 hover:underline">• Suporte</Link>
          </div>
        </CardContent>
      </Card>

      {/* Introdução */}
      <section id="introducao">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🎯 Introdução
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              Bem-vindo ao <strong>Manual do Usuário da Yoobe Platform v3.1.0</strong>! Este guia foi criado para ajudá-lo a aproveitar ao máximo todas as funcionalidades da plataforma.
            </p>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">🚀 O que é a Yoobe Platform v3.1.0?</h3>
              <p className="text-sm text-blue-800">
                A Yoobe Platform é uma solução completa para gestão corporativa de brindes, recompensas e fulfillment. 
                A versão 3.1.0 introduz um sistema revolucionário de orçamentos com aprovação e replicação automática de produtos.
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">✨ Principais Funcionalidades</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div>✅ <strong>Sistema de Orçamentos</strong> com workflow de aprovação</div>
                <div>✅ <strong>RBAC Avançado</strong> com 4 níveis de acesso</div>
                <div>✅ <strong>Multi-tenancy</strong> com empresas independentes</div>
                <div>✅ <strong>Checkout Inteligente</strong> com múltiplos pagamentos</div>
                <div>✅ <strong>Replicação Automática</strong> de produtos</div>
                <div>✅ <strong>Sistema de Carteira</strong> com pontos</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Perfis de Usuário */}
      <section id="perfis-usuario">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Perfis de Usuário
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              A Yoobe Platform v3.1.0 possui um sistema robusto de controle de acesso baseado em roles (RBAC) com 4 níveis de permissão.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="border-l-4 border-red-500 pl-4">
                  <h4 className="font-semibold text-red-700">👑 Super Admin</h4>
                  <p className="text-sm text-gray-600">Acesso total à plataforma</p>
                  <ul className="text-xs text-gray-500 mt-1">
                    <li>• Gerenciar todas as empresas</li>
                    <li>• Configurar integrações globais</li>
                    <li>• Monitorar o sistema</li>
                    <li>• Aprovar orçamentos globais</li>
                  </ul>
                </div>
                
                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-semibold text-orange-700">🏢 Admin Gestor</h4>
                  <p className="text-sm text-gray-600">Gerencia empresa e gestores</p>
                  <ul className="text-xs text-gray-500 mt-1">
                    <li>• Configurar políticas da empresa</li>
                    <li>• Gestão de gestores e funcionários</li>
                    <li>• Relatórios empresariais</li>
                  </ul>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-blue-700">👨‍💼 Gestor</h4>
                  <p className="text-sm text-gray-600">Cria orçamentos e gerencia equipe</p>
                  <ul className="text-xs text-gray-500 mt-1">
                    <li>• Criar orçamentos com produtos</li>
                    <li>• Gerencia funcionários da equipe</li>
                    <li>• Acompanha aprovações</li>
                    <li>• Personaliza produtos replicados</li>
                  </ul>
                </div>
                
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-green-700">👤 Funcionário</h4>
                  <p className="text-sm text-gray-600">Resgata produtos da empresa</p>
                  <ul className="text-xs text-gray-500 mt-1">
                    <li>• Resgatar produtos da empresa</li>
                    <li>• Gerencia perfil e endereços</li>
                    <li>• Visualiza carteira de pontos</li>
                    <li>• Histórico de resgates</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Primeiros Passos */}
      <section id="primeiros-passos">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🚀 Primeiros Passos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              Siga este guia passo a passo para começar a usar a Yoobe Platform v3.1.0.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <h4 className="font-semibold">Receber Convite</h4>
                  <p className="text-sm text-gray-600">
                    Você receberá um email com convite para acessar a plataforma. Clique no link para aceitar o convite.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <h4 className="font-semibold">Criar Conta</h4>
                  <p className="text-sm text-gray-600">
                    Complete seu perfil com nome completo, senha e informações básicas.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <h4 className="font-semibold">Configurar Perfil</h4>
                  <p className="text-sm text-gray-600">
                    Adicione endereços de entrega e configure suas preferências.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">4</div>
                <div>
                  <h4 className="font-semibold">Explorar Funcionalidades</h4>
                  <p className="text-sm text-gray-600">
                    Navegue pela plataforma e descubra todas as funcionalidades disponíveis para seu perfil.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Sistema de Orçamentos */}
      <section id="sistema-orcamentos">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Sistema de Orçamentos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              O sistema de orçamentos da Yoobe v3.1.0 permite que gestores criem orçamentos que são enviados para aprovação e, após pagamento, geram replicação automática de produtos.
            </p>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-900 mb-2">📋 Fluxo de Orçamentos</h3>
              <div className="space-y-2 text-sm">
                <div>1️⃣ <strong>Draft:</strong> Gestor cria orçamento com produtos e quantidades</div>
                <div>2️⃣ <strong>Sent:</strong> Enviado para aprovação do Admin Global</div>
                <div>3️⃣ <strong>Approved/Rejected:</strong> Admin aprova ou rejeita com comentários</div>
                <div>4️⃣ <strong>Paid:</strong> Pagamento processado automaticamente</div>
                <div>5️⃣ <strong>Replication Queued:</strong> Produtos enfileirados para replicação</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Para Gestores</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Criar orçamentos com produtos específicos</li>
                  <li>• Definir quantidades e preços</li>
                  <li>• Aplicar descontos configuráveis</li>
                  <li>• Acompanhar status de aprovação</li>
                  <li>• Receber notificações automáticas</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Para Admins</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Revisar orçamentos pendentes</li>
                  <li>• Aprovar ou rejeitar com comentários</li>
                  <li>• Monitorar fluxo de aprovações</li>
                  <li>• Configurar políticas de aprovação</li>
                  <li>• Acompanhar métricas de orçamentos</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Checkout e Resgates */}
      <section id="checkout-resgates">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Checkout e Resgates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              O sistema de checkout da Yoobe v3.1.0 oferece uma experiência completa e segura para resgate de produtos.
            </p>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">💳 Métodos de Pagamento</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                <div>💰 <strong>Pontos:</strong> Debitam da carteira</div>
                <div>💳 <strong>Cartão de Crédito:</strong> Integração com gateways</div>
                <div>📱 <strong>PIX:</strong> Pagamento instantâneo</div>
                <div>🏦 <strong>Cartão de Débito:</strong> Processamento bancário</div>
                <div>📄 <strong>Boleto:</strong> Pagamento bancário</div>
                <div>❤️ <strong>Doação:</strong> Contribuições voluntárias</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Processo de Checkout</h4>
                <ol className="space-y-1 text-sm list-decimal list-inside">
                  <li><strong>Seleção:</strong> Escolha produtos do catálogo</li>
                  <li><strong>Carrinho:</strong> Revise itens e quantidades</li>
                  <li><strong>Endereço:</strong> Selecione endereço de entrega</li>
                  <li><strong>Pagamento:</strong> Escolha método de pagamento</li>
                  <li><strong>Confirmação:</strong> Revisão final e confirmação</li>
                </ol>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Validações</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Verificação de saldo em tempo real</li>
                  <li>• Validação de endereços com CEP</li>
                  <li>• Verificação de disponibilidade</li>
                  <li>• Validação de métodos de pagamento</li>
                  <li>• Confirmação de dados pessoais</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Gestão de Usuários */}
      <section id="gestao-usuarios">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gestão de Usuários
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              O sistema de gestão de usuários permite convidar novos membros da equipe e gerenciar suas permissões.
            </p>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">📧 Sistema de Convites</h3>
              <div className="space-y-2 text-sm">
                <div>✅ <strong>Envio de Convites:</strong> Gestores podem convidar novos funcionários</div>
                <div>✅ <strong>Validação de Email:</strong> Sistema verifica se o email é válido</div>
                <div>✅ <strong>Definição de Roles:</strong> Escolha o nível de acesso adequado</div>
                <div>✅ <strong>Expiração Automática:</strong> Convites expiram em 7 dias</div>
                <div>✅ <strong>Notificações:</strong> Lembretes automáticos para convites pendentes</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Como Convidar</h4>
                <ol className="space-y-1 text-sm list-decimal list-inside">
                  <li>Acesse a seção "Usuários"</li>
                  <li>Clique em "Convidar Usuário"</li>
                  <li>Digite o email do convidado</li>
                  <li>Selecione o role apropriado</li>
                  <li>Envie o convite</li>
                </ol>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Gestão de Equipes</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Visualizar todos os membros da equipe</li>
                  <li>• Alterar roles e permissões</li>
                  <li>• Desativar usuários inativos</li>
                  <li>• Monitorar atividade dos usuários</li>
                  <li>• Exportar relatórios de equipe</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Gestão de Endereços */}
      <section id="enderecos">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Gestão de Endereços
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              O sistema de gestão de endereços permite que usuários tenham múltiplos endereços com validação automática.
            </p>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">📍 Funcionalidades</h3>
              <div className="space-y-2 text-sm">
                <div>✅ <strong>Múltiplos Endereços:</strong> Usuários podem ter vários endereços</div>
                <div>✅ <strong>Endereço Padrão:</strong> Sistema garante apenas um endereço padrão</div>
                <div>✅ <strong>Validação de CEP:</strong> Integração com serviços de CEP</div>
                <div>✅ <strong>Integração com Checkout:</strong> Endereços refletem automaticamente</div>
                <div>✅ <strong>Histórico de Alterações:</strong> Rastreamento de mudanças</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Adicionar Endereço</h4>
                <ol className="space-y-1 text-sm list-decimal list-inside">
                  <li>Acesse seu perfil</li>
                  <li>Clique em "Endereços"</li>
                  <li>Clique em "Adicionar Endereço"</li>
                  <li>Preencha os campos obrigatórios</li>
                  <li>Defina como padrão se necessário</li>
                </ol>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Campos Obrigatórios</h4>
                <ul className="space-y-1 text-sm">
                  <li>• <strong>CEP:</strong> Validação automática</li>
                  <li>• <strong>Rua:</strong> Nome da rua</li>
                  <li>• <strong>Número:</strong> Número do endereço</li>
                  <li>• <strong>Bairro:</strong> Bairro da cidade</li>
                  <li>• <strong>Cidade:</strong> Nome da cidade</li>
                  <li>• <strong>Estado:</strong> Sigla do estado</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Carteira de Pontos */}
      <section id="carteira-pontos">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Carteira de Pontos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              O sistema de carteira permite que usuários gerenciem seus pontos e acompanhem transações.
            </p>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-semibold text-orange-900 mb-2">💰 Funcionalidades da Carteira</h3>
              <div className="space-y-2 text-sm">
                <div>✅ <strong>Saldo em Tempo Real:</strong> Consulta instantânea de saldo</div>
                <div>✅ <strong>Histórico de Transações:</strong> Registro completo de créditos e débitos</div>
                <div>✅ <strong>Sistema de Crédito:</strong> Gestores podem creditar pontos</div>
                <div>✅ <strong>Débito Automático:</strong> Sistema debita pontos automaticamente</div>
                <div>✅ <strong>Notificações:</strong> Alertas de transações importantes</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Tipos de Transação</h4>
                <ul className="space-y-1 text-sm">
                  <li>• <strong>Crédito:</strong> Pontos adicionados à carteira</li>
                  <li>• <strong>Débito:</strong> Pontos utilizados em resgates</li>
                  <li>• <strong>Transferência:</strong> Entre usuários da mesma empresa</li>
                  <li>• <strong>Bônus:</strong> Pontos extras por atividades</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Como Usar</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Acesse "Minha Carteira" no menu</li>
                  <li>• Visualize saldo atual</li>
                  <li>• Consulte histórico de transações</li>
                  <li>• Use pontos no checkout</li>
                  <li>• Receba notificações de mudanças</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Dashboards */}
      <section id="dashboards">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Dashboards e Métricas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              Os dashboards fornecem visão em tempo real das métricas e atividades da plataforma.
            </p>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">📊 Métricas Disponíveis</h3>
              <div className="space-y-2 text-sm">
                <div>✅ <strong>Atividade de Usuários:</strong> Login, ações e tempo online</div>
                <div>✅ <strong>Orçamentos:</strong> Status, valores e aprovações</div>
                <div>✅ <strong>Resgates:</strong> Produtos mais populares e volumes</div>
                <div>✅ <strong>Pontos:</strong> Distribuição e utilização</div>
                <div>✅ <strong>Performance:</strong> Tempo de resposta e disponibilidade</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Para Gestores</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Dashboard da empresa</li>
                  <li>• Métricas de orçamentos</li>
                  <li>• Atividade da equipe</li>
                  <li>• Relatórios de resgates</li>
                  <li>• Análise de pontos</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Para Funcionários</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Histórico pessoal</li>
                  <li>• Saldo de pontos</li>
                  <li>• Resgates realizados</li>
                  <li>• Endereços cadastrados</li>
                  <li>• Preferências</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Configurações */}
      <section id="configuracoes">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              Personalize sua experiência na plataforma através das configurações disponíveis.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Perfil Pessoal</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Alterar nome e informações</li>
                  <li>• Atualizar foto de perfil</li>
                  <li>• Mudar senha</li>
                  <li>• Configurar notificações</li>
                  <li>• Preferências de idioma</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Notificações</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Email de orçamentos</li>
                  <li>• Alertas de pontos</li>
                  <li>• Status de resgates</li>
                  <li>• Convites de equipe</li>
                  <li>• Atualizações da plataforma</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Suporte */}
      <section id="suporte">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Suporte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              Encontre ajuda e suporte para suas dúvidas sobre a plataforma.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <HelpCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold">Central de Ajuda</h4>
                <p className="text-sm text-gray-600">Documentação completa e FAQs</p>
                <Link href="/docs" className="text-blue-600 text-sm hover:underline">
                  Acessar →
                </Link>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <AlertTriangle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <h4 className="font-semibold">Reportar Problema</h4>
                <p className="text-sm text-gray-600">Informe bugs ou problemas</p>
                <Button variant="outline" size="sm" className="mt-2">
                  Reportar
                </Button>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold">Status do Sistema</h4>
                <p className="text-sm text-gray-600">Verificar disponibilidade</p>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 mt-2">
                  ✅ Online
                </Badge>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">📞 Contatos de Suporte</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div><strong>Email:</strong> suporte@yoobe.com</div>
                  <div><strong>Telefone:</strong> +55 11 99999-9999</div>
                </div>
                <div>
                  <div><strong>Horário:</strong> Seg-Sex, 8h-18h</div>
                  <div><strong>Chat:</strong> Disponível 24/7</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <div className="text-center">
        <Link href="/docs">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Documentação
          </Button>
        </Link>
      </div>
    </div>
  )
}
