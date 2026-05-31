'use client'

import { useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'

const CATEGORIES_ALL = ['core_sports', 'core_food', 'core_groups', 'core_wabws', 'core_actitout', 'icebreaker_country_outlines']
const DIFF_LABEL = ['Easy', 'Medium', 'Hard', 'Expert']

const CAT_PREFIX: Record<string, string> = {
  core_sports: 'spo',
  core_food: 'fod',
  core_groups: 'grp',
  core_wabws: 'wab',
  core_actitout: 'act',
  icebreaker_country_outlines: 'ico',
}

interface CsvRow {
  text: string
  category_id: string
  difficulty: number
  is_daily_eligible: boolean
  forbidden_words: string[]
  _error?: string
}

interface Props {
  supabase: SupabaseClient
  showToast: (msg: string, ok?: boolean) => void
}

const CARD: React.CSSProperties = { background: '#0d1710', border: '1px solid #1a2e1a', borderRadius: 12, padding: '1.5rem', flex: 1, minWidth: 0 }
const INPUT: React.CSSProperties = { background: '#152815', border: '1px solid #1a2e1a', borderRadius: 6, padding: '0.4rem 0.6rem', color: '#c8d8c8', fontFamily: 'Lexend, sans-serif', fontSize: '0.82rem', width: '100%' }
const LABEL_STYLE: React.CSSProperties = { fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', color: '#4a7a4a', textTransform: 'uppercase', marginBottom: '0.3rem', display: 'block' }

function genId(cat: string, diff: number) {
  const prefix = CAT_PREFIX[cat] ?? 'unk'
  const suffix = Math.floor(100 + Math.random() * 900)
  return `${prefix}_${diff}_${suffix}`
}

function parseCsv(text: string): CsvRow[] {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
  return lines.slice(1).map(line => {
    const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''))
    const row: Partial<CsvRow> & { _error?: string } = {}
    headers.forEach((h, i) => {
      if (h === 'text') row.text = cols[i] ?? ''
      else if (h === 'category_id') row.category_id = cols[i] ?? ''
      else if (h === 'difficulty') row.difficulty = Number(cols[i] ?? 0)
      else if (h === 'is_daily_eligible') row.is_daily_eligible = cols[i]?.toLowerCase() === 'true'
      else if (h === 'forbidden_words') row.forbidden_words = cols[i] ? cols[i].split(';').map(w => w.trim()) : []
    })
    if (!row.text) row._error = 'Missing text'
    if (!row.category_id) row._error = 'Missing category_id'
    return row as CsvRow
  })
}

export default function AddContentTab({ supabase, showToast }: Props) {
  // Single prompt form
  const [text, setText] = useState('')
  const [cat, setCat] = useState(CATEGORIES_ALL[0])
  const [diff, setDiff] = useState(0)
  const [eligible, setEligible] = useState(false)
  const [family, setFamily] = useState(true)
  const [forbidden, setForbidden] = useState('')
  const [notes, setNotes] = useState('')
  const [adding, setAdding] = useState(false)
  const [lastAdded, setLastAdded] = useState<string | null>(null)

  // CSV bulk
  const [csvRows, setCsvRows] = useState<CsvRow[]>([])
  const [importing, setImporting] = useState(false)
  const [importProgress, setImportProgress] = useState<{ done: number; total: number } | null>(null)
  const [importResult, setImportResult] = useState<{ ok: number; failed: CsvRow[] } | null>(null)

  async function addPrompt(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) { showToast('Prompt text required', false); return }
    setAdding(true)
    const prompt_id = genId(cat, diff)
    const forbidden_words = forbidden.split(',').map(w => w.trim()).filter(Boolean)
    const { error } = await supabase.from('prompts').insert({
      prompt_id,
      category_id: cat,
      difficulty: diff,
      is_active: true,
      is_daily_eligible: eligible,
      is_family_friendly: family,
      notes: notes || null,
      payload: { text: text.trim(), forbidden_words },
    })
    setAdding(false)
    if (error) { showToast('Insert failed: ' + error.message, false); return }
    setLastAdded(text.trim())
    showToast(`✓ Prompt added: ${text.trim()}`)
    setText(''); setForbidden(''); setNotes(''); setEligible(false); setFamily(true)
  }

  function onCsvFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const rows = parseCsv(ev.target?.result as string)
      setCsvRows(rows)
      setImportResult(null)
    }
    reader.readAsText(file)
  }

  async function runImport() {
    setImporting(true)
    setImportProgress({ done: 0, total: csvRows.length })
    const failed: CsvRow[] = []
    let ok = 0
    for (let i = 0; i < csvRows.length; i++) {
      const row = csvRows[i]
      if (row._error) { failed.push(row); setImportProgress({ done: i + 1, total: csvRows.length }); continue }
      const prompt_id = genId(row.category_id, row.difficulty)
      const { error } = await supabase.from('prompts').insert({
        prompt_id,
        category_id: row.category_id,
        difficulty: row.difficulty,
        is_active: true,
        is_daily_eligible: row.is_daily_eligible,
        is_family_friendly: true,
        payload: { text: row.text, forbidden_words: row.forbidden_words ?? [] },
      })
      if (error) failed.push({ ...row, _error: error.message })
      else ok++
      setImportProgress({ done: i + 1, total: csvRows.length })
    }
    setImporting(false)
    setImportResult({ ok, failed })
    showToast(`✓ ${ok} imported, ${failed.length} failed`, failed.length === 0)
  }

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '2rem', display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
      {/* LEFT — Single prompt */}
      <div style={CARD}>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', color: '#22c55e', textTransform: 'uppercase', marginBottom: '1.25rem' }}>Add Prompt</div>
        <form onSubmit={addPrompt} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <label>
            <span style={LABEL_STYLE}>Prompt Text *</span>
            <input value={text} onChange={e => setText(e.target.value)} required placeholder="Enter prompt text…" style={INPUT} />
          </label>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <label style={{ flex: 1 }}>
              <span style={LABEL_STYLE}>Category</span>
              <select value={cat} onChange={e => setCat(e.target.value)} style={{ ...INPUT, cursor: 'pointer' }}>
                {CATEGORIES_ALL.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label style={{ width: 120 }}>
              <span style={LABEL_STYLE}>Difficulty</span>
              <select value={diff} onChange={e => setDiff(Number(e.target.value))} style={{ ...INPUT, cursor: 'pointer' }}>
                {[0, 1, 2, 3].map(d => <option key={d} value={d}>{DIFF_LABEL[d]}</option>)}
              </select>
            </label>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#c8d8c8', cursor: 'pointer' }}>
              <input type="checkbox" checked={eligible} onChange={e => setEligible(e.target.checked)} />
              Daily eligible
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#c8d8c8', cursor: 'pointer' }}>
              <input type="checkbox" checked={family} onChange={e => setFamily(e.target.checked)} />
              Family friendly
            </label>
          </div>
          <label>
            <span style={LABEL_STYLE}>Forbidden Words (comma-separated)</span>
            <input value={forbidden} onChange={e => setForbidden(e.target.value)} placeholder="e.g. soccer, football" style={INPUT} />
          </label>
          <label>
            <span style={LABEL_STYLE}>Notes (optional)</span>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} style={{ ...INPUT, resize: 'vertical' }} />
          </label>
          <button type="submit" disabled={adding} style={{ background: '#22c55e', border: 'none', borderRadius: 8, padding: '0.55rem 1.2rem', color: '#000', cursor: adding ? 'not-allowed' : 'pointer', fontFamily: 'Lexend, sans-serif', fontSize: '0.85rem', fontWeight: 900, opacity: adding ? 0.6 : 1, alignSelf: 'flex-start' }}>
            {adding ? 'Adding…' : 'Add Prompt'}
          </button>
          {lastAdded && <div style={{ fontSize: '0.78rem', color: '#22c55e' }}>✓ Added: {lastAdded}</div>}
        </form>
      </div>

      {/* RIGHT — CSV Bulk Import */}
      <div style={CARD}>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', color: '#22c55e', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Bulk Import</div>
        <p style={{ fontSize: '0.78rem', color: '#52525b', marginBottom: '1rem', lineHeight: 1.5 }}>
          Upload a CSV with columns: <code style={{ color: '#c8d8c8' }}>text, category_id, difficulty, is_daily_eligible, forbidden_words</code>
        </p>
        <input type="file" accept=".csv" onChange={onCsvFile} style={{ marginBottom: '1rem', fontSize: '0.8rem', color: '#c8d8c8' }} />

        {csvRows.length > 0 && !importResult && (
          <>
            <div style={{ fontSize: '0.72rem', color: '#52525b', marginBottom: '0.5rem' }}>Preview (first 10 of {csvRows.length} rows):</div>
            <div style={{ background: '#0a0f0a', border: '1px solid #1a2e1a', borderRadius: 8, overflow: 'hidden', marginBottom: '1rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                <thead>
                  <tr style={{ background: '#0d1710' }}>
                    {['Text', 'Category', 'Diff', 'Eligible', 'Status'].map(h => (
                      <th key={h} style={{ padding: '0.35rem 0.5rem', textAlign: 'left', color: '#4a7a4a', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.62rem' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvRows.slice(0, 10).map((row, i) => (
                    <tr key={i}>
                      <td style={{ padding: '0.3rem 0.5rem', color: '#c8d8c8', borderTop: '1px solid #1a2e1a', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.text}</td>
                      <td style={{ padding: '0.3rem 0.5rem', color: '#52525b', borderTop: '1px solid #1a2e1a' }}>{row.category_id}</td>
                      <td style={{ padding: '0.3rem 0.5rem', color: '#52525b', borderTop: '1px solid #1a2e1a' }}>{row.difficulty}</td>
                      <td style={{ padding: '0.3rem 0.5rem', color: row.is_daily_eligible ? '#22c55e' : '#52525b', borderTop: '1px solid #1a2e1a' }}>{row.is_daily_eligible ? '✓' : '—'}</td>
                      <td style={{ padding: '0.3rem 0.5rem', borderTop: '1px solid #1a2e1a', color: row._error ? '#ef4444' : '#22c55e' }}>{row._error ?? 'OK'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!importing && (
              <button onClick={runImport} style={{ background: '#22c55e', border: 'none', borderRadius: 8, padding: '0.5rem 1.2rem', color: '#000', cursor: 'pointer', fontFamily: 'Lexend, sans-serif', fontSize: '0.85rem', fontWeight: 900 }}>
                Import {csvRows.length} prompts
              </button>
            )}
          </>
        )}

        {importing && importProgress && (
          <div style={{ fontSize: '0.82rem', color: '#22c55e' }}>Importing… {importProgress.done} of {importProgress.total}</div>
        )}

        {importResult && (
          <div>
            <div style={{ fontSize: '0.85rem', color: importResult.failed.length === 0 ? '#22c55e' : '#eab308', fontWeight: 700, marginBottom: '0.5rem' }}>
              ✓ {importResult.ok} imported, {importResult.failed.length} failed
            </div>
            {importResult.failed.length > 0 && (
              <div style={{ fontSize: '0.75rem', color: '#ef4444' }}>
                {importResult.failed.map((r, i) => <div key={i}>{r.text || '(blank)'} — {r._error}</div>)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
