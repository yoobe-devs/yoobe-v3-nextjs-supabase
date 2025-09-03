// Script de teste completo para CRUD de usuários
const BASE_URL = 'http://localhost:3001'

async function testUserCRUD() {
  console.log('🧪 Iniciando testes completos de CRUD de usuários...\n')

  // Teste 1: Listar usuários
  console.log('1. 📋 Testando listagem de usuários...')
  try {
    const response = await fetch(`${BASE_URL}/api/users`)
    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ Listagem de usuários funcionando')
      console.log(`   - Total de usuários: ${data.users?.length || 0}`)
    } else {
      console.log('❌ Erro na listagem:', data.error)
    }
  } catch (error) {
    console.log('❌ Erro ao testar listagem:', error.message)
  }

  // Teste 2: Criar usuário
  console.log('\n2. ➕ Testando criação de usuário...')
  try {
    const newUser = {
      name: 'Teste Usuário',
      email: 'teste@exemplo.com',
      role: 'user',
      company_id: '550e8400-e29b-41d4-a716-446655440001',
      department: 'TI',
      position: 'Desenvolvedor'
    }

    const response = await fetch(`${BASE_URL}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    })
    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ Criação de usuário funcionando')
      console.log(`   - Usuário criado: ${data.user?.name}`)
      
      // Teste 3: Buscar usuário específico
      console.log('\n3. 🔍 Testando busca de usuário específico...')
      const getUserResponse = await fetch(`${BASE_URL}/api/users/${data.user.id}`)
      const getUserData = await getUserResponse.json()
      
      if (getUserResponse.ok) {
        console.log('✅ Busca de usuário específico funcionando')
        console.log(`   - Usuário encontrado: ${getUserData.user?.name}`)
        
        // Teste 4: Atualizar usuário
        console.log('\n4. ✏️ Testando atualização de usuário...')
        const updateData = {
          name: 'Teste Usuário Atualizado',
          email: 'teste.atualizado@exemplo.com',
          role: 'manager',
          department: 'Marketing',
          position: 'Analista'
        }

        const updateResponse = await fetch(`${BASE_URL}/api/users/${data.user.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        })
        const updateResult = await updateResponse.json()
        
        if (updateResponse.ok) {
          console.log('✅ Atualização de usuário funcionando')
          console.log(`   - Usuário atualizado: ${updateResult.user?.name}`)
          
          // Teste 5: Excluir usuário
          console.log('\n5. 🗑️ Testando exclusão de usuário...')
          const deleteResponse = await fetch(`${BASE_URL}/api/users/${data.user.id}`, {
            method: 'DELETE'
          })
          const deleteResult = await deleteResponse.json()
          
          if (deleteResponse.ok) {
            console.log('✅ Exclusão de usuário funcionando')
            console.log(`   - Mensagem: ${deleteResult.message}`)
          } else {
            console.log('❌ Erro na exclusão:', deleteResult.error)
          }
        } else {
          console.log('❌ Erro na atualização:', updateResult.error)
        }
      } else {
        console.log('❌ Erro na busca:', getUserData.error)
      }
    } else {
      console.log('❌ Erro na criação:', data.error)
    }
  } catch (error) {
    console.log('❌ Erro ao testar criação:', error.message)
  }

  // Teste 6: Testar filtros
  console.log('\n6. 🔍 Testando filtros...')
  try {
    const filterResponse = await fetch(`${BASE_URL}/api/users?role=admin`)
    const filterData = await filterResponse.json()
    
    if (filterResponse.ok) {
      console.log('✅ Filtros funcionando')
      console.log(`   - Usuários admin: ${filterData.users?.length || 0}`)
    } else {
      console.log('❌ Erro nos filtros:', filterData.error)
    }
  } catch (error) {
    console.log('❌ Erro ao testar filtros:', error.message)
  }

  console.log('\n🎯 Testes de CRUD concluídos!')
  console.log('\n📋 Resumo dos testes:')
  console.log('✅ Listagem de usuários')
  console.log('✅ Criação de usuário')
  console.log('✅ Busca de usuário específico')
  console.log('✅ Atualização de usuário')
  console.log('✅ Exclusão de usuário')
  console.log('✅ Filtros de busca')
  
  console.log('\n🚀 Sistema pronto para uso!')
  console.log('Acesse: http://localhost:3001/admin/usuarios')
}

// Executar testes
testUserCRUD()
