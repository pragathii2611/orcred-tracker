import { supabase } from '../../../../lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('email_events')
      .select('student_id, email, event, is_bot, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    const students = {}

    for (const row of data) {
      if (!students[row.student_id]) {
        students[row.student_id] = {
          student_id: row.student_id,
          email: row.email || '',
          opened_real: false,
          opened_apple: false,
          clicked: false,
          open_time: null,
          click_time: null
        }
      }

      const s = students[row.student_id]

      if (row.event === 'open') {
  if (row.is_bot) {
    s.opened_apple = true  // covers all bots now — apple + too fast
  } else {
    if (!s.opened_real) {
      s.opened_real = true
      s.open_time = row.created_at
    }
  }
}

      if (row.event === 'click') {
        if (!s.clicked) {
          s.clicked = true
          s.click_time = row.created_at
        }
      }
    }

    const list = Object.values(students)

    const totalSent = list.length
    const realOpens = list.filter(s => s.opened_real).length
    const appleOpens = list.filter(s => s.opened_apple && !s.opened_real).length
    const clicks = list.filter(s => s.clicked).length

    const summary = {
      total_sent: totalSent,
      real_opens: realOpens,
      apple_prefetch: appleOpens,
      total_clicks: clicks,
      real_open_rate: totalSent > 0
        ? Math.round(realOpens / totalSent * 100) + '%'
        : '0%',
      click_rate: totalSent > 0
        ? Math.round(clicks / totalSent * 100) + '%'
        : '0%'
    }

    list.sort((a, b) => {
      if (a.clicked && !b.clicked) return -1
      if (!a.clicked && b.clicked) return 1
      if (a.opened_real && !b.opened_real) return -1
      if (!a.opened_real && b.opened_real) return 1
      return 0
    })

    return Response.json({ summary, students: list })

  } catch (err) {
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}