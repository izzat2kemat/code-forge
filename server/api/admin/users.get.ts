import { requireAuth } from '../../utils/auth'
import { query } from '../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    // Protect: require user to be authenticated
    await requireAuth(event)
    
    const users = await query('SELECT id, username, role, created_at FROM users ORDER BY id DESC')
    return {
      success: true,
      data: users
    }
  } catch (error: any) {
    event.node.res.statusCode = error.statusCode || 500
    return {
      success: false,
      error: error.statusMessage || error.message || 'Failed to list users'
    }
  }
})
