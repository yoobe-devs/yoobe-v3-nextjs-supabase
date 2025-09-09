import fs from 'node:fs'
import path from 'node:path'
import { Client } from 'pg'

async function main() {
  const file = process.argv[2]
  if (!file) {
    console.error('Usage: ts-node scripts/db/execute_sql.ts <file.sql>')
    process.exit(1)
  }
  const sqlPath = path.resolve(file)
  if (!fs.existsSync(sqlPath)) {
    console.error(`File not found: ${sqlPath}`)
    process.exit(1)
  }
  const connectionString =
    process.env.SUPABASE_DB_URL ||
    'postgresql://postgres:postgres@127.0.0.1:54322/postgres'
  const client = new Client({ connectionString })
  await client.connect()
  const sql = fs.readFileSync(sqlPath, 'utf8')
  try {
    await client.query('BEGIN')
    await client.query(sql)
    await client.query('COMMIT')
    console.log(`Executed SQL from ${sqlPath}`)
  } catch (e) {
    await client.query('ROLLBACK')
    console.error('Execution failed:', e)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})






