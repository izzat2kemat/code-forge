import { query } from '../utils/db'

export default defineEventHandler(async () => {
  try {
    const projects = await query('SELECT * FROM projects ORDER BY id DESC')
    return {
      success: true,
      data: projects
    }
  } catch (error: any) {
    console.error('[API Projects Error]:', error)
    return {
      success: false,
      error: error.message || 'Database error occurred'
    }
  }
})
