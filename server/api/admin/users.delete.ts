import { requireAuth } from '../../utils/auth'
import { query } from '../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const currentUser = await requireAuth(event, ['admin'])

    const body = await readBody(event)
    const { id } = body

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required'
      })
    }

    if (Number(id) === Number(currentUser.id)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'You cannot delete your own account'
      })
    }

    // Delete user
    await query('DELETE FROM users WHERE id = ?', [id])

    return {
      success: true,
      message: 'User deleted successfully'
    }
  } catch (error: any) {
    event.node.res.statusCode = error.statusCode || 500
    return {
      success: false,
      error: error.statusMessage || error.message || 'Failed to delete user'
    }
  }
})
