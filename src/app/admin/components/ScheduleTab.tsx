'use client'

import { useEffect, useRef, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'

const CARD: React.CSSProperties = { background: '#0d1710', border: '1px solid #1a2e1a', borderRadius: 12 }
const CATEGORIES = ['core_sports', 'core_food', 'core_groups', 'core_wabws', 'core_actitout']
const CATEGORY_LABELS: Record<string, string> = {
  core_sports: 'Sports',
  core_food: 'Food',
  core_groups: 'Groups',
  core_wabws: 'WABWS',
  core_actitout: 'Act It Out',
}
const DIFFICULTIES = [
  { value: 0, label: 'Easy' },
  { value: 1, label: 'Medium' },
  { value: 2, label: 'Hard' },
  { value: 3, label: 'Expert' },
]

interface ScheduleRow {
  date: string
  core_category_id: string
  core_difficulty: number
  core_prompt_ids: string[]
  icebreaker_prompt_id_resolved: string | null
  published: boolean
  notes?: string | null
}

interface Prompt {
  prompt_id: string
  payload: { text: string; answer?: string; image_ref?: string }
}

interface Props {
  supabase: SupabaseClient
  showToast: (msg: string, ok?: boolean) => void
}

function isoDate(d: Date) {
  return d.toISOString().split('T')[0]
}

function getDifficultyForDow(dow: number): number {
  if (dow === 0 || dow === 6) return 2   // Sat/Sun: Hard
  if (dow === 5) return 1                 // Fri: Medium
  return dow % 2 === 1 ? 0 : 1           // Mon/Wed: Easy, Tue/Thu: Medium
}

const ICON_BTN: React.CSSProperties = {
  background: 'none',
  border: '1px solid #1a2e1a',
  borderRadius: 6,
  padding: '0.2rem 0.45rem',
  color: '#9ab89a',
  cursor: 'pointer',
  fontFamily: 'Lexend, sans-serif',
  fontSize: '0.8rem',
  lineHeight: 1,
  flexShrink: 0,
}

const INPUT_STYLE: React.CSSProperties = {
  background: '#0a0f0a',
  border: '1px solid #1a2e1a',
  borderRadius: 6,
  padding: '0.3rem 0.5rem',
  color: '#c8d8c8',
  fontFamily: 'Lexend, sans-serif',
  fontSize: '0.78rem',
  outline: 'none',
  flex: 1,
  minWidth: 0,
}

export default function ScheduleTab({ supabase, showToast }: Props) {
  const today = isoDate(new Date())
  const [schedule, setSchedule] = useState<Record<string, ScheduleRow>>({})
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [editState, setEditState] = useState<Partial<ScheduleRow>>({})
  const [preview, setPreview] = useState<Prompt[]>([])
  const [icebreakerPreview, setIcebreakerPreview] = useState<Prompt | null>(null)
  const [filling, setFilling] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showManual, setShowManual] = useState(false)
  const [generatingWeek, setGeneratingWeek] = useState(false)
  const [publishingWeek, setPublishingWeek] = useState(false)
  const [viewMode, setViewMode] = useState<'calendar' | 'week'>('calendar')
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  // Swap / flag state for core prompts
  const [swapSearchIndex, setSwapSearchIndex] = useState<number | null>(null)
  const [swapSearchText, setSwapSearchText] = useState('')
  const [swapSearchResults, setSwapSearchResults] = useState<Prompt[]>([])
  const [flagConfirmIndex, setFlagConfirmIndex] = useState<number | null>(null)

  // Swap state for icebreaker
  const [ibSwapOpen, setIbSwapOpen] = useState(false)
  const [ibSwapText, setIbSwapText] = useState('')
  const [ibSwapResults, setIbSwapResults] = useState<Prompt[]>([])

  const swapInputRef = useRef<HTMLInputElement>(null)
  const ibSwapInputRef = useRef<HTMLInputElement>(null)

  // Build 30-day range
  const days: string[] = []
  for (let i = 0; i < 30; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    days.push(isoDate(d))
  }

  useEffect(() => { fetchSchedule() }, [])
  useEffect(() => { if (swapSearchIndex !== null) swapInputRef.current?.focus() }, [swapSearchIndex])
  useEffect(() => { if (ibSwapOpen) ibSwapInputRef.current?.focus() }, [ibSwapOpen])

  async function fetchSchedule() {
    setLoading(true)
    const { data, error } = await supabase
      .from('daily_schedule')
      .select('*')
      .gte('date', today)
      .order('date', { ascending: true })
      .limit(30)
    if (error) { showToast('Failed to load schedule', false); setLoading(false); return }
    const map: Record<string, ScheduleRow> = {}
    ;(data ?? []).forEach((r: ScheduleRow) => { map[r.date] = r })
    setSchedule(map)
    setLoading(false)
  }

  async function selectDay(date: string) {
    setSelectedDate(date)
    setPreview([])
    setIcebreakerPreview(null)
    setShowManual(false)
    setDeleteConfirm(false)
    setSwapSearchIndex(null)
    setSwapSearchText('')
    setSwapSearchResults([])
    setFlagConfirmIndex(null)
    setIbSwapOpen(false)
    setIbSwapText('')
    setIbSwapResults([])

    const existing = schedule[date]
    setEditState(existing ? { ...existing } : { core_category_id: CATEGORIES[0], core_difficulty: 0, published: false })

    if (existing?.core_prompt_ids?.length) {
      try {
        const { data } = await supabase
          .from('prompts')
          .select('prompt_id, payload')
          .in('prompt_id', existing.core_prompt_ids)
        const promptMap: Record<string, Prompt> = {}
        ;(data ?? []).forEach((p: Prompt) => { promptMap[p.prompt_id] = p })
        const ordered = existing.core_prompt_ids
          .map(id => promptMap[id])
          .filter((p): p is Prompt => !!p)
        setPreview(ordered)
      } catch { /* non-critical */ }
    }

    if (existing?.icebreaker_prompt_id_resolved) {
      try {
        const { data } = await supabase
          .from('prompts')
          .select('prompt_id, payload')
          .eq('prompt_id', existing.icebreaker_prompt_id_resolved)
          .single()
        setIcebreakerPreview(data ?? null)
      } catch { /* non-critical */ }
    }
  }

  // ── Exclusion set ──────────────────────────────────────────────────────────

  async function fetchExcluded(): Promise<Set<string>> {
    const [scheduledResult, usedResult] = await Promise.all([
      supabase.from('daily_schedule').select('core_prompt_ids, icebreaker_prompt_id_resolved'),
      supabase.from('daily_used_prompts').select('prompt_id'),
    ])
    const fromSchedule: string[] = []
    for (const row of scheduledResult.data ?? []) {
      if (Array.isArray(row.core_prompt_ids)) fromSchedule.push(...row.core_prompt_ids)
      if (typeof row.icebreaker_prompt_id_resolved === 'string') fromSchedule.push(row.icebreaker_prompt_id_resolved)
    }
    const fromUsed = (usedResult.data ?? []).map((r: { prompt_id: string }) => r.prompt_id)
    return new Set([...fromSchedule, ...fromUsed])
  }

  // ── Auto-fill ──────────────────────────────────────────────────────────────

  async function autoFill(date: string) {
    setFilling(true)
    try {
      const cat = editState.core_category_id ?? CATEGORIES[0]
      const diff = editState.core_difficulty ?? 0

      const excluded = await fetchExcluded()

      const { data: promptData, error: pe } = await supabase
        .from('prompts')
        .select('prompt_id, payload')
        .eq('category_id', cat)
        .eq('difficulty', diff)
        .eq('is_daily_eligible', true)
        .eq('is_hidden', false)
        .eq('is_active', true)
      if (pe) { showToast('Failed to fetch prompts', false); setFilling(false); return }

      const pool: Prompt[] = (promptData ?? []).filter(p => !excluded.has(p.prompt_id))
      if (pool.length < 5) { showToast(`Only ${pool.length} eligible prompts available (need 5)`, false); setFilling(false); return }

      const shuffled = [...pool].sort(() => Math.random() - 0.5)
      const picked = shuffled.slice(0, 5)

      const { data: ibData } = await supabase
        .from('prompts')
        .select('prompt_id, payload')
        .eq('category_id', 'icebreaker_country_outlines')
        .eq('is_daily_eligible', true)
        .eq('is_hidden', false)
        .eq('is_active', true)
      const ibPool: Prompt[] = (ibData ?? []).filter(p => !excluded.has(p.prompt_id))
      const ib = ibPool.length ? ibPool[Math.floor(Math.random() * ibPool.length)] : null

      setPreview(picked)
      setIcebreakerPreview(ib)
      setEditState(prev => ({
        ...prev,
        core_prompt_ids: picked.map(p => p.prompt_id),
        icebreaker_prompt_id_resolved: ib?.prompt_id ?? null,
      }))
    } finally {
      setFilling(false)
    }
  }

  // ── Generate Week ──────────────────────────────────────────────────────────

  async function generateWeek() {
    setGeneratingWeek(true)
    try {
      // Fetch all existing scheduled dates so we can skip them
      const { data: allScheduled } = await supabase
        .from('daily_schedule')
        .select('date, core_category_id')
        .order('date', { ascending: false })

      const scheduledDates = new Set((allScheduled ?? []).map((r: { date: string }) => r.date))

      // Walk forward day by day from today, collect up to 7 dates with no existing row
      const emptyDays: string[] = []
      for (let i = 0; i < 60 && emptyDays.length < 7; i++) {
        const d = new Date()
        d.setDate(d.getDate() + i)
        const ds = isoDate(d)
        if (!scheduledDates.has(ds)) emptyDays.push(ds)
      }

      if (emptyDays.length === 0) { showToast('Schedule is full — no empty days in next 60 days', false); return }

      const excluded = await fetchExcluded()

      // Fetch all icebreakers once
      const { data: ibData } = await supabase
        .from('prompts')
        .select('prompt_id, payload')
        .eq('category_id', 'icebreaker_country_outlines')
        .eq('is_daily_eligible', true)
        .eq('is_hidden', false)
        .eq('is_active', true)
      let ibPool: Prompt[] = (ibData ?? []).filter(p => !excluded.has(p.prompt_id))

      // Build category history from already-scheduled rows, sorted desc
      const catHistory: Array<{ date: string; cat: string }> = (allScheduled ?? [])
        .map((r: { date: string; core_category_id: string }) => ({ date: r.date, cat: r.core_category_id }))
        .sort((a: { date: string }, b: { date: string }) => b.date.localeCompare(a.date))

      const saved: string[] = []

      for (const dateStr of emptyDays) {
        const d = new Date(dateStr + 'T12:00:00')
        const dow = d.getDay()
        const diff = getDifficultyForDow(dow)

        // Last 3 categories from already-scheduled rows before this date
        const recent3 = catHistory.filter(h => h.date < dateStr).slice(0, 3).map(h => h.cat)

        // Pick next category in rotation not in recent 3
        const lastCat = recent3[0]
        const lastIdx = lastCat ? CATEGORIES.indexOf(lastCat) : -1
        let cat = CATEGORIES[0]
        for (let i = 1; i <= CATEGORIES.length; i++) {
          const candidate = CATEGORIES[(lastIdx + i) % CATEGORIES.length]
          if (!recent3.includes(candidate)) { cat = candidate; break }
        }

        // Fetch prompts for this category + difficulty
        const { data: promptData } = await supabase
          .from('prompts')
          .select('prompt_id, payload')
          .eq('category_id', cat)
          .eq('difficulty', diff)
          .eq('is_daily_eligible', true)
          .eq('is_hidden', false)
          .eq('is_active', true)

        const pool: Prompt[] = (promptData ?? []).filter(p => !excluded.has(p.prompt_id))

        if (pool.length < 5) {
          showToast(`Skipping ${dateStr}: only ${pool.length} prompts for ${CATEGORY_LABELS[cat]} diff${diff}`, false)
          continue
        }

        const picked = [...pool].sort(() => Math.random() - 0.5).slice(0, 5)

        // Pick icebreaker
        const ib = ibPool.length ? ibPool[Math.floor(Math.random() * ibPool.length)] : null

        // Grow excluded so later days in this batch don't reuse
        picked.forEach(p => excluded.add(p.prompt_id))
        if (ib) {
          excluded.add(ib.prompt_id)
          ibPool = ibPool.filter(p => p.prompt_id !== ib.prompt_id)
        }

        const row = {
          date: dateStr,
          core_category_id: cat,
          core_difficulty: diff,
          core_prompt_ids: picked.map(p => p.prompt_id),
          icebreaker_prompt_id_resolved: ib?.prompt_id ?? null,
          published: false,
          notes: null,
        }

        const { error } = await supabase.from('daily_schedule').upsert(row, { onConflict: 'date' })
        if (error) {
          showToast(`Failed to save ${dateStr}`, false)
        } else {
          saved.push(dateStr)
          catHistory.unshift({ date: dateStr, cat })
        }
      }

      await fetchSchedule()
      if (saved.length > 0) {
        const nearlyFull = saved.length < emptyDays.length || emptyDays.length < 7
        showToast(
          nearlyFull
            ? `Generated ${saved.length} day${saved.length !== 1 ? 's' : ''} — schedule is nearly full`
            : `Week generated — ${saved.length} days scheduled as drafts`
        )
        setSelectedDate(saved[0])
        setPreview([])
        setIcebreakerPreview(null)
        setSwapSearchIndex(null)
        setFlagConfirmIndex(null)
        setIbSwapOpen(false)
      } else {
        showToast('No days were generated', false)
      }
    } catch {
      showToast('Failed to generate week', false)
    } finally {
      setGeneratingWeek(false)
    }
  }

  // ── Publish Week ───────────────────────────────────────────────────────────

  async function publishWeek() {
    setPublishingWeek(true)
    try {
      const draftDays = days.slice(0, 7).filter(d => schedule[d] && !schedule[d].published)
      if (draftDays.length === 0) { showToast('No drafts in next 7 days', false); setPublishingWeek(false); return }
      const { error } = await supabase
        .from('daily_schedule')
        .update({ published: true })
        .in('date', draftDays)
      if (error) throw error
      showToast(`${draftDays.length} day${draftDays.length !== 1 ? 's' : ''} published`)
      await fetchSchedule()
    } catch {
      showToast('Failed to publish week', false)
    } finally {
      setPublishingWeek(false)
    }
  }

  // ── Move day ───────────────────────────────────────────────────────────────

  async function moveDay(direction: -1 | 1) {
    if (!selectedDate) return
    const d = new Date(selectedDate + 'T12:00:00')
    d.setDate(d.getDate() + direction)
    const targetDate = isoDate(d)

    if (schedule[targetDate]) {
      showToast('That date already has a game scheduled', false)
      return
    }

    try {
      const { error } = await supabase
        .from('daily_schedule')
        .update({ date: targetDate })
        .eq('date', selectedDate)
      if (error) throw error
      setSelectedDate(targetDate)
      setEditState(prev => ({ ...prev, date: targetDate }))
      await fetchSchedule()
      showToast(`Moved to ${targetDate}`)
    } catch {
      showToast('Failed to move day', false)
    }
  }

  // ── Notes auto-save ────────────────────────────────────────────────────────

  async function autoSaveNotes(notes: string) {
    if (!selectedDate) return
    try {
      await supabase.from('daily_schedule').update({ notes: notes || null }).eq('date', selectedDate)
      setSchedule(prev => prev[selectedDate]
        ? { ...prev, [selectedDate]: { ...prev[selectedDate], notes: notes || null } }
        : prev
      )
    } catch { /* ignore */ }
  }

  // ── Core prompt swap / replace / flag ──────────────────────────────────────

  function openSwap(index: number) {
    setFlagConfirmIndex(null)
    setSwapSearchText('')
    setSwapSearchResults([])
    setSwapSearchIndex(index === swapSearchIndex ? null : index)
  }

  async function fetchSwapSearch(term: string) {
    setSwapSearchText(term)
    if (!term.trim()) { setSwapSearchResults([]); return }
    const cat = editState.core_category_id ?? CATEGORIES[0]
    const diff = editState.core_difficulty ?? 0
    const currentSlotIds = new Set(preview.map(p => p.prompt_id))
    try {
      const [excluded, queryResult] = await Promise.all([
        fetchExcluded(),
        supabase
          .from('prompts')
          .select('prompt_id, payload')
          .eq('category_id', cat)
          .eq('difficulty', diff)
          .eq('is_daily_eligible', true)
          .eq('is_hidden', false)
          .ilike('payload->>text', `%${term}%`)
          .limit(50),
      ])
      const results = (queryResult.data ?? [])
        .filter(p => !excluded.has(p.prompt_id) && !currentSlotIds.has(p.prompt_id))
        .slice(0, 10)
      setSwapSearchResults(results)
    } catch { /* ignore */ }
  }

  function handleSwapPrompt(slotIndex: number, newPrompt: Prompt) {
    const updated = [...preview]
    updated[slotIndex] = newPrompt
    setPreview(updated)
    setEditState(prev => ({ ...prev, core_prompt_ids: updated.map(p => p.prompt_id) }))
    setSwapSearchIndex(null)
    setSwapSearchText('')
    setSwapSearchResults([])
  }

  async function handleRemoveAndReplace(slotIndex: number) {
    const cat = editState.core_category_id ?? CATEGORIES[0]
    const diff = editState.core_difficulty ?? 0
    const currentSlotIds = new Set(preview.map(p => p.prompt_id))
    try {
      const [excluded, queryResult] = await Promise.all([
        fetchExcluded(),
        supabase
          .from('prompts')
          .select('prompt_id, payload')
          .eq('category_id', cat)
          .eq('difficulty', diff)
          .eq('is_daily_eligible', true)
          .eq('is_hidden', false)
          .eq('is_active', true),
      ])
      if (queryResult.error) throw queryResult.error
      const pool: Prompt[] = (queryResult.data ?? [])
        .filter(p => !excluded.has(p.prompt_id) && !currentSlotIds.has(p.prompt_id))
      if (!pool.length) { showToast('No eligible replacements found', false); return }
      const replacement = pool[Math.floor(Math.random() * pool.length)]
      const updated = [...preview]
      updated[slotIndex] = replacement
      setPreview(updated)
      setEditState(prev => ({ ...prev, core_prompt_ids: updated.map(p => p.prompt_id) }))
    } catch {
      showToast('Failed to fetch replacement', false)
    }
  }

  async function handleFlagNotEligible(slotIndex: number) {
    const prompt = preview[slotIndex]
    if (!prompt) return
    try {
      const { error } = await supabase
        .from('prompts')
        .update({ is_daily_eligible: false })
        .eq('prompt_id', prompt.prompt_id)
      if (error) throw error
      showToast('Prompt removed from daily pool')
      setFlagConfirmIndex(null)
      await handleRemoveAndReplace(slotIndex)
    } catch {
      showToast('Failed to flag prompt', false)
    }
  }

  // ── Icebreaker swap / replace ───────────────────────────────────────────────

  async function fetchIbSwapSearch(term: string) {
    setIbSwapText(term)
    if (!term.trim()) { setIbSwapResults([]); return }
    try {
      const { data } = await supabase
        .from('prompts')
        .select('prompt_id, payload')
        .eq('category_id', 'icebreaker_country_outlines')
        .eq('is_daily_eligible', true)
        .eq('is_hidden', false)
        .ilike('payload->>answer', `%${term}%`)
        .limit(10)
      setIbSwapResults(data ?? [])
    } catch { /* ignore */ }
  }

  function handleSwapIcebreaker(newPrompt: Prompt) {
    setIcebreakerPreview(newPrompt)
    setEditState(prev => ({ ...prev, icebreaker_prompt_id_resolved: newPrompt.prompt_id }))
    setIbSwapOpen(false)
    setIbSwapText('')
    setIbSwapResults([])
  }

  async function handleRemoveReplaceIcebreaker() {
    const currentId = icebreakerPreview?.prompt_id
    try {
      const [excluded, queryResult] = await Promise.all([
        fetchExcluded(),
        supabase
          .from('prompts')
          .select('prompt_id, payload')
          .eq('category_id', 'icebreaker_country_outlines')
          .eq('is_daily_eligible', true)
          .eq('is_hidden', false)
          .eq('is_active', true),
      ])
      if (queryResult.error) throw queryResult.error
      const pool: Prompt[] = (queryResult.data ?? [])
        .filter(p => !excluded.has(p.prompt_id) && p.prompt_id !== currentId)
      if (!pool.length) { showToast('No eligible icebreaker replacements', false); return }
      const replacement = pool[Math.floor(Math.random() * pool.length)]
      setIcebreakerPreview(replacement)
      setEditState(prev => ({ ...prev, icebreaker_prompt_id_resolved: replacement.prompt_id }))
    } catch {
      showToast('Failed to fetch icebreaker replacement', false)
    }
  }

  // ── Save ───────────────────────────────────────────────────────────────────

  async function saveSchedule() {
    if (!selectedDate) return
    setSaving(true)
    const row = {
      date: selectedDate,
      core_category_id: editState.core_category_id ?? CATEGORIES[0],
      core_difficulty: editState.core_difficulty ?? 0,
      core_prompt_ids: editState.core_prompt_ids ?? [],
      icebreaker_prompt_id_resolved: editState.icebreaker_prompt_id_resolved ?? null,
      published: editState.published ?? false,
      notes: editState.notes ?? null,
    }
    const { error } = await supabase.from('daily_schedule').upsert(row, { onConflict: 'date' })
    setSaving(false)
    if (error) { showToast('Save failed: ' + error.message, false); return }
    showToast(`Saved ${selectedDate}`)
    await fetchSchedule()
  }

  async function togglePublished() {
    if (!selectedDate) return
    const newVal = !(editState.published ?? false)
    setEditState(prev => ({ ...prev, published: newVal }))
    const { error } = await supabase.from('daily_schedule').update({ published: newVal }).eq('date', selectedDate)
    if (error) showToast('Update failed', false)
    else { showToast(newVal ? 'Published' : 'Unpublished'); fetchSchedule() }
  }

  async function unpublish() {
    if (!selectedDate) return
    setEditState(prev => ({ ...prev, published: false }))
    const { error } = await supabase.from('daily_schedule').update({ published: false }).eq('date', selectedDate)
    if (error) showToast('Update failed', false)
    else { showToast('Day unpublished — players will not see this game until republished'); fetchSchedule() }
  }

  async function deleteDay() {
    if (!selectedDate) return
    try {
      const { error } = await supabase.from('daily_schedule').delete().eq('date', selectedDate)
      if (error) throw error
      setDeleteConfirm(false)
      setPreview([])
      setIcebreakerPreview(null)
      setEditState({ core_category_id: CATEGORIES[0], core_difficulty: 0, published: false })
      setSwapSearchIndex(null)
      setFlagConfirmIndex(null)
      setIbSwapOpen(false)
      showToast('Day deleted')
      await fetchSchedule()
    } catch {
      showToast('Failed to delete day', false)
    }
  }

  // ── Calendar helpers ───────────────────────────────────────────────────────

  const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  function dotColor(date: string) {
    const row = schedule[date]
    if (!row) return '#ef4444'
    if (row.published) return '#22c55e'
    return '#eab308'
  }

  function dayBg(date: string) {
    const row = schedule[date]
    if (!row) return '#0d1710'
    if (row.published) return '#1a3a1a'
    return '#1a2a1a'
  }

  function dayBorder(date: string) {
    const isToday = date === today
    const row = schedule[date]
    if (isToday) return '2px solid #fff'
    if (!row) return '1px solid #1a2e1a'
    if (row.published) return '1px solid #22c55e'
    return '1px solid #eab308'
  }

  const selected = selectedDate ? schedule[selectedDate] : null

  // Rotation warning: same category used in last 3 scheduled days
  const rotationWarning = selectedDate && editState.core_category_id
    ? Object.entries(schedule)
        .filter(([d]) => d < selectedDate)
        .sort(([a], [b]) => b.localeCompare(a))
        .slice(0, 3)
        .some(([, row]) => row.core_category_id === editState.core_category_id)
    : false

  const BTN_SM: React.CSSProperties = {
    background: 'none',
    border: '1px solid #1a2e1a',
    borderRadius: 6,
    padding: '0.2rem 0.55rem',
    color: '#9ab89a',
    cursor: 'pointer',
    fontFamily: 'Lexend, sans-serif',
    fontSize: '0.72rem',
    fontWeight: 600,
    whiteSpace: 'nowrap' as const,
  }

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '2rem', display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>

      {/* Calendar / Week panel */}
      <div style={{ ...CARD, padding: '1.25rem', flexShrink: 0, width: 400 }}>

        {/* Panel header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', color: '#52525b', textTransform: 'uppercase' }}>
            {loading ? 'Loading…' : '30-Day Schedule'}
          </div>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={generateWeek}
              disabled={generatingWeek}
              style={{ ...BTN_SM, borderColor: '#22c55e', color: '#22c55e', opacity: generatingWeek ? 0.5 : 1 }}
            >
              {generatingWeek ? 'Generating…' : 'Generate Week →'}
            </button>
            <button
              onClick={publishWeek}
              disabled={publishingWeek}
              style={{ ...BTN_SM, opacity: publishingWeek ? 0.5 : 1 }}
            >
              {publishingWeek ? 'Publishing…' : 'Publish Week'}
            </button>
          </div>
        </div>

        {/* View toggle */}
        <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.75rem' }}>
          {(['calendar', 'week'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                ...BTN_SM,
                background: viewMode === mode ? '#1a2e1a' : 'none',
                color: viewMode === mode ? '#22c55e' : '#52525b',
                borderColor: viewMode === mode ? '#22c55e' : '#1a2e1a',
                textTransform: 'capitalize',
              }}
            >
              {mode === 'calendar' ? 'Calendar' : 'Week'}
            </button>
          ))}
        </div>

        {viewMode === 'calendar' ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.35rem' }}>
              {days.map(date => {
                const d = new Date(date + 'T12:00:00')
                return (
                  <div
                    key={date}
                    onClick={() => selectDay(date)}
                    style={{
                      background: dayBg(date),
                      border: selectedDate === date ? '2px solid #22c55e' : dayBorder(date),
                      borderRadius: 8,
                      padding: '0.4rem 0.3rem',
                      cursor: 'pointer',
                      position: 'relative',
                      textAlign: 'center',
                      transition: 'opacity 0.1s',
                    }}
                  >
                    <div style={{ fontSize: '0.65rem', color: '#52525b' }}>{DAY_ABBR[d.getDay()]}</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: date === today ? 900 : 600, color: date === today ? '#fff' : '#c8d8c8' }}>{d.getDate()}</div>
                    <div style={{ position: 'absolute', top: 3, right: 4, width: 6, height: 6, borderRadius: '50%', background: dotColor(date) }} />
                  </div>
                )
              })}
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', fontSize: '0.65rem', color: '#52525b' }}>
              <span><span style={{ color: '#22c55e' }}>●</span> Published</span>
              <span><span style={{ color: '#eab308' }}>●</span> Draft</span>
              <span><span style={{ color: '#ef4444' }}>●</span> Empty</span>
            </div>
          </>
        ) : (
          /* Week view */
          <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
            {days.slice(0, 7).map(date => {
              const row = schedule[date]
              const d = new Date(date + 'T12:00:00')
              return (
                <div
                  key={date}
                  onClick={() => selectDay(date)}
                  style={{
                    flexShrink: 0,
                    width: '80px',
                    background: selectedDate === date ? '#1a3a1a' : dayBg(date),
                    border: selectedDate === date ? '2px solid #22c55e' : dayBorder(date),
                    borderRadius: 8,
                    padding: '0.6rem 0.4rem',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '0.6rem', color: '#52525b' }}>{DAY_ABBR[d.getDay()]}</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: date === today ? '#fff' : '#c8d8c8', lineHeight: 1.2 }}>{d.getDate()}</div>
                  {row ? (
                    <>
                      <div style={{ fontSize: '0.58rem', color: '#9ab89a', marginTop: '0.3rem', lineHeight: 1.3 }}>
                        {CATEGORY_LABELS[row.core_category_id] ?? row.core_category_id}
                      </div>
                      <div style={{ fontSize: '0.55rem', color: '#52525b' }}>
                        {DIFFICULTIES.find(d => d.value === row.core_difficulty)?.label}
                      </div>
                      <div style={{ fontSize: '0.55rem', fontWeight: 700, color: row.published ? '#22c55e' : '#eab308', marginTop: '0.2rem' }}>
                        {row.published ? '✓ Pub' : 'Draft'}
                      </div>
                    </>
                  ) : (
                    <div style={{ fontSize: '0.58rem', color: '#ef4444', marginTop: '0.3rem' }}>Empty</div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Editor panel */}
      {selectedDate ? (
        <div style={{ ...CARD, padding: '1.5rem', flex: 1, minWidth: 0 }}>

          {/* Date heading + move controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', flex: 1 }}>
              {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
            <button onClick={() => moveDay(-1)} style={BTN_SM} title="Move one day earlier">← Earlier</button>
            <button onClick={() => moveDay(1)} style={BTN_SM} title="Move one day later">Later →</button>
            {selected && !deleteConfirm && (
              <button
                onClick={() => setDeleteConfirm(true)}
                style={{ ...BTN_SM, borderColor: '#ef4444', color: '#ef4444' }}
              >
                Delete Day
              </button>
            )}
            {selected && deleteConfirm && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.72rem', color: '#f87171', whiteSpace: 'nowrap' }}>Delete this day&apos;s schedule? This cannot be undone.</span>
                <button
                  onClick={deleteDay}
                  style={{ ...BTN_SM, borderColor: '#ef4444', color: '#ef4444', background: 'rgba(239,68,68,0.15)' }}
                >
                  Yes, Delete
                </button>
                <button onClick={() => setDeleteConfirm(false)} style={BTN_SM}>Cancel</button>
              </div>
            )}
          </div>

          {/* Rotation warning */}
          {rotationWarning && (
            <div style={{ background: '#2a2000', border: '1px solid #854d0e', borderRadius: 8, padding: '0.45rem 0.75rem', marginBottom: '1rem', fontSize: '0.78rem', color: '#fbbf24' }}>
              ⚠️ {CATEGORY_LABELS[editState.core_category_id ?? ''] ?? editState.core_category_id} was also used recently — consider a different category
            </div>
          )}

          {/* Category + Difficulty + Publish */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', color: '#4a7a4a', textTransform: 'uppercase' }}>Category</span>
              <select
                value={editState.core_category_id ?? CATEGORIES[0]}
                onChange={e => setEditState(prev => ({ ...prev, core_category_id: e.target.value }))}
                style={{ background: '#152815', border: '1px solid #1a2e1a', borderRadius: 6, padding: '0.3rem 0.5rem', color: '#c8d8c8', fontFamily: 'Lexend, sans-serif', fontSize: '0.82rem' }}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c] ?? c}</option>)}
              </select>
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', color: '#4a7a4a', textTransform: 'uppercase' }}>Difficulty</span>
              <select
                value={editState.core_difficulty ?? 0}
                onChange={e => setEditState(prev => ({ ...prev, core_difficulty: Number(e.target.value) }))}
                style={{ background: '#152815', border: '1px solid #1a2e1a', borderRadius: 6, padding: '0.3rem 0.5rem', color: '#c8d8c8', fontFamily: 'Lexend, sans-serif', fontSize: '0.82rem' }}
              >
                {DIFFICULTIES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </label>
            <button
              onClick={togglePublished}
              style={{
                background: editState.published ? '#14532d' : '#1a2e1a',
                border: `1px solid ${editState.published ? '#22c55e' : '#1a2e1a'}`,
                borderRadius: 6, padding: '0.3rem 0.8rem',
                color: editState.published ? '#22c55e' : '#52525b',
                cursor: 'pointer', fontFamily: 'Lexend, sans-serif', fontSize: '0.82rem', fontWeight: 700,
              }}
            >
              {editState.published ? '✓ Published' : 'Draft'}
            </button>
            {editState.published && (
              <button
                onClick={unpublish}
                style={{ ...BTN_SM, borderColor: '#854d0e', color: '#fb923c' }}
              >
                Unpublish
              </button>
            )}
          </div>

          {/* Auto-fill + Manual toggle */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <button
              onClick={() => autoFill(selectedDate)}
              disabled={filling}
              style={{ background: '#14532d', border: '1px solid #22c55e', borderRadius: 8, padding: '0.45rem 1.1rem', color: '#22c55e', cursor: filling ? 'not-allowed' : 'pointer', fontFamily: 'Lexend, sans-serif', fontSize: '0.82rem', fontWeight: 700, opacity: filling ? 0.6 : 1 }}
            >
              {filling ? 'Filling…' : selected ? 'Auto-fill Prompts' : 'Auto-fill This Day'}
            </button>
            <button
              onClick={() => setShowManual(v => !v)}
              style={{ background: 'none', border: '1px solid #1a2e1a', borderRadius: 8, padding: '0.45rem 1.1rem', color: '#9ab89a', cursor: 'pointer', fontFamily: 'Lexend, sans-serif', fontSize: '0.82rem' }}
            >
              {showManual ? 'Hide Manual' : 'Schedule Manually'}
            </button>
          </div>

          {/* ── Interactive Core Prompts ─────────────────────────────────── */}
          {preview.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', color: '#4a7a4a', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Core Prompts
              </div>

              {preview.map((p, i) => (
                <div key={p.prompt_id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid #1a2e1a' }}>
                    <span style={{ color: '#52525b', minWidth: 16, fontSize: '0.72rem', flexShrink: 0 }}>{i + 1}.</span>
                    <span style={{ flex: 1, fontSize: '0.82rem', fontWeight: 600, color: '#c8d8c8', minWidth: 0 }}>{p.payload?.text}</span>
                    <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
                      <button
                        onClick={() => openSwap(i)}
                        title="Swap this prompt"
                        style={{ ...ICON_BTN, borderColor: swapSearchIndex === i ? '#22c55e' : '#1a2e1a', color: swapSearchIndex === i ? '#22c55e' : '#9ab89a' }}
                      >↔</button>
                      <button onClick={() => handleRemoveAndReplace(i)} title="Replace with random" style={ICON_BTN}>🔄</button>
                      {flagConfirmIndex === i ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <span style={{ fontSize: '0.68rem', color: '#f87171', whiteSpace: 'nowrap' }}>Remove from pool?</span>
                          <button onClick={() => handleFlagNotEligible(i)} style={{ ...ICON_BTN, borderColor: '#ef4444', color: '#f87171', fontSize: '0.68rem' }}>Yes</button>
                          <button onClick={() => setFlagConfirmIndex(null)} style={{ ...ICON_BTN, fontSize: '0.68rem' }}>No</button>
                        </span>
                      ) : (
                        <button onClick={() => { setFlagConfirmIndex(i); setSwapSearchIndex(null) }} title="Flag as not eligible" style={ICON_BTN}>🚫</button>
                      )}
                    </div>
                  </div>

                  {swapSearchIndex === i && (
                    <div style={{ padding: '0.5rem 0 0.5rem 1.5rem', background: '#0a0f0a', borderBottom: '1px solid #1a2e1a' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.3rem' }}>
                        <input
                          ref={swapInputRef}
                          type="text"
                          value={swapSearchText}
                          onChange={e => fetchSwapSearch(e.target.value)}
                          placeholder="Search prompts…"
                          style={INPUT_STYLE}
                        />
                        <button onClick={() => { setSwapSearchIndex(null); setSwapSearchText(''); setSwapSearchResults([]) }} style={{ ...ICON_BTN, fontSize: '0.75rem' }}>✕</button>
                      </div>
                      {swapSearchResults.map(r => (
                        <div
                          key={r.prompt_id}
                          onClick={() => handleSwapPrompt(i, r)}
                          style={{ padding: '0.3rem 0.5rem', borderRadius: 5, cursor: 'pointer', fontSize: '0.78rem', color: '#c8d8c8' }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#1a2e1a')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          {r.payload?.text}
                        </div>
                      ))}
                      {swapSearchText && swapSearchResults.length === 0 && (
                        <div style={{ fontSize: '0.7rem', color: '#52525b', padding: '0.25rem 0.5rem' }}>No results</div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Notes */}
              <div style={{ marginTop: '1rem' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', color: '#52525b', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Notes (internal only)</div>
                <textarea
                  value={editState.notes ?? ''}
                  onChange={e => setEditState(prev => ({ ...prev, notes: e.target.value }))}
                  onBlur={e => autoSaveNotes(e.target.value)}
                  placeholder="e.g. Good for families, harder than usual..."
                  rows={2}
                  style={{ width: '100%', background: '#0a0f0a', border: '1px solid #1a2e1a', borderRadius: 6, padding: '0.4rem 0.5rem', color: '#c8d8c8', fontFamily: 'Lexend, sans-serif', fontSize: '0.78rem', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          )}

          {/* ── ICEBREAKER ────────────────────────────────────────────────── */}
          {icebreakerPreview && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', color: '#22d3c8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Icebreaker</div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.4rem 0', borderBottom: '1px solid #1a2e1a' }}>
                {icebreakerPreview.payload?.image_ref && (
                  <img
                    src={`/${icebreakerPreview.payload.image_ref}`}
                    alt={icebreakerPreview.payload?.answer ?? ''}
                    style={{ width: 80, borderRadius: 8, flexShrink: 0, display: 'block' }}
                  />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#22d3c8' }}>{icebreakerPreview.payload?.answer}</div>
                  <div style={{ fontSize: '0.68rem', color: '#52525b', marginTop: '0.15rem' }}>{icebreakerPreview.prompt_id}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
                  <button onClick={() => setIbSwapOpen(v => !v)} title="Swap icebreaker" style={{ ...ICON_BTN, borderColor: ibSwapOpen ? '#22d3c8' : '#1a2e1a', color: ibSwapOpen ? '#22d3c8' : '#9ab89a' }}>↔ Swap</button>
                  <button onClick={handleRemoveReplaceIcebreaker} title="Auto-assign new icebreaker" style={ICON_BTN}>🔄 Auto-assign</button>
                </div>
              </div>
              {ibSwapOpen && (
                <div style={{ padding: '0.5rem 0', background: '#0a0f0a', borderBottom: '1px solid #1a2e1a' }}>
                  <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.3rem' }}>
                    <input ref={ibSwapInputRef} type="text" value={ibSwapText} onChange={e => fetchIbSwapSearch(e.target.value)} placeholder="Search countries…" style={INPUT_STYLE} />
                    <button onClick={() => { setIbSwapOpen(false); setIbSwapText(''); setIbSwapResults([]) }} style={{ ...ICON_BTN, fontSize: '0.75rem' }}>✕</button>
                  </div>
                  {ibSwapResults.map(r => (
                    <div
                      key={r.prompt_id}
                      onClick={() => handleSwapIcebreaker(r)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0.5rem', borderRadius: 5, cursor: 'pointer' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#0a1f1f')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      {r.payload?.image_ref && (
                        <img src={`/${r.payload.image_ref}`} alt={r.payload?.answer ?? ''} style={{ width: 36, borderRadius: 4, flexShrink: 0 }} />
                      )}
                      <span style={{ fontSize: '0.78rem', color: '#22d3c8' }}>{r.payload?.answer}</span>
                    </div>
                  ))}
                  {ibSwapText && ibSwapResults.length === 0 && (
                    <div style={{ fontSize: '0.7rem', color: '#52525b', padding: '0.25rem 0.5rem' }}>No results</div>
                  )}
                </div>
              )}
            </div>
          )}

          {!selected && preview.length === 0 && (
            <div style={{ color: '#52525b', fontSize: '0.85rem', marginBottom: '1.25rem' }}>No game scheduled for this day.</div>
          )}

          {/* Notes when no preview (existing days with notes loaded from DB) */}
          {selected && preview.length === 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', color: '#52525b', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Notes (internal only)</div>
              <textarea
                value={editState.notes ?? ''}
                onChange={e => setEditState(prev => ({ ...prev, notes: e.target.value }))}
                onBlur={e => autoSaveNotes(e.target.value)}
                placeholder="e.g. Good for families, harder than usual..."
                rows={2}
                style={{ width: '100%', background: '#0a0f0a', border: '1px solid #1a2e1a', borderRadius: 6, padding: '0.4rem 0.5rem', color: '#c8d8c8', fontFamily: 'Lexend, sans-serif', fontSize: '0.78rem', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          )}

          {/* Manual form */}
          {showManual && (
            <ManualForm
              supabase={supabase}
              date={selectedDate}
              initial={editState}
              onSave={(row) => {
                setEditState(row)
                setShowManual(false)
                fetchSchedule()
                showToast('Saved')
              }}
              showToast={showToast}
            />
          )}

          {/* Confirm & Save */}
          {(preview.length > 0 || selected) && !showManual && (
            <button
              onClick={saveSchedule}
              disabled={saving}
              style={{ background: '#22c55e', border: 'none', borderRadius: 8, padding: '0.55rem 1.5rem', color: '#000', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Lexend, sans-serif', fontSize: '0.85rem', fontWeight: 900, opacity: saving ? 0.6 : 1, marginTop: preview.length > 0 ? '0.75rem' : 0 }}
            >
              {saving ? 'Saving…' : 'Confirm & Save'}
            </button>
          )}
        </div>
      ) : (
        <div style={{ ...CARD, padding: '2rem', color: '#52525b', fontSize: '0.9rem' }}>Select a day from the calendar to edit.</div>
      )}
    </div>
  )
}

function ManualForm({ supabase, date, initial, onSave, showToast }: {
  supabase: SupabaseClient
  date: string
  initial: Partial<ScheduleRow>
  onSave: (row: ScheduleRow) => void
  showToast: (msg: string, ok?: boolean) => void
}) {
  const [cat, setCat] = useState(initial.core_category_id ?? CATEGORIES[0])
  const [diff, setDiff] = useState(initial.core_difficulty ?? 0)
  const [coreSearch, setCoreSearch] = useState('')
  const [coreResults, setCoreResults] = useState<Prompt[]>([])
  const [selectedCore, setSelectedCore] = useState<Prompt[]>([])
  const [ibSearch, setIbSearch] = useState('')
  const [ibResults, setIbResults] = useState<Prompt[]>([])
  const [selectedIb, setSelectedIb] = useState<Prompt | null>(null)
  const [saving, setSaving] = useState(false)

  async function searchCore() {
    const { data } = await supabase.from('prompts').select('prompt_id, payload')
      .eq('category_id', cat).eq('difficulty', diff).eq('is_daily_eligible', true)
      .ilike('payload->>text', `%${coreSearch}%`).limit(20)
    setCoreResults(data ?? [])
  }

  async function searchIb() {
    const { data } = await supabase.from('prompts').select('prompt_id, payload')
      .eq('category_id', 'icebreaker_country_outlines')
      .ilike('payload->>text', `%${ibSearch}%`).limit(20)
    setIbResults(data ?? [])
  }

  async function save() {
    if (selectedCore.length !== 5) { showToast('Select exactly 5 core prompts', false); return }
    if (!selectedIb) { showToast('Select an icebreaker', false); return }
    setSaving(true)
    const row: ScheduleRow = {
      date, core_category_id: cat, core_difficulty: diff,
      core_prompt_ids: selectedCore.map(p => p.prompt_id),
      icebreaker_prompt_id_resolved: selectedIb.prompt_id,
      published: false,
    }
    const { error } = await supabase.from('daily_schedule').upsert(row, { onConflict: 'date' })
    setSaving(false)
    if (error) { showToast('Save failed', false); return }
    onSave(row)
  }

  const INPUT: React.CSSProperties = { background: '#152815', border: '1px solid #1a2e1a', borderRadius: 6, padding: '0.3rem 0.5rem', color: '#c8d8c8', fontFamily: 'Lexend, sans-serif', fontSize: '0.8rem', width: '100%' }

  return (
    <div style={{ borderTop: '1px solid #1a2e1a', paddingTop: '1rem', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <select value={cat} onChange={e => setCat(e.target.value)} style={{ ...INPUT, width: 'auto' }}>
          {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c] ?? c}</option>)}
        </select>
        <select value={diff} onChange={e => setDiff(Number(e.target.value))} style={{ ...INPUT, width: 'auto' }}>
          {DIFFICULTIES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <input placeholder="Search core prompts…" value={coreSearch} onChange={e => setCoreSearch(e.target.value)} style={INPUT} onKeyDown={e => e.key === 'Enter' && searchCore()} />
        <button onClick={searchCore} style={{ background: '#1a2e1a', border: '1px solid #22c55e', borderRadius: 6, padding: '0.3rem 0.6rem', color: '#22c55e', cursor: 'pointer', fontFamily: 'Lexend, sans-serif', fontSize: '0.75rem' }}>Search</button>
      </div>
      <div style={{ fontSize: '0.72rem', color: '#52525b', marginBottom: '0.35rem' }}>Selected: {selectedCore.length}/5</div>
      {coreResults.map(p => (
        <div key={p.prompt_id} onClick={() => {
          const has = selectedCore.find(x => x.prompt_id === p.prompt_id)
          if (has) setSelectedCore(prev => prev.filter(x => x.prompt_id !== p.prompt_id))
          else if (selectedCore.length < 5) setSelectedCore(prev => [...prev, p])
        }} style={{ padding: '0.3rem 0.5rem', borderRadius: 6, cursor: 'pointer', background: selectedCore.find(x => x.prompt_id === p.prompt_id) ? '#14532d' : 'transparent', fontSize: '0.8rem', color: '#c8d8c8', marginBottom: 2 }}>
          {p.payload?.text} <span style={{ color: '#52525b' }}>({p.prompt_id})</span>
        </div>
      ))}

      <div style={{ display: 'flex', gap: '0.5rem', margin: '0.75rem 0 0.5rem' }}>
        <input placeholder="Search icebreaker…" value={ibSearch} onChange={e => setIbSearch(e.target.value)} style={INPUT} onKeyDown={e => e.key === 'Enter' && searchIb()} />
        <button onClick={searchIb} style={{ background: '#1a2e1a', border: '1px solid #22c55e', borderRadius: 6, padding: '0.3rem 0.6rem', color: '#22c55e', cursor: 'pointer', fontFamily: 'Lexend, sans-serif', fontSize: '0.75rem' }}>Search</button>
      </div>
      {ibResults.map(p => (
        <div key={p.prompt_id} onClick={() => setSelectedIb(prev => prev?.prompt_id === p.prompt_id ? null : p)} style={{ padding: '0.3rem 0.5rem', borderRadius: 6, cursor: 'pointer', background: selectedIb?.prompt_id === p.prompt_id ? '#14532d' : 'transparent', fontSize: '0.8rem', color: '#22d3c8', marginBottom: 2 }}>
          {p.payload?.text}
        </div>
      ))}

      <button onClick={save} disabled={saving} style={{ marginTop: '0.75rem', background: '#22c55e', border: 'none', borderRadius: 8, padding: '0.5rem 1.2rem', color: '#000', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Lexend, sans-serif', fontSize: '0.82rem', fontWeight: 900 }}>
        {saving ? 'Saving…' : 'Save Manual Schedule'}
      </button>
    </div>
  )
}
