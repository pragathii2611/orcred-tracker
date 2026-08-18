import { supabase } from '../../../../lib/supabase'

const PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64'
)

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('id') || 'unknown'
    const email = searchParams.get('email') || ''
    const userAgent = request.headers.get('user-agent') || ''

    const isAppleMPP =
      (userAgent.includes('Apple') || userAgent.includes('AppleWebKit')) &&
      !userAgent.includes('Chrome') &&
      !userAgent.includes('Firefox') &&
      !userAgent.includes('Thunderbird')

    await supabase.from('email_events').insert({
      student_id: studentId,
      email: decodeURIComponent(email),
      event: 'open',
      is_bot: isAppleMPP,
      user_agent: userAgent.slice(0, 300)
    })

    return new Response(PIXEL, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (err) {
    return new Response(PIXEL, {
      status: 200,
      headers: { 'Content-Type': 'image/png' }
    })
  }
}