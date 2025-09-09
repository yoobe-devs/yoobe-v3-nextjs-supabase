import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function getEnv(name: string, fallback?: string): string {
  const v = process.env[name] || fallback
  if (!v) {
    console.error(`Missing env ${name}`)
    process.exit(1)
  }
  return v
}

function main() {
  const timestamp = new Date()
    .toISOString()
    .replace(/[:T]/g, '-')
    .replace(/\..+/, '')
  const artifactsDir = path.join(process.cwd(), '.artifacts')
  ensureDir(artifactsDir)
  const outfile = path.join(artifactsDir, `db-${timestamp}.sql`)

  const pgHost = getEnv('PGHOST', '127.0.0.1')
  const pgPort = getEnv('PGPORT', '54322') // supabase default local
  const pgDatabase = getEnv('PGDATABASE', 'postgres')
  const pgUser = getEnv('PGUSER', 'postgres')
  const pgPassword = getEnv('PGPASSWORD', 'postgres')

  process.env.PGPASSWORD = pgPassword

  const pgDumpCmd = `pg_dump --no-owner --no-acl -h ${pgHost} -p ${pgPort} -U ${pgUser} -d ${pgDatabase} -f ${outfile}`
  try {
    execSync('command -v pg_dump', { stdio: 'ignore' })
    console.log(`Running: ${pgDumpCmd}`)
    execSync(pgDumpCmd, { stdio: 'inherit' })
    console.log(`Database dump saved to ${outfile}`)
    return
  } catch (err) {
    console.warn('pg_dump not available, trying supabase CLI fallback...')
  }

  const dbUrl = `postgres://${encodeURIComponent(pgUser)}:${encodeURIComponent(
    pgPassword
  )}@${pgHost}:${pgPort}/${pgDatabase}`
  const supabaseCmd = `supabase db dump -f ${outfile} --db-url "${dbUrl}"`
  try {
    execSync('command -v supabase', { stdio: 'ignore' })
    console.log(`Running: ${supabaseCmd}`)
    execSync(supabaseCmd, { stdio: 'inherit' })
    console.log(`Database dump saved to ${outfile}`)
    return
  } catch (err) {
    console.error(
      'Neither pg_dump nor supabase CLI available. Install libpq (pg_dump) or supabase CLI.'
    )
    process.exit(1)
  }
}

main()
