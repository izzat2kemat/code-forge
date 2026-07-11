import mysql from 'mysql2/promise'

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cengkerik',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}

// Pool for general queries (with DB name)
let pool: mysql.Pool | null = null

export function getPool() {
  if (!pool) {
    pool = mysql.createPool(dbConfig)
  }
  return pool
}

// Helper to execute queries on the default pool
export async function query(sql: string, params?: any[]) {
  const connectionPool = getPool()
  const [rows] = await connectionPool.execute(sql, params)
  return rows
}

// Helper for initial connection setup (without specifying a database)
export async function getSetupConnection() {
  const { database, ...setupConfig } = dbConfig
  return await mysql.createConnection(setupConfig)
}
