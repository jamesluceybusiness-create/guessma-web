'use client'

import React, { useEffect, useState, useCallback } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'

const CATEGORIES_ALL = ['core_sports', 'core_food', 'core_groups', 'core_wabws', 'core_actitout', 'icebreaker_country_outlines']
const CATEGORY_LABELS: Record<string, string> = {
  core_sports:                  'Sports',
  core_food:                    'Food',
  core_groups:                  'Groups',
  core_wabws:                   'What A Blank Would Say',
  core_actitout:                'Act It Out',
  icebreaker_country_outlines:  'Country Outlines',
}
const DIFFICULTIES = [0, 1, 2, 3]
const DIFF_LABEL = ['Easy', 'Medium', 'Hard', 'Expert']
const DIFF_COLOR = ['#16a34a', '#facc15', '#f97316', '#ef4444']
const PAGE_SIZE = 50

interface Prompt {
  prompt_id: string
  category_id: string
  difficulty: number
  is_daily_eligible: boolean
  is_hidden: boolean
  is_family_friendly: boolean
  is_flagged?: boolean
  notes?: string
  payload: { text: string; forbidden_words?: string[] }
}

interface Props {
  supabase: SupabaseClient
  showToast: (msg: string, ok?: boolean) => void
}

const INPUT: React.CSSProperties = { background: '#0d2d3d', border: '1px solid #1a4a5a', borderRadius: 6, padding: '0.3rem 0.5rem', color: '#c8d8c8', fontFamily: 'Poppins, sans-serif', fontSize: '0.8rem' }
const TH: React.CSSProperties = { fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', color: '#29afd4', textTransform: 'uppercase', padding: '0.5rem 0.6rem', textAlign: 'left', whiteSpace: 'nowrap' }
const TD: React.CSSProperties = { padding: '0.45rem 0.6rem', fontSize: '0.8rem', color: '#c8d8c8', borderTop: '1px solid #1a4a5a' }

export default function PromptsTab({ supabase, showToast }: Props) {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [filtered, setFiltered] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [catFilter, setCatFilter] = useState('all')
  const [diffFilter, setDiffFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<Partial<Prompt>>({})
  const [bulkDiff, setBulkDiff] = useState(0)

  useEffect(() => { fetchPrompts() }, [])

  async function fetchPrompts() {
    setLoading(true)
    try {
      let allPrompts: Prompt[] = []
      let from = 0
      const pageSize = 1000

      while (true) {
        const { data, error } = await supabase
          .from('prompts')
          .select('*')
          .range(from, from + pageSize - 1)
          .order('category_id', { ascending: true })

        if (error) throw error
        if (!data || data.length === 0) break

        allPrompts = [...allPrompts, ...data]

        if (data.length < pageSize) break
        from += pageSize
      }

      // Debug: log total count and per-category breakdown
      const byCat: Record<string, number> = {}
      allPrompts.forEach((r: Prompt) => { byCat[r.category_id] = (byCat[r.category_id] ?? 0) + 1 })
      console.log('[PromptsTab] fetchPrompts — total rows:', allPrompts.length, '| per-category:', byCat)
      console.log('[PromptsTab] core_sports rows:', allPrompts.filter((r: Prompt) => r.category_id === 'core_sports').length)

      setPrompts(allPrompts)
    } catch (err) {
      console.error('Failed to fetch prompts:', err)
      showToast('Failed to load prompts', false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let list = [...prompts]
    if (catFilter !== 'all') list = list.filter(p => p.category_id === catFilter)
    if (diffFilter !== 'all') list = list.filter(p => p.difficulty === Number(diffFilter))
    if (statusFilter === 'eligible') list = list.filter(p => p.is_daily_eligible && !p.is_hidden)
    else if (statusFilter === 'not') list = list.filter(p => !p.is_daily_eligible)
    else if (statusFilter === 'hidden') list = list.filter(p => p.is_hidden)
    else if (statusFilter === 'flagged') list = list.filter(p => p.is_flagged)
    if (search.trim()) list = list.filter(p => p.payload?.text?.toLowerCase().includes(search.toLowerCase()))
    // Debug: log filter state whenever filters change
    console.log('[PromptsTab] filter applied — catFilter:', catFilter, '| diffFilter:', diffFilter, '| statusFilter:', statusFilter, '| results:', list.length, '(of', prompts.length, 'loaded)')
    setFiltered(list)
    setPage(0)
    setChecked(new Set())
  }, [prompts, catFilter, diffFilter, statusFilter, search])

  const pageData = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const allPageChecked = pageData.length > 0 && pageData.every(p => checked.has(p.prompt_id))

  function toggleCheck(id: string) {
    setChecked(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  function toggleAllPage() {
    if (allPageChecked) setChecked(prev => { const n = new Set(prev); pageData.forEach(p => n.delete(p.prompt_id)); return n })
    else setChecked(prev => { const n = new Set(prev); pageData.forEach(p => n.add(p.prompt_id)); return n })
  }

  async function toggleField(p: Prompt, field: 'is_daily_eligible' | 'is_hidden') {
    const newVal = !p[field]
    const { error } = await supabase.from('prompts').update({ [field]: newVal }).eq('prompt_id', p.prompt_id)
    if (error) { showToast('Update failed', false); return }
    setPrompts(prev => prev.map(x => x.prompt_id === p.prompt_id ? { ...x, [field]: newVal } : x))
  }

  async function saveEdit(id: string) {
    const p = prompts.find(x => x.prompt_id === id)
    if (!p) return
    const payload = { ...p.payload, text: editDraft.payload?.text ?? p.payload.text }
    const { error } = await supabase.from('prompts').update({
      difficulty: editDraft.difficulty ?? p.difficulty,
      is_family_friendly: editDraft.is_family_friendly ?? p.is_family_friendly,
      notes: editDraft.notes ?? p.notes,
      payload,
    }).eq('prompt_id', id)
    if (error) { showToast('Save failed', false); return }
    showToast('Saved')
    setEditingId(null)
    fetchPrompts()
  }

  async function bulkAction(action: string) {
    const ids = [...checked]
    if (!ids.length) return
    let update: Record<string, unknown> = {}
    if (action === 'eligible') update = { is_daily_eligible: true }
    else if (action === 'not_eligible') update = { is_daily_eligible: false }
    else if (action === 'hide') update = { is_hidden: true }
    else if (action === 'unhide') update = { is_hidden: false }
    else if (action === 'diff') update = { difficulty: bulkDiff }
    const { error } = await supabase.from('prompts').update(update).in('prompt_id', ids)
    if (error) { showToast('Bulk update failed', false); return }
    showToast(`Updated ${ids.length} prompts`)
    setChecked(new Set())
    fetchPrompts()
  }

  const SEL: React.CSSProperties = { ...INPUT, cursor: 'pointer' }

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '2rem' }}>
      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={SEL}>
          <option value="all">All Categories</option>
          {CATEGORIES_ALL.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c] ?? c}</option>)}
        </select>
        <select value={diffFilter} onChange={e => setDiffFilter(e.target.value)} style={SEL}>
          <option value="all">All Difficulty</option>
          {DIFFICULTIES.map(d => <option key={d} value={d}>{DIFF_LABEL[d]}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={SEL}>
          <option value="all">All Status</option>
          <option value="eligible">Daily Eligible</option>
          <option value="not">Not Eligible</option>
          <option value="hidden">Hidden</option>
          <option value="flagged">Flagged</option>
        </select>
        <input
          placeholder="Search text…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...INPUT, minWidth: 180 }}
        />
        <span style={{ fontSize: '0.72rem', color: '#64748b', marginLeft: 'auto' }}>
          Showing {filtered.length} of {prompts.length} prompts
        </span>
      </div>

      {/* Bulk action bar */}
      {checked.size > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: '#0d2d3d', border: '1px solid #29afd4', borderRadius: 8, padding: '0.5rem 0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', color: '#29afd4', fontWeight: 700 }}>{checked.size} selected</span>
          {(['eligible', 'not_eligible', 'hide', 'unhide'] as const).map(a => (
            <button key={a} onClick={() => bulkAction(a)} style={{ background: '#0d2d3d', border: '1px solid #1a4a5a', borderRadius: 6, padding: '0.25rem 0.6rem', color: '#c8d8c8', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', fontSize: '0.72rem' }}>
              {{ eligible: 'Mark Eligible', not_eligible: 'Remove Eligible', hide: 'Hide', unhide: 'Unhide' }[a]}
            </button>
          ))}
          <select value={bulkDiff} onChange={e => setBulkDiff(Number(e.target.value))} style={{ ...SEL, fontSize: '0.72rem' }}>
            {DIFFICULTIES.map(d => <option key={d} value={d}>{DIFF_LABEL[d]}</option>)}
          </select>
          <button onClick={() => bulkAction('diff')} style={{ background: '#0d2d3d', border: '1px solid #1a4a5a', borderRadius: 6, padding: '0.25rem 0.6rem', color: '#c8d8c8', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', fontSize: '0.72rem' }}>Move to Difficulty</button>
        </div>
      )}

      {loading ? (
        <div style={{ color: '#64748b', padding: '2rem' }}>Loading prompts…</div>
      ) : (
        <div style={{ background: '#0d2d3d', border: '1px solid #1a4a5a', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#0f3547' }}>
              <tr>
                <th style={{ ...TH, width: 32 }}>
                  <input type="checkbox" checked={allPageChecked} onChange={toggleAllPage} style={{ cursor: 'pointer' }} />
                </th>
                <th style={TH}>ID</th>
                <th style={TH}>Text</th>
                <th style={TH}>Category</th>
                <th style={TH}>Diff</th>
                <th style={TH}>Daily</th>
                <th style={TH}>Hidden</th>
                <th style={TH}>Family</th>
                <th style={TH}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageData.map(p => (
                <React.Fragment key={p.prompt_id}>
                  <tr style={{ background: checked.has(p.prompt_id) ? '#0d2d3d' : 'transparent' }}
                    onMouseEnter={e => { if (!checked.has(p.prompt_id)) (e.currentTarget as HTMLElement).style.background = '#0f3547' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = checked.has(p.prompt_id) ? '#0d2d3d' : 'transparent' }}>
                    <td style={TD}><input type="checkbox" checked={checked.has(p.prompt_id)} onChange={() => toggleCheck(p.prompt_id)} style={{ cursor: 'pointer' }} /></td>
                    <td style={{ ...TD, color: '#64748b', fontSize: '0.68rem', whiteSpace: 'nowrap' }}>{p.prompt_id}</td>
                    <td style={{ ...TD, fontWeight: 600, maxWidth: 300 }}>{p.payload?.text}</td>
                    <td style={{ ...TD, color: '#64748b', fontSize: '0.72rem' }}>{p.category_id}</td>
                    <td style={TD}>
                      <span style={{ background: DIFF_COLOR[p.difficulty] + '22', color: DIFF_COLOR[p.difficulty], border: `1px solid ${DIFF_COLOR[p.difficulty]}44`, borderRadius: 999, padding: '0.1rem 0.45rem', fontSize: '0.68rem', fontWeight: 700 }}>
                        {DIFF_LABEL[p.difficulty]}
                      </span>
                    </td>
                    <td style={TD}><span style={{ color: p.is_daily_eligible ? '#29afd4' : '#64748b' }}>{p.is_daily_eligible ? '✓' : '—'}</span></td>
                    <td style={TD}><span style={{ color: p.is_hidden ? '#ef4444' : '#64748b' }}>{p.is_hidden ? '✗' : '—'}</span></td>
                    <td style={TD}><span style={{ color: p.is_family_friendly ? '#29afd4' : '#64748b' }}>{p.is_family_friendly ? '✓' : '—'}</span></td>
                    <td style={TD}>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button title="Toggle daily eligible" onClick={() => toggleField(p, 'is_daily_eligible')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', color: p.is_daily_eligible ? '#29afd4' : '#64748b' }}>◎</button>
                        <button title="Toggle hidden" onClick={() => toggleField(p, 'is_hidden')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', color: p.is_hidden ? '#ef4444' : '#64748b' }}>◉</button>
                        <button title="Edit" onClick={() => { setEditingId(editingId === p.prompt_id ? null : p.prompt_id); setEditDraft({ payload: { ...p.payload }, difficulty: p.difficulty, is_family_friendly: p.is_family_friendly, notes: p.notes }) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', color: '#94a3b8' }}>✎</button>
                      </div>
                    </td>
                  </tr>
                  {editingId === p.prompt_id && (
                    <tr key={p.prompt_id + '_edit'} style={{ background: '#0f3547' }}>
                      <td colSpan={9} style={{ padding: '0.75rem 1rem', borderTop: '1px solid #29afd4' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: 600 }}>
                          <input
                            value={editDraft.payload?.text ?? ''}
                            onChange={e => setEditDraft(prev => ({ ...prev, payload: { ...prev.payload!, text: e.target.value } }))}
                            style={{ ...INPUT, width: '100%' }}
                          />
                          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            <select value={editDraft.difficulty ?? 0} onChange={e => setEditDraft(prev => ({ ...prev, difficulty: Number(e.target.value) }))} style={SEL}>
                              {DIFFICULTIES.map(d => <option key={d} value={d}>{DIFF_LABEL[d]}</option>)}
                            </select>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#c8d8c8', cursor: 'pointer' }}>
                              <input type="checkbox" checked={editDraft.is_family_friendly ?? true} onChange={e => setEditDraft(prev => ({ ...prev, is_family_friendly: e.target.checked }))} />
                              Family friendly
                            </label>
                          </div>
                          <textarea
                            placeholder="Notes…"
                            value={editDraft.notes ?? ''}
                            onChange={e => setEditDraft(prev => ({ ...prev, notes: e.target.value }))}
                            style={{ ...INPUT, minHeight: 56, resize: 'vertical', width: '100%' }}
                          />
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => saveEdit(p.prompt_id)} style={{ background: '#16a34a', border: 'none', borderRadius: 6, padding: '0.35rem 0.9rem', color: '#000', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', fontSize: '0.78rem', fontWeight: 700 }}>Save</button>
                            <button onClick={() => setEditingId(null)} style={{ background: 'none', border: '1px solid #1a4a5a', borderRadius: 6, padding: '0.35rem 0.9rem', color: '#94a3b8', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', fontSize: '0.78rem' }}>Cancel</button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '1rem', justifyContent: 'flex-end' }}>
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{ ...INPUT, cursor: page === 0 ? 'not-allowed' : 'pointer', padding: '0.3rem 0.7rem', opacity: page === 0 ? 0.4 : 1 }}>Prev</button>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Page {page + 1} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} style={{ ...INPUT, cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer', padding: '0.3rem 0.7rem', opacity: page >= totalPages - 1 ? 0.4 : 1 }}>Next</button>
        </div>
      )}
    </div>
  )
}
