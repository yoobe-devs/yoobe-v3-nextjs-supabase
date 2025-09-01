import { NextRequest, NextResponse } from 'next/server'
import { documentationUpdater } from '@/lib/documentation-updater'

export async function GET() {
  try {
    // Retornar status da documentação
    const status = {
      version: '2.0.0',
      lastUpdated: new Date().toISOString(),
      autoUpdate: true,
      totalFiles: 8,
      availableDocs: [
        'PLATFORM_OVERVIEW',
        'CUBBO_INTEGRATION', 
        'API_REFERENCE',
        'DATABASE_SCHEMA',
        'DEPLOYMENT_GUIDE',
        'GAMIFICATION_INTEGRATION',
        'AUTOMATION_INTEGRATION',
        'ERP_CRM_INTEGRATION'
      ]
    }

    return NextResponse.json({
      success: true,
      data: status
    })
  } catch (error) {
    console.error('Error fetching documentation status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch documentation status' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, version, changes } = body

    switch (action) {
      case 'update_api_docs':
        await documentationUpdater.updateApiDocumentation()
        return NextResponse.json({
          success: true,
          message: 'API documentation updated successfully'
        })

      case 'update_version':
        if (!version || !changes) {
          return NextResponse.json(
            { success: false, error: 'Version and changes are required' },
            { status: 400 }
          )
        }
        
        await documentationUpdater.updateVersion(version, changes)
        return NextResponse.json({
          success: true,
          message: `Platform updated to version ${version}`
        })

      case 'auto_update':
        await documentationUpdater.autoUpdate()
        return NextResponse.json({
          success: true,
          message: 'Auto-update completed'
        })

      case 'update_changelog':
        if (!version || !changes) {
          return NextResponse.json(
            { success: false, error: 'Version and changes are required' },
            { status: 400 }
          )
        }
        
        await documentationUpdater.updateChangelog(version, changes)
        return NextResponse.json({
          success: true,
          message: 'Changelog updated successfully'
        })

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error updating documentation:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update documentation' },
      { status: 500 }
    )
  }
}
