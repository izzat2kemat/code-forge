import { query } from '../../utils/db'
import { hashPassword } from '../../utils/auth'
import crypto from 'crypto'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { username, password } = body

    if (!username || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Username and password are required'
      })
    }

    const hashedPassword = hashPassword(password)

    // Check in DB
    const users = await query('SELECT * FROM users WHERE username = ? AND password_hash = ?', [username, hashedPassword]) as any[]

    if (!users || users.length === 0) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid username or password'
      })
    }

    const user = users[0]

    // Create session token
    const token = crypto.randomBytes(32).toString('hex')

    // Insert session into DB
    await query('INSERT INTO sessions (user_id, token) VALUES (?, ?)', [user.id, token])

    // Set cookie
    setCookie(event, 'session_token', token, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      sameSite: 'lax'
    })

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    }
  } catch (error: any) {
    event.node.res.statusCode = error.statusCode || 500
    return {
      success: false,
      error: error.statusMessage || error.message || 'Login failed'
    }
  }
})
