import { requireAuth } from '../../../utils/auth'
import { query } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    // Both admin and editor can create articles
    await requireAuth(event, ['admin', 'editor'])

    const body = await readBody(event)
    const { title, summary, content, image_url, read_time, category } = body

    if (!title || !summary || !content || !image_url || !read_time || !category) {
      throw createError({
        statusCode: 400,
        statusMessage: 'All fields (title, summary, content, image_url, read_time, category) are required'
      })
    }

    await query(
      'INSERT INTO articles (title, summary, content, image_url, read_time, category) VALUES (?, ?, ?, ?, ?, ?)',
      [title, summary, content, image_url, read_time, category]
    )

    return {
      success: true,
      message: 'Article created successfully'
    }
  } catch (error: any) {
    event.node.res.statusCode = error.statusCode || 500
    return {
      success: false,
      error: error.statusMessage || error.message || 'Failed to create article'
    }
  }
})
