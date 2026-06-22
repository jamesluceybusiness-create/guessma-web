'use client'

import { useEffect, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'

const CATEGORIES_ALL = ['core_sports', 'core_food', 'core_groups', 'core_wabws', 'core_actitout', 'icebreaker_country_outlines']
const DIFF_LABEL = ['Easy', 'Medium', 'Hard', 'Expert']

interface PerformanceRow {
  prompt_id: string
  category_id: string
  shown_count: number
  correct_count: number
  skipped_count: number
  avg_time_seconds: number
  correct_rate: number
  payload?: { text: string }
}

interface SuggestionRow {
  id: string
  prompt_id: string
  current_difficulty: number
  suggested_difficulty: number
  correct_rate: number
  sample_size: number
  reviewed: boolean
  applied: boolean
}

interface EligibleCoverage {
  category_id: string
  eligible: number
  total: number
}

interface Props {
  supabase: SupabaseClient
  showToast: (msg: string, ok?: boolean) => void
}

const CARD: React.CSSProperties = { background: '#0d2d3d', border: '1px solid #1a4a5a', borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem' }
const TH: React.CSSProperties = { fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', color: '#29afd4', textTransform: 'uppercase', padding: '0.45rem 0.6rem', textAlign: 'left', whiteSpace: 'nowrap' }
const TD: React.CSSProperties = { padding: '0.4rem 0.6rem', fontSize: '0.78rem', color: '#c8d8c8', borderTop: '1px solid #1a4a5a' }
const SECTION_TITLE: React.CSSProperties = { fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', color: '#29afd4', textTransform: 'uppercase', marginBottom: '1rem' }

function rateColor(rate: number) {
  if (rate >= 0.7) return '#16a34a'
  if (rate >= 0.5) return '#facc15'
  return '#ef4444'
}

export default function AnalyticsTab({ supabase, showToast }: Props) {
  const [loading, setLoading] = useState(true)
  const [totalAccounts, setTotalAccounts] = useState(0)
  const [totalSessions, setTotalSessions] = useState(0)
  const [weeklySessions, setWeeklySessions] = useState(0)
  const [totalUsed, setTotalUsed] = useState(0)
  const [suggestions, setSuggestions] = useState<SuggestionRow[]>([])
  const [performance, setPerformance] = useState<PerformanceRow[]>([])
  const [coverage, setCoverage] = useState<EligibleCoverage[]>([])
  const [perfCatFilter, setPerfCatFilter] = useState('all')

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const [
      { count: acctCount },
      { count: sessCount },
      { count: weekCount },
      { count: usedCount },
      { data: suggData },
      { data: perfData },
    ] = await Promise.all([
      supabase.from('accounts').select('*', { count: 'exact', head: true }),
      supabase.from('daily_sessions').select('*', { count: 'exact', head: true }),
      supabase.from('daily_sessions').select('*', { count: 'exact', head: true }).gte('completed_at', weekAgo),
      supabase.from('daily_used_prompts').select('*', { count: 'exact', head: true }),
      supabase.from('difficulty_suggestions').select('*').eq('reviewed', false).order('sample_size', { ascending: false }),
      supabase.from('prompt_performance').select('*, prompts(payload)').order('correct_rate', { ascending: true }),
    ])

    setTotalAccounts(acctCount ?? 0)
    setTotalSessions(sessCount ?? 0)
    setWeeklySessions(weekCount ?? 0)
    setTotalUsed(usedCount ?? 0)
    setSuggestions(suggData ?? [])
    setPerformance((perfData ?? []).map((r: PerformanceRow & { prompts?: { payload: { text: string } } }) => ({
      ...r,
      payload: r.prompts?.payload,
    })))

    // Coverage: fetch per-category counts
    const coverageRows = await Promise.all(CATEGORIES_ALL.map(async (cat) => {
      const [{ count: elig }, { count: total }] = await Promise.all([
        supabase.from('prompts').select('*', { count: 'exact', head: true }).eq('category_id', cat).eq('is_daily_eligible', true).eq('is_hidden', false),
        supabase.from('prompts').select('*', { count: 'exact', head: true }).eq('category_id', cat),
      ])
      return { category_id: cat, eligible: elig ?? 0, total: total ?? 0 }
    }))
    setCoverage(coverageRows)
    setLoading(false)
  }

  async function applySuggestion(s: SuggestionRow) {
    const [r1, r2] = await Promise.all([
      supabase.from('prompts').update({ difficulty: s.suggested_difficulty }).eq('prompt_id', s.prompt_id),
      supabase.from('difficulty_suggestions').update({ reviewed: true, applied: true }).eq('id', s.id),
    ])
    if (r1.error || r2.error) { showToast('Update failed', false); return }
    showToast(`Applied difficulty change for ${s.prompt_id}`)
    setSuggestions(prev => prev.filter(x => x.id !== s.id))
  }

  async function dismissSuggestion(s: SuggestionRow) {
    const { error } = await supabase.from('difficulty_suggestions').update({ reviewed: true, applied: false }).eq('id', s.id)
    if (error) { showToast('Dismiss failed', false); return }
    setSuggestions(prev => prev.filter(x => x.id !== s.id))
  }

  const filteredPerf = perfCatFilter === 'all' ? performance : performance.filter(p => p.category_id === perfCatFilter)

  const STAT_CARD: React.CSSProperties = { background: '#0d2d3d', border: '1px solid #1a4a5a', borderRadius: 12, padding: '1.25rem 1.5rem', flex: 1, minWidth: 0 }

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>Loading analytics…</div>
  )

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '2rem' }}>
      {/* Stat cards */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Total Players', value: totalAccounts },
          { label: 'Daily Sessions (all time)', value: totalSessions },
          { label: 'Sessions This Week', value: weeklySessions },
          { label: 'Prompts Used', value: totalUsed },
        ].map(({ label, value }) => (
          <div key={label} style={STAT_CARD}>
            <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.4rem' }}>{label}</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{value.toLocaleString()}</div>
          </div>
        ))}
      </div>

      {/* Difficulty suggestions */}
      <div style={CARD}>
        <div style={SECTION_TITLE}>Difficulty Suggestions</div>
        {suggestions.length === 0 ? (
          <div style={{ color: '#64748b', fontSize: '0.85rem' }}>No flagged prompts — looking good</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Prompt ID', 'Current Diff', 'Suggested Diff', 'Correct Rate', 'Sample Size', 'Actions'].map(h => (
                  <th key={h} style={TH}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {suggestions.map(s => (
                <tr key={s.id}>
                  <td style={{ ...TD, fontFamily: 'monospace', fontSize: '0.72rem', color: '#64748b' }}>{s.prompt_id}</td>
                  <td style={TD}>{DIFF_LABEL[s.current_difficulty]}</td>
                  <td style={{ ...TD, color: '#29afd4', fontWeight: 700 }}>{DIFF_LABEL[s.suggested_difficulty]}</td>
                  <td style={{ ...TD, color: rateColor(s.correct_rate) }}>{(s.correct_rate * 100).toFixed(1)}%</td>
                  <td style={TD}>{s.sample_size}</td>
                  <td style={TD}>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button onClick={() => applySuggestion(s)} style={{ background: '#14532d', border: '1px solid #29afd4', borderRadius: 6, padding: '0.2rem 0.6rem', color: '#29afd4', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', fontSize: '0.72rem', fontWeight: 700 }}>Apply</button>
                      <button onClick={() => dismissSuggestion(s)} style={{ background: 'none', border: '1px solid #1a4a5a', borderRadius: 6, padding: '0.2rem 0.6rem', color: '#94a3b8', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', fontSize: '0.72rem' }}>Dismiss</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Prompt performance */}
      <div style={CARD}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div style={SECTION_TITLE}>Prompt Performance</div>
          <select
            value={perfCatFilter}
            onChange={e => setPerfCatFilter(e.target.value)}
            style={{ background: '#0d2d3d', border: '1px solid #1a4a5a', borderRadius: 6, padding: '0.25rem 0.5rem', color: '#c8d8c8', fontFamily: 'Poppins, sans-serif', fontSize: '0.78rem', cursor: 'pointer', marginBottom: '1rem' }}
          >
            <option value="all">All Categories</option>
            {CATEGORIES_ALL.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {filteredPerf.length === 0 ? (
          <div style={{ color: '#64748b', fontSize: '0.85rem' }}>No performance data yet — data populates as players complete rounds</div>
        ) : (
          <div style={{ overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
              <thead>
                <tr>
                  {['Prompt Text', 'Category', 'Shown', 'Correct', 'Skipped', 'Correct Rate', 'Avg Time'].map(h => (
                    <th key={h} style={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPerf.map(p => (
                  <tr key={p.prompt_id}>
                    <td style={{ ...TD, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>{p.payload?.text ?? p.prompt_id}</td>
                    <td style={{ ...TD, color: '#64748b', fontSize: '0.7rem' }}>{p.category_id}</td>
                    <td style={TD}>{p.shown_count ?? 0}</td>
                    <td style={TD}>{p.correct_count ?? 0}</td>
                    <td style={TD}>{p.skipped_count ?? 0}</td>
                    <td style={TD}>
                      <span style={{ color: rateColor(p.correct_rate ?? 0), fontWeight: 700 }}>
                        {p.shown_count ? ((p.correct_rate ?? 0) * 100).toFixed(1) + '%' : '—'}
                      </span>
                    </td>
                    <td style={TD}>{p.avg_time_seconds ? p.avg_time_seconds.toFixed(1) + 's' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Daily eligible coverage */}
      <div style={CARD}>
        <div style={SECTION_TITLE}>Daily Eligible Pool</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {coverage.map(c => {
            const pct = c.total > 0 ? Math.round((c.eligible / c.total) * 100) : 0
            const color = c.eligible >= 30 ? '#16a34a' : c.eligible >= 15 ? '#facc15' : '#ef4444'
            return (
              <div key={c.category_id} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.78rem', color: '#c8d8c8', minWidth: 260, fontFamily: 'monospace' }}>{c.category_id}</span>
                <div style={{ flex: 1, background: '#091e2a', borderRadius: 999, height: 6, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 999, transition: 'width 0.3s' }} />
                </div>
                <span style={{ fontSize: '0.78rem', color, fontWeight: 700, minWidth: 80 }}>
                  {c.eligible} / {c.total}
                </span>
              </div>
            )
          })}
        </div>
        <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.75rem', lineHeight: 1.5 }}>
          Minimum 30 eligible prompts per category recommended for 30-day rotation without repeats
        </p>
      </div>
    </div>
  )
}
