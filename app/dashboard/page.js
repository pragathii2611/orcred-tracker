'use client'

import { useState, useEffect } from 'react'

const ORANGE = '#eb4511'
const CREAM = '#faf7f2'
const BORDER = '#f0ece5'

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{
      background: '#fff',
      border: `1px solid ${BORDER}`,
      borderRadius: '10px',
      padding: '20px 24px',
      minWidth: '140px',
      flex: 1
    }}>
      <div style={{
        fontSize: '30px',
        fontWeight: 'bold',
        color: color || '#1a1a1a',
        lineHeight: 1
      }}>
        {value}
      </div>
      <div style={{
        fontSize: '13px',
        color: '#888',
        marginTop: '6px'
      }}>
        {label}
      </div>
      {sub && (
        <div style={{
          fontSize: '12px',
          color: color || '#aaa',
          marginTop: '4px'
        }}>
          {sub}
        </div>
      )}
    </div>
  )
}

function Badge({ text, color, bg }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 'bold',
      color: color,
      background: bg
    }}>
      {text}
    </span>
  )
}

function formatTime(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const fetchData = () => {
    setLoading(true)
    fetch('/api/track/stats')
      .then(r => r.json())
      .then(d => {
        if (d.error) {
          setError(d.error)
        } else {
          setData(d)
          setLastRefresh(new Date())
        }
        setLoading(false)
      })
      .catch(e => {
        setError(e.message)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [])

  const filtered = data?.students?.filter(s => {
    const matchSearch =
      s.student_id.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())

    if (!matchSearch) return false
    if (filter === 'clicked') return s.clicked
    if (filter === 'opened') return s.opened_real
    if (filter === 'apple') return s.opened_apple && !s.opened_real
    if (filter === 'nothing') return !s.opened_real && !s.clicked
    return true
  }) || []

  return (
    <div style={{
      minHeight: '100vh',
      background: CREAM,
      fontFamily: 'Arial, sans-serif'
    }}>

      {/* Header */}
      <div style={{
        background: '#fff',
        borderBottom: `1px solid ${BORDER}`,
        padding: '16px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            color: ORANGE,
            fontWeight: 'bold',
            fontSize: '18px',
            letterSpacing: '2px'
          }}>
            ORCRED
          </span>
          <span style={{ color: '#ccc', fontSize: '14px' }}>
            Email Tracker
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '12px', color: '#aaa' }}>
            Last updated: {lastRefresh.toLocaleTimeString('en-IN')}
          </span>
          <button
            onClick={fetchData}
            style={{
              background: ORANGE,
              color: '#fff',
              border: 'none',
              borderRadius: '20px',
              padding: '8px 20px',
              fontSize: '13px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Refresh
          </button>
        </div>
      </div>

      <div style={{ padding: '32px 40px' }}>

        {loading && !data && (
          <div style={{ color: '#888', fontSize: '15px' }}>Loading...</div>
        )}

        {error && (
          <div style={{
            background: '#fff0ee',
            border: '1px solid #ffd0c8',
            borderRadius: '8px',
            padding: '16px 20px',
            color: '#c0392b',
            fontSize: '14px'
          }}>
            Error: {error}
          </div>
        )}

        {data && (
          <>
            {/* Summary cards */}
            <div style={{
              display: 'flex',
              gap: '16px',
              marginBottom: '32px',
              flexWrap: 'wrap'
            }}>
              <StatCard label="Emails Sent" value={data.summary.total_sent} />
              <StatCard
                label="Real Opens"
                value={data.summary.real_opens}
                sub={data.summary.real_open_rate}
                color="#22c55e"
              />
              <StatCard
                label="Apple Prefetch"
                value={data.summary.apple_prefetch}
                sub="Not real opens"
                color="#f59e0b"
              />
              <StatCard
                label="Clicked Waitlist"
                value={data.summary.total_clicks}
                sub={data.summary.click_rate}
                color={ORANGE}
              />
            </div>

            {/* Apple note */}
            <div style={{
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: '8px',
              padding: '12px 16px',
              fontSize: '13px',
              color: '#92400e',
              marginBottom: '24px'
            }}>
              Apple Mail prefetches all images automatically —
              Apple opens are unreliable.
              <strong> Click tracking is always accurate</strong> for
              all users including Apple.
            </div>

            {/* Filters */}
            <div style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '20px',
              flexWrap: 'wrap',
              alignItems: 'center'
            }}>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  border: `1px solid ${BORDER}`,
                  borderRadius: '20px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  outline: 'none',
                  width: '220px'
                }}
              />
              {[
                { key: 'all', label: 'All' },
                { key: 'clicked', label: 'Clicked' },
                { key: 'opened', label: 'Real Opens' },
                { key: 'apple', label: 'Apple Only' },
                { key: 'nothing', label: 'No Activity' }
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: `1px solid ${filter === f.key ? ORANGE : BORDER}`,
                    background: filter === f.key ? ORANGE : '#fff',
                    color: filter === f.key ? '#fff' : '#666',
                    fontSize: '13px',
                    cursor: 'pointer',
                    fontWeight: filter === f.key ? 'bold' : 'normal'
                  }}
                >
                  {f.label}
                </button>
              ))}
              <span style={{ fontSize: '13px', color: '#aaa' }}>
                {filtered.length} students
              </span>
            </div>

            {/* Table */}
            <div style={{
              background: '#fff',
              borderRadius: '10px',
              border: `1px solid ${BORDER}`,
              overflow: 'hidden'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '14px'
              }}>
                <thead>
                  <tr style={{ background: CREAM }}>
                    {[
                      'Student', 'Email',
                      'Real Open', 'Apple Prefetch',
                      'Clicked Waitlist', 'Open Time', 'Click Time'
                    ].map(h => (
                      <th key={h} style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontSize: '12px',
                        color: '#888',
                        fontWeight: 'normal',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                        borderBottom: `1px solid ${BORDER}`
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{
                        padding: '32px',
                        textAlign: 'center',
                        color: '#aaa',
                        fontSize: '14px'
                      }}>
                        No students match this filter
                      </td>
                    </tr>
                  ) : (
                    filtered.map((s, i) => (
                      <tr
                        key={s.student_id}
                        style={{
                          borderBottom: `1px solid ${BORDER}`,
                          background: i % 2 === 0 ? '#fff' : '#fdfcfb'
                        }}
                      >
                        <td style={{
                          padding: '12px 16px',
                          color: '#1a1a1a',
                          fontWeight: '500'
                        }}>
                          {s.student_id}
                        </td>
                        <td style={{
                          padding: '12px 16px',
                          color: '#666',
                          fontSize: '13px'
                        }}>
                          {s.email || '—'}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {s.opened_real
                            ? <Badge text="Yes" color="#166534" bg="#dcfce7" />
                            : <Badge text="No" color="#aaa" bg="#f5f5f5" />
                          }
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {s.opened_apple
                            ? <Badge text="Prefetched" color="#92400e" bg="#fef3c7" />
                            : <Badge text="No" color="#aaa" bg="#f5f5f5" />
                          }
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {s.clicked
                            ? <Badge text="Clicked" color="#fff" bg={ORANGE} />
                            : <Badge text="No" color="#aaa" bg="#f5f5f5" />
                          }
                        </td>
                        <td style={{
                          padding: '12px 16px',
                          color: '#888',
                          fontSize: '12px'
                        }}>
                          {formatTime(s.open_time)}
                        </td>
                        <td style={{
                          padding: '12px 16px',
                          color: s.click_time ? ORANGE : '#888',
                          fontSize: '12px',
                          fontWeight: s.click_time ? 'bold' : 'normal'
                        }}>
                          {formatTime(s.click_time)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}