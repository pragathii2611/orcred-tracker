import { supabase } from '../../../../lib/supabase'

const WAITLIST_URL = 'https://www.orcred.com/join-waitlist'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('id') || 'unknown'
    const email = searchParams.get('email') || ''
    const userAgent = request.headers.get('user-agent') || ''

    await supabase.from('email_events').insert({
      student_id: studentId,
      email: decodeURIComponent(email),
      event: 'click',
      is_bot: false,
      user_agent: userAgent.slice(0, 300)
    })
  } catch (err) {
    console.error('Click tracking error:', err)
  }

  return Response.redirect(WAITLIST_URL, 302)
}