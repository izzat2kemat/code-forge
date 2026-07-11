import { query } from '../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const cookies = parseCookies(event)
    const token = cookies.session_token

    if (token) {
      // Delete session from DB
      await query('DELETE FROM sessions WHERE token = ?', [token])
    }

    // Clear cookie
    deleteCookie(event, 'session_token', {
      path: '/'
    })

    return {
      success: true,
      message: 'Logged out successfully'
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Logout failed'
    }
  }
})
