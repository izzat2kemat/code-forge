import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)
    return {
      success: true,
      user
    }
  } catch (error: any) {
    event.node.res.statusCode = error.statusCode || 401
    return {
      success: false,
      error: error.statusMessage || error.message || 'Unauthorized'
    }
  }
})
