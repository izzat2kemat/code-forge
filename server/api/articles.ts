import { query } from '../utils/db'

export default defineEventHandler(async () => {
  try {
    const articles = await query('SELECT * FROM articles ORDER BY id DESC')
    return {
      success: true,
      data: articles
    }
  } catch (error: any) {
    console.error('[API Articles Error]:', error)
    return {
      success: false,
      error: error.message || 'Database error occurred'
    }
  }
})
