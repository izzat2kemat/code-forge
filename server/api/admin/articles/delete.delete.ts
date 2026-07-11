import { requireAuth } from '../../../utils/auth'
import { query } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    // Only admin can delete articles
    await requireAuth(event, ['admin'])

    const body = await readBody(event)
    const { id } = body

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Article ID is required'
      })
    }

    await query('DELETE FROM articles WHERE id = ?', [id])

    return {
      success: true,
      message: 'Article deleted successfully'
    }
  } catch (error: any) {
    event.node.res.statusCode = error.statusCode || 500
    return {
      success: false,
      error: error.statusMessage || error.message || 'Failed to delete article'
    }
  }
})
