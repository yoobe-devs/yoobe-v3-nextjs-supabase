"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  Users, 
  Settings, 
  Mail, 
  Calendar,
  Plus,
  Edit,
  Trash2,
  Save,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react"

interface OnboardingStep {
  id: string
  name: string
  description: string
  duration: string
  required: boolean
  status: 'pending' | 'completed' | 'skipped'
}

const defaultSteps: OnboardingStep[] = [
  {
    id: "1",
    name: "Cadastro Inicial",
    description: "Criação da conta e informações básicas",
    duration: "5 min",
    required: true,
    status: 'completed'
  },
  {
    id: "2", 
    name: "Verificação de Email",
    description: "Confirmação do endereço de email",
    duration: "2 min",
    required: true,
    status: 'completed'
  },
  {
    id: "3",
    name: "Perfil Completo",
    description: "Preenchimento de dados pessoais e profissionais",
    duration: "10 min",
    required: true,
    status: 'pending'
  },
  {
    id: "4",
    name: "Configuração de Preferências",
    description: "Definição de notificações e configurações",
    duration: "3 min",
    required: false,
    status: 'pending'
  },
  {
    id: "5",
    name: "Tour da Plataforma",
    description: "Conhecer as funcionalidades principais",
    duration: "8 min",
    required: false,
    status: 'pending'
  }
]

export default function OnboardingPage() {
  const [steps, setSteps] = useState<OnboardingStep[]>(defaultSteps)
  const [autoAssign, setAutoAssign] = useState(true)
  const [welcomeEmail, setWelcomeEmail] = useState(true)
  const [reminderEmails, setReminderEmails] = useState(true)

  const getStatusIcon = (status: OnboardingStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'skipped':
        return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusText = (status: OnboardingStep['status']) => {
    switch (status) {
      case 'completed':
        return 'Concluído'
      case 'pending':
        return 'Pendente'
      case 'skipped':
        return 'Pulado'
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Onboarding</h1>
        <Button>
          <Save className="mr-2 h-4 w-4" />
          Salvar Configurações
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configurações Gerais */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações Gerais
              </CardTitle>
              <CardDescription>
                Configure o processo de onboarding para novos usuários
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Atribuição Automática</Label>
                  <p className="text-sm text-muted-foreground">
                    Atribuir automaticamente novos usuários ao processo de onboarding
                  </p>
                </div>
                <Switch
                  checked={autoAssign}
                  onCheckedChange={setAutoAssign}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email de Boas-vindas</Label>
                  <p className="text-sm text-muted-foreground">
                    Enviar email de boas-vindas para novos usuários
                  </p>
                </div>
                <Switch
                  checked={welcomeEmail}
                  onCheckedChange={setWelcomeEmail}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Emails de Lembrete</Label>
                  <p className="text-sm text-muted-foreground">
                    Enviar lembretes para usuários que não completaram o onboarding
                  </p>
                </div>
                <Switch
                  checked={reminderEmails}
                  onCheckedChange={setReminderEmails}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Etapas do Onboarding
              </CardTitle>
              <CardDescription>
                Gerencie as etapas do processo de onboarding
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Etapas Configuradas</h3>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Etapa
                  </Button>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Etapa</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Duração</TableHead>
                      <TableHead>Obrigatória</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {steps.map((step) => (
                      <TableRow key={step.id}>
                        <TableCell className="font-medium">{step.name}</TableCell>
                        <TableCell>{step.description}</TableCell>
                        <TableCell>{step.duration}</TableCell>
                        <TableCell>
                          {step.required ? (
                            <span className="text-green-600">Sim</span>
                          ) : (
                            <span className="text-gray-500">Não</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(step.status)}
                            <span className="text-sm">{getStatusText(step.status)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Estatísticas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">85%</div>
                <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Usuários Ativos</span>
                  <span className="text-sm font-medium">1,234</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Em Onboarding</span>
                  <span className="text-sm font-medium">45</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Concluído Hoje</span>
                  <span className="text-sm font-medium">12</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Templates de Email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  Email de Boas-vindas
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Lembrete de Onboarding
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Conclusão do Onboarding
                </Button>
              </div>
              <Button className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Criar Novo Template
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configurações Avançadas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Duração Máxima</Label>
                <Select defaultValue="30">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 dias</SelectItem>
                    <SelectItem value="15">15 dias</SelectItem>
                    <SelectItem value="30">30 dias</SelectItem>
                    <SelectItem value="60">60 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Frequência de Lembretes</Label>
                <Select defaultValue="3">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Diário</SelectItem>
                    <SelectItem value="3">A cada 3 dias</SelectItem>
                    <SelectItem value="7">Semanal</SelectItem>
                    <SelectItem value="14">A cada 2 semanas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

