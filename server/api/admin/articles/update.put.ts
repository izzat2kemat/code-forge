import { requireAuth } from '../../../utils/auth'
import { query } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    // Both admin and editor can update articles
    await requireAuth(event, ['admin', 'editor'])

    const body = await readBody(event)
    const { id, title, summary, content, image_url, read_time, category } = body

    if (!id || !title || !summary || !content || !image_url || !read_time || !category) {
      throw createError({
        statusCode: 400,
        statusMessage: 'All fields (id, title, summary, content, image_url, read_time, category) are required'
      })
    }

    await query(
      'UPDATE articles SET title = ?, summary = ?, content = ?, image_url = ?, read_time = ?, category = ? WHERE id = ?',
      [title, summary, content, image_url, read_time, category, id]
    )

    return {
      success: true,
      message: 'Article updated successfully'
    }
  } catch (error: any) {
    event.node.res.statusCode = error.statusCode || 500
    return {
      success: false,
      error: error.statusMessage || error.message || 'Failed to update article'
    }
  }
})
