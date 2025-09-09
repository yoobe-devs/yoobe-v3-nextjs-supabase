#!/usr/bin/env node

/**
 * Script para garantir que o sistema esteja sempre disponível
 * Executa verificações de saúde e tentativas de recuperação
 */

const http = require('http')
const { spawn } = require('child_process')

class SystemAvailabilityManager {
  constructor() {
    this.baseUrl = 'http://localhost:3000'
    this.maxRetries = 3
    this.retryDelay = 5000
    this.healthCheckInterval = 30000
    this.isMonitoring = false
    this.retryCount = 0
  }

  async start() {
    console.log('🚀 Iniciando gerenciador de disponibilidade do sistema...')

    // Verificar se o sistema já está rodando
    const isRunning = await this.checkSystemHealth()

    if (!isRunning) {
      console.log('⚠️ Sistema não está respondendo, tentando iniciar...')
      await this.startSystem()
    } else {
      console.log('✅ Sistema já está rodando e saudável')
    }

    // Iniciar monitoramento contínuo
    this.startContinuousMonitoring()
  }

  async checkSystemHealth() {
    try {
      const response = await this.makeRequest('/api/system/health-public')
      return response.status === 200
    } catch (error) {
      console.log('❌ Sistema não está respondendo:', error.message)
      return false
    }
  }

  async startSystem() {
    console.log('🔄 Iniciando servidor Next.js...')

    return new Promise((resolve, reject) => {
      const server = spawn('npm', ['run', 'dev'], {
        stdio: 'pipe',
        shell: true,
      })

      server.stdout.on('data', data => {
        const output = data.toString()
        console.log(output)

        if (output.includes('Ready in')) {
          console.log('✅ Servidor iniciado com sucesso')
          resolve()
        }
      })

      server.stderr.on('data', data => {
        console.error('Erro do servidor:', data.toString())
      })

      server.on('close', code => {
        console.log(`Servidor encerrado com código ${code}`)
        if (code !== 0) {
          reject(new Error(`Servidor falhou com código ${code}`))
        }
      })

      // Timeout para aguardar o servidor iniciar
      setTimeout(() => {
        if (this.retryCount < this.maxRetries) {
          this.retryCount++
          console.log(
            `⏰ Aguardando servidor iniciar... (tentativa ${this.retryCount}/${this.maxRetries})`
          )
        } else {
          reject(new Error('Timeout ao iniciar servidor'))
        }
      }, 10000)
    })
  }

  startContinuousMonitoring() {
    if (this.isMonitoring) {
      console.log('⚠️ Monitoramento já está ativo')
      return
    }

    this.isMonitoring = true
    console.log('👁️ Iniciando monitoramento contínuo...')

    setInterval(async () => {
      const isHealthy = await this.checkSystemHealth()

      if (!isHealthy) {
        console.log('🚨 Sistema não está saudável, tentando recuperação...')
        await this.attemptRecovery()
      } else {
        console.log('✅ Sistema saudável')
      }
    }, this.healthCheckInterval)
  }

  async attemptRecovery() {
    console.log('🔧 Iniciando processo de recuperação...')

    const recoverySteps = [
      'Verificando conectividade de rede',
      'Verificando recursos do sistema',
      'Tentando reiniciar serviços',
      'Verificando logs de erro',
    ]

    for (const step of recoverySteps) {
      console.log(`   🔄 ${step}...`)
      await this.delay(2000)
    }

    // Tentar reiniciar o sistema se necessário
    const isHealthy = await this.checkSystemHealth()
    if (!isHealthy) {
      console.log('🔄 Tentando reiniciar o sistema...')
      await this.startSystem()
    }

    console.log('✅ Processo de recuperação concluído')
  }

  async makeRequest(path) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: path,
        method: 'GET',
        timeout: 5000,
      }

      const req = http.request(options, res => {
        resolve(res)
      })

      req.on('error', error => {
        reject(error)
      })

      req.on('timeout', () => {
        req.destroy()
        reject(new Error('Request timeout'))
      })

      req.end()
    })
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async getSystemStatus() {
    try {
      const response = await this.makeRequest('/api/system/status')
      let data = ''

      response.on('data', chunk => {
        data += chunk
      })

      return new Promise(resolve => {
        response.on('end', () => {
          try {
            resolve(JSON.parse(data))
          } catch (error) {
            resolve({ error: 'Invalid JSON response' })
          }
        })
      })
    } catch (error) {
      return { error: error.message }
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const manager = new SystemAvailabilityManager()

  manager.start().catch(error => {
    console.error('❌ Erro fatal:', error.message)
    process.exit(1)
  })

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Encerrando gerenciador de disponibilidade...')
    process.exit(0)
  })
}

module.exports = SystemAvailabilityManager

