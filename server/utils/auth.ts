import { H3Event } from 'h3'
import crypto from 'crypto'
import { query } from './db'

export function hashPassword(password: string): string {
  const salt = 'cengkerik_salt_2026'
  return crypto.createHmac('sha256', salt).update(password).digest('hex')
}

export async function requireAuth(event: H3Event, allowedRoles?: string[]) {
  const cookies = parseCookies(event)
  const token = cookies.session_token

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized: No session token provided'
    })
  }

  // Get user from session
  const sql = `
    SELECT u.id, u.username, u.role 
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ?
  `
  const users = await query(sql, [token]) as any[]

  if (!users || users.length === 0) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized: Invalid or expired session token'
    })
  }

  const user = users[0]

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: Insufficient permissions'
    })
  }

  return user
}
