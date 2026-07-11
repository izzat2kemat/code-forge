import { requireAuth, hashPassword } from '../../utils/auth'
import { query } from '../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    // Only admins can create users
    await requireAuth(event, ['admin'])

    const body = await readBody(event)
    const { username, password, role } = body

    if (!username || !password || !role) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Username, password and role are required'
      })
    }

    if (role !== 'admin' && role !== 'editor') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid role. Must be either admin or editor'
      })
    }

    // Check if user already exists
    const existing = await query('SELECT id FROM users WHERE username = ?', [username]) as any[]
    if (existing && existing.length > 0) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Username already exists'
      })
    }

    const hashedPassword = hashPassword(password)

    await query('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)', [
      username,
      hashedPassword,
      role
    ])

    return {
      success: true,
      message: 'User created successfully'
    }
  } catch (error: any) {
    event.node.res.statusCode = error.statusCode || 500
    return {
      success: false,
      error: error.statusMessage || error.message || 'Failed to create user'
    }
  }
})
