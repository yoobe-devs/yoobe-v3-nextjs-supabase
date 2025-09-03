"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { 
  Settings, 
  Save, 
  Globe, 
  Shield, 
  Database, 
  Bell,
  Mail,
  CreditCard,
  Users,
  Store,
  Package,
  BarChart3,
  BookOpen,
  ExternalLink
} from "lucide-react"
import YoobeLogo from "@/components/ui/yoobe-logo"

interface SystemConfig {
  siteName: string
  siteUrl: string
  supportEmail: string
  maxFileSize: number
  maintenanceMode: boolean
  allowRegistration: boolean
  requireEmailVerification: boolean
  enableNotifications: boolean
  enableAnalytics: boolean
  enableBackup: boolean
  backupFrequency: string
  retentionDays: number
}

const defaultConfig: SystemConfig = {
  siteName: "Yoobe - Plataforma de Brindes Corporativos",
  siteUrl: "https://yoobe.co",
  supportEmail: "suporte@yoobe.co",
  maxFileSize: 10,
  maintenanceMode: false,
  allowRegistration: true,
  requireEmailVerification: true,
  enableNotifications: true,
  enableAnalytics: true,
  enableBackup: true,
  backupFrequency: "daily",
  retentionDays: 30
}

export default function AdminConfiguracoesPage() {
  const [config, setConfig] = useState<SystemConfig>(defaultConfig)
  const [isLoading, setIsLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const handleConfigChange = (key: keyof SystemConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsLoading(true)
    // Simular salvamento
    await new Promise(resolve => setTimeout(resolve, 1000))
    setHasChanges(false)
    setIsLoading(false)
  }

  const systemStats = {
    totalUsers: 1247,
    totalCompanies: 12,
    totalStores: 24,
    totalProducts: 456,
    totalOrders: 2891,
    systemUptime: "99.9%",
    lastBackup: "2024-01-17 02:00:00",
    nextBackup: "2024-01-18 02:00:00"
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <YoobeLogo size={40} />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Configurações do Sistema</h1>
            <p className="text-gray-600">Gerencie as configurações globais da plataforma</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={!hasChanges}>
            Restaurar
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || isLoading}>
            {isLoading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {systemStats.totalUsers.toLocaleString()}
            </div>
            <p className="text-sm text-gray-500">Total de usuários</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empresas</CardTitle>
            <Store className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {systemStats.totalCompanies}
            </div>
            <p className="text-sm text-gray-500">Empresas ativas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {systemStats.systemUptime}
            </div>
            <p className="text-sm text-gray-500">Disponibilidade</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Backup</CardTitle>
            <Database className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {systemStats.lastBackup.split(' ')[0]}
            </div>
            <p className="text-sm text-gray-500">Último backup</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Configurações Gerais
            </CardTitle>
            <CardDescription>Configurações básicas do sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Nome do Site</Label>
              <Input
                id="siteName"
                value={config.siteName}
                onChange={(e) => handleConfigChange('siteName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteUrl">URL do Site</Label>
              <Input
                id="siteUrl"
                value={config.siteUrl}
                onChange={(e) => handleConfigChange('siteUrl', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supportEmail">Email de Suporte</Label>
              <Input
                id="supportEmail"
                type="email"
                value={config.supportEmail}
                onChange={(e) => handleConfigChange('supportEmail', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxFileSize">Tamanho Máximo de Arquivo (MB)</Label>
              <Input
                id="maxFileSize"
                type="number"
                value={config.maxFileSize}
                onChange={(e) => handleConfigChange('maxFileSize', parseInt(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Configurações de Segurança
            </CardTitle>
            <CardDescription>Configurações de segurança e privacidade</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Modo de Manutenção</Label>
                <p className="text-sm text-gray-500">Desabilita o acesso público ao sistema</p>
              </div>
              <Switch
                checked={config.maintenanceMode}
                onCheckedChange={(checked) => handleConfigChange('maintenanceMode', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Permitir Registro</Label>
                <p className="text-sm text-gray-500">Permite que novos usuários se registrem</p>
              </div>
              <Switch
                checked={config.allowRegistration}
                onCheckedChange={(checked) => handleConfigChange('allowRegistration', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Verificação de Email</Label>
                <p className="text-sm text-gray-500">Requer verificação de email para ativação</p>
              </div>
              <Switch
                checked={config.requireEmailVerification}
                onCheckedChange={(checked) => handleConfigChange('requireEmailVerification', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Configurações de Notificações
            </CardTitle>
            <CardDescription>Configurações de notificações e alertas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificações por Email</Label>
                <p className="text-sm text-gray-500">Envia notificações por email</p>
              </div>
              <Switch
                checked={config.enableNotifications}
                onCheckedChange={(checked) => handleConfigChange('enableNotifications', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Analytics</Label>
                <p className="text-sm text-gray-500">Coleta dados de uso para analytics</p>
              </div>
              <Switch
                checked={config.enableAnalytics}
                onCheckedChange={(checked) => handleConfigChange('enableAnalytics', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Backup Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Configurações de Backup
            </CardTitle>
            <CardDescription>Configurações de backup e retenção de dados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Backup Automático</Label>
                <p className="text-sm text-gray-500">Executa backups automáticos</p>
              </div>
              <Switch
                checked={config.enableBackup}
                onCheckedChange={(checked) => handleConfigChange('enableBackup', checked)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="backupFrequency">Frequência de Backup</Label>
              <select
                id="backupFrequency"
                value={config.backupFrequency}
                onChange={(e) => handleConfigChange('backupFrequency', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="daily">Diário</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="retentionDays">Dias de Retenção</Label>
              <Input
                id="retentionDays"
                type="number"
                value={config.retentionDays}
                onChange={(e) => handleConfigChange('retentionDays', parseInt(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documentation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Documentação
          </CardTitle>
          <CardDescription>Acesse a documentação completa da plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Documentação Geral</h4>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.open('/admin/documentacao', '_blank')}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Documentação Completa
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.open('/admin/documentacao/viva/API_REFERENCE', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  API Reference
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.open('/admin/documentacao/viva/DATABASE_SCHEMA', '_blank')}
                >
                  <Database className="h-4 w-4 mr-2" />
                  Database Schema
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Integrações</h4>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.open('/admin/documentacao/viva/CUBBO_INTEGRATION', '_blank')}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Integração Cubbo
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.open('/admin/integracoes', '_blank')}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configurar Integrações
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.open('/admin/changelog', '_blank')}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Changelog
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
          <CardDescription>Detalhes técnicos da plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Versão do Sistema:</span>
                <span className="font-medium">v3.1.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Última Atualização:</span>
                <span className="font-medium">2024-01-17</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Próximo Backup:</span>
                <span className="font-medium">{systemStats.nextBackup}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status do Sistema:</span>
                <Badge className="bg-green-100 text-green-800">Online</Badge>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Total de Pedidos:</span>
                <span className="font-medium">{systemStats.totalOrders.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total de Produtos:</span>
                <span className="font-medium">{systemStats.totalProducts}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total de Lojas:</span>
                <span className="font-medium">{systemStats.totalStores}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Uptime:</span>
                <span className="font-medium">{systemStats.systemUptime}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

