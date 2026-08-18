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
    const sentAt = parseInt(searchParams.get('sent') || '0')
    const userAgent = request.headers.get('user-agent') || ''
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || ''
    const now = Math.floor(Date.now() / 1000)

    // Bot detection — multiple signals
    const isAppleMPP =
      (userAgent.includes('Apple') || userAgent.includes('AppleWebKit')) &&
      !userAgent.includes('Chrome') &&
      !userAgent.includes('Firefox') &&
      !userAgent.includes('Thunderbird')

    // Too fast — opened within 10 seconds of send
    const tooFast = sentAt > 0 && (now - sentAt) < 10

    // Known bot user agents
    const botAgents = [
      'bot', 'crawler', 'spider', 'preview',
      'google', 'yahoo', 'bing', 'baidu',
      'scan', 'check', 'validator', 'proxy',
      'outlook', 'thunderbird link preview',
      'microsoft', 'barracuda', 'mimecast',
      'proofpoint', 'symantec', 'trend micro'
    ]
    const isBotAgent = botAgents.some(b =>
      userAgent.toLowerCase().includes(b)
    )

    // No user agent at all — definitely a bot
    const noAgent = !userAgent || userAgent.trim() === ''

    const isBot = isAppleMPP || tooFast || isBotAgent || noAgent

    await supabase.from('email_events').insert({
      student_id: studentId,
      email: decodeURIComponent(email),
      event: 'open',
      is_bot: isBot,
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