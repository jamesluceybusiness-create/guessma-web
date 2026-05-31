'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Nav from '../../components/Nav'
import type { GameState } from '../types'
import { DIFFICULTY_LABELS, CATEGORY_LABELS } from '../types'

interface Props {
  gs: GameState
  supabase: any
  update: (partial: Partial<GameState>) => void
}

function streakMultiplier(streak: number): number {
  if (streak >= 60) return 4
  if (streak >= 30) return 3
  if (streak >= 14) return 2
  if (streak >= 7) return 1.5
  return 1
}

function dotEmoji(state: string | null): string {
  if (state === 'green') return '🟩'
  if (state === 'red') return '🟥'
  if (state === 'yellow') return '🟨'
  if (state === 'gray') return '⬛'
  if (state === 'blue') return '🟦'
  return '⬜'
}

export default function FinalResults({ gs, supabase, update }: Props) {
  const [saving, setSaving] = useState(true)
  const [karmaEarned, setKarmaEarned] = useState(0)
  const [newStreak, setNewStreak] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const savedRef = useRef(false)

  const hostName = gs.hostAccount?.display_name || 'You'
  const partnerName = gs.partnerAccount?.display_name || 'Guest'

  const difficulty = gs.schedule?.core_difficulty ?? 0
  const categoryId = gs.schedule?.core_category_id ?? ''
  const diffLabel = DIFFICULTY_LABELS[difficulty] ?? 'Medium'
  const catLabel = CATEGORY_LABELS[categoryId] ?? categoryId

  const correctCount = gs.dotStates.slice(0, 5).filter(s => s === 'green').length
  const bonusCorrect = gs.dotStates[5] === 'green'
  const perfectRound = correctCount === 5
  const combinedScore = gs.hostScore + gs.partnerScore

  const today = new Date()
  const dateStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  useEffect(() => {
    if (savedRef.current) return
    savedRef.current = true
    saveResults()
  }, [])

  async function saveResults() {
    const todayStr = new Date().toISOString().split('T')[0]
    const hostUserId = gs.hostUser?.id
    let earnedKarma = 0
    let streak = 1

    if (hostUserId && gs.hostAccount) {
      try {
        const { data: stats } = await supabase
          .from('player_stats')
          .select('streak_current, streak_longest, games_played, last_game_date')
          .eq('user_id', hostUserId)
          .single()

        if (stats) {
          const lastDate = stats.last_game_date
          const yesterday = new Date()
          yesterday.setDate(yesterday.getDate() - 1)
          const yStr = yesterday.toISOString().split('T')[0]
          if (lastDate === todayStr) {
            streak = stats.streak_current
          } else if (lastDate === yStr) {
            streak = (stats.streak_current || 0) + 1
          } else {
            streak = 1
          }
        }
        setNewStreak(streak)

        const mult = streakMultiplier(streak)
        const base =
          15 +
          (gs.icebreakerWinner === 'host' ? 9 : 0) +
          (gs.partnerType === 'linked' ? 15 : 0) +
          correctCount * (difficulty + 1) * 3 +
          (bonusCorrect ? (difficulty + 1) * 15 : 0) +
          (perfectRound ? (difficulty + 1) * 15 : 0)

        earnedKarma = Math.round(base * mult)
        setKarmaEarned(earnedKarma)

        await supabase.from('daily_sessions').upsert({
          user_id: hostUserId,
          date: todayStr,
          partner_id: gs.partnerAccount?.id ?? null,
          partner_type: gs.partnerType,
          host_score: gs.hostScore,
          partner_score: gs.partnerScore,
          icebreaker_winner: gs.icebreakerWinner,
          category_id: categoryId,
          difficulty,
          karma_earned: earnedKarma,
        }, { onConflict: 'user_id,date' })

        await supabase.from('karma_log').insert({
          user_id: hostUserId,
          amount: earnedKarma,
          reason: `daily_game:${todayStr}`,
        })

        await supabase.from('accounts').update({
          karma_balance: (gs.hostAccount.karma_balance ?? 0) + earnedKarma,
          karma_lifetime: (gs.hostAccount.karma_lifetime ?? 0) + earnedKarma,
        }).eq('id', hostUserId)

        const newLongest = Math.max(stats?.streak_longest ?? 0, streak)
        await supabase.from('player_stats').upsert({
          user_id: hostUserId,
          streak_current: streak,
          streak_longest: newLongest,
          games_played: (stats?.games_played ?? 0) + 1,
          last_game_date: todayStr,
        }, { onConflict: 'user_id' })

        const usedRows = gs.corePrompts.map(p => ({
          user_id: hostUserId,
          prompt_id: p.prompt_id,
          date: todayStr,
        }))
        if (gs.icebreakerPrompt) {
          usedRows.push({ user_id: hostUserId, prompt_id: gs.icebreakerPrompt.prompt_id, date: todayStr })
        }
        await supabase.from('daily_used_prompts').upsert(usedRows, { onConflict: 'user_id,prompt_id' })

        update({ karmaEarned: earnedKarma, sessionComplete: true })
      } catch {
        // non-fatal
      }
    }

    if (hostUserId && gs.promptTimings && gs.promptTimings.length > 0) {
      const promptRows = gs.promptTimings.map(t => ({
        prompt_id: t.promptId,
        category_id: gs.schedule?.core_category_id ?? '',
        content_type: 'text',
        was_correct: t.wasCorrect,
        was_skipped: t.wasSkipped,
        difficulty: gs.schedule?.core_difficulty ?? 0,
        account_id: hostUserId,
        session_id: new Date().toISOString().split('T')[0],
        answered_at: new Date().toISOString(),
        time_to_answer_ms: t.timeMs,
        is_test: false,
      }))

      try {
        await supabase.from('prompt_answers').insert(promptRows)
      } catch (err) {
        console.error('[FinalResults] prompt_answers insert failed:', err)
      }
    }

    setSaving(false)
  }

  const shareLines = [
    `Guessma Daily · ${dateStr}`,
    `${catLabel} · ${diffLabel}`,
    '',
    `🧊 Icebreaker: ${gs.icebreakerWinner === 'host' ? hostName : gs.icebreakerWinner === 'partner' ? partnerName : 'Neither'}`,
    `⚡ Core: ${gs.dotStates.slice(0, 5).map(dotEmoji).join('')}${gs.dotStates[5] ? ' ' + dotEmoji(gs.dotStates[5]) : ''}`,
    '',
    `${hostName}: ${gs.hostScore}  ${partnerName}: ${gs.partnerScore}`,
    '',
    'Play at guessma.com',
  ].join('\n')

  function copyShare() {
    navigator.clipboard.writeText(shareLines).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const icebreakerWinnerName =
    gs.icebreakerWinner === 'host' ? hostName :
    gs.icebreakerWinner === 'partner' ? partnerName :
    'Neither'

  const icebreakerBadgeText =
    gs.icebreakerWinner === 'host' ? `🧊 ${hostName} took the icebreaker!` :
    gs.icebreakerWinner === 'partner' ? `🧊 ${partnerName} took the icebreaker!` :
    '🧊 Neither got the icebreaker'

  const resultBadge = (dotState: string | null) => {
    if (dotState === 'green') return { bg: 'rgba(34,197,94,0.15)', color: '#4ade80', label: '✓ Correct' }
    if (dotState === 'red') return { bg: 'rgba(239,68,68,0.15)', color: '#f87171', label: '✗ Wrong' }
    if (dotState === 'yellow') return { bg: 'rgba(234,179,8,0.15)', color: '#fde68a', label: '→ Skipped' }
    return { bg: 'rgba(82,82,91,0.2)', color: '#52525b', label: '— Not shown' }
  }

  return (
    <>
      <Nav />
      <div style={{
        height: '100vh', overflowY: 'auto',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        background: '#0a0f0a', color: 'white',
        padding: 'calc(64px + 2vh) 2vw 2vh',
      }}>
        <div style={{
          background: '#0d1710', border: '1px solid #1a2e1a', borderRadius: '16px',
          padding: 'clamp(1.5rem, 3vh, 2.5rem)', maxWidth: 'min(680px, 92vw)', width: '100%',
          display: 'flex', flexDirection: 'column', gap: '1.5vh',
        }}>

          {/* SECTION 1 — Header */}
          <div>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', color: '#22c55e', textTransform: 'uppercase', margin: '0 0 0.5rem' }}>
              Daily Complete · {dateStr}
            </p>
            <p style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 900, color: 'white', margin: '0 0 0.75rem', lineHeight: 1.1 }}>
              You scored {combinedScore} points together!
            </p>
            <span style={{
              display: 'inline-block',
              background: 'rgba(59,130,246,0.12)', border: '1px solid #3b82f6',
              color: '#93c5fd', borderRadius: '999px',
              padding: '0.35rem 0.9rem', fontSize: '0.85rem', fontWeight: 700,
            }}>
              {icebreakerBadgeText}
            </span>
          </div>

          {/* SECTION 2 — Player score cards */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {[
              { name: hostName, score: gs.hostScore },
              { name: partnerName, score: gs.partnerScore },
            ].map(({ name, score }) => (
              <div
                key={name}
                style={{
                  flex: 1, background: '#13131a',
                  border: '1px solid #27272a',
                  borderRadius: '12px', padding: '1rem',
                }}
              >
                <p style={{ fontSize: '0.7rem', color: '#52525b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.25rem' }}>
                  {name}
                </p>
                <p style={{ fontSize: '2rem', fontWeight: 900, color: 'white', margin: 0 }}>
                  {score} pts
                </p>
              </div>
            ))}
          </div>

          {/* SECTION 3 — Prompt breakdown table */}
          <div>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', color: '#22c55e', textTransform: 'uppercase', margin: '0 0 0.75rem' }}>
              How You Did
            </p>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {gs.corePrompts.slice(0, 5).map((prompt, i) => {
                const timing = gs.promptTimings?.find(t => t.slot === i)
                const badge = resultBadge(gs.dotStates[i])
                return (
                  <div
                    key={prompt.prompt_id}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '0.6rem 0',
                      borderBottom: '1px solid #1a2e1a',
                      gap: '0.75rem',
                    }}
                  >
                    <span style={{ flex: 1, color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>
                      {prompt.payload.text}
                    </span>
                    <span style={{
                      padding: '0.2rem 0.6rem', borderRadius: '999px',
                      background: badge.bg, color: badge.color,
                      fontSize: '0.78rem', fontWeight: 800, flexShrink: 0,
                    }}>
                      {badge.label}
                    </span>
                    <span style={{ fontSize: '0.82rem', color: '#52525b', flexShrink: 0, minWidth: '2.5rem', textAlign: 'right' }}>
                      {timing ? `${(timing.timeMs / 1000).toFixed(1)}s` : '—'}
                    </span>
                  </div>
                )
              })}

              {/* Bonus row */}
              <div style={{ marginTop: '0.75rem' }}>
                {gs.dotStates[5] === 'green' ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                    <span style={{ flex: 1, color: '#fde68a', fontWeight: 700, fontSize: '0.95rem' }}>
                      ⭐ BONUS — {gs.corePrompts[5]?.payload?.text ?? ''}
                    </span>
                    <span style={{
                      padding: '0.2rem 0.6rem', borderRadius: '999px',
                      background: 'rgba(234,179,8,0.15)', color: '#fde68a',
                      fontSize: '0.78rem', fontWeight: 800, flexShrink: 0,
                    }}>
                      ✓ Unlocked!
                    </span>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                      <span style={{ color: '#52525b', fontWeight: 700, fontSize: '0.95rem' }}>
                        ⭐ BONUS — Locked
                      </span>
                      <span style={{ color: '#3f3f46', fontSize: '0.78rem', flexShrink: 0 }}>
                        Get all 5 correct to unlock
                      </span>
                    </div>
                    {gs.corePrompts[5] && (
                      <p style={{ fontSize: '0.78rem', color: '#3f3f46', fontStyle: 'italic', margin: '0.35rem 0 0' }}>
                        The bonus was: {gs.corePrompts[5].payload.text}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 4 — Stats row */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '80px', background: '#13131a', border: '1px solid #27272a', borderRadius: '10px', padding: '0.6rem 0.75rem', textAlign: 'center' }}>
              <p style={{ fontSize: '0.6rem', color: '#52525b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.2rem' }}>Correct</p>
              <p style={{ fontSize: '1.2rem', fontWeight: 900, color: 'white', margin: 0 }}>{correctCount}/5</p>
            </div>
            <div style={{ flex: 1, minWidth: '80px', background: '#13131a', border: '1px solid #27272a', borderRadius: '10px', padding: '0.6rem 0.75rem', textAlign: 'center' }}>
              <p style={{ fontSize: '0.6rem', color: '#52525b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.2rem' }}>Icebreaker</p>
              <p style={{ fontSize: '1.1rem', fontWeight: 900, color: 'white', margin: 0, lineHeight: 1.2 }}>{icebreakerWinnerName}</p>
            </div>
            {newStreak !== null && (
              <div style={{ flex: 1, minWidth: '80px', background: '#13131a', border: '1px solid #27272a', borderRadius: '10px', padding: '0.6rem 0.75rem', textAlign: 'center' }}>
                <p style={{ fontSize: '0.6rem', color: '#52525b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.2rem' }}>Streak</p>
                <p style={{ fontSize: '1.2rem', fontWeight: 900, color: 'white', margin: 0 }}>{newStreak} 🔥</p>
              </div>
            )}
            <div style={{
              flex: 1, minWidth: '80px',
              background: karmaEarned > 0 ? 'rgba(34,197,94,0.1)' : '#13131a',
              border: karmaEarned > 0 ? '1px solid rgba(34,197,94,0.3)' : '1px solid #27272a',
              borderRadius: '10px', padding: '0.6rem 0.75rem', textAlign: 'center',
            }}>
              <p style={{ fontSize: '0.6rem', color: karmaEarned > 0 ? '#22c55e' : '#52525b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.2rem' }}>Karma</p>
              <p style={{ fontSize: '1.2rem', fontWeight: 900, color: karmaEarned > 0 ? '#4ade80' : '#52525b', margin: 0 }}>+{karmaEarned} ⚡</p>
            </div>
          </div>

          {/* SECTION 5 — Share button */}
          <button
            onClick={copyShare}
            style={{
              width: '100%', padding: '1rem', background: copied ? '#166534' : '#1a2e1a',
              color: copied ? '#4ade80' : '#22c55e', border: '1px solid #22c55e',
              borderRadius: '10px', fontWeight: 800, fontSize: '1rem',
              cursor: 'pointer', fontFamily: 'Lexend, sans-serif',
              transition: 'background 0.2s',
            }}
          >
            {copied ? '✓ Copied!' : '📋 Share Result'}
          </button>

          {/* SECTION 6 — Guest signup prompt */}
          {!gs.hostUser && (
            <div style={{ background: '#13131a', border: '1px solid #27272a', borderRadius: '12px', padding: '1rem 1.25rem', textAlign: 'center' }}>
              <p style={{ fontSize: '0.85rem', color: '#d4d4d8', margin: '0 0 0.75rem', lineHeight: 1.5 }}>
                Create an account to track your streak and earn karma!
              </p>
              <Link
                href="/signup"
                style={{
                  display: 'inline-block', padding: '0.5rem 1.5rem',
                  background: '#16a34a', color: 'white', borderRadius: '8px',
                  textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem',
                }}
              >
                Sign Up Free →
              </Link>
            </div>
          )}

          {saving && (
            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#3f3f46' }}>
              Saving results…
            </p>
          )}

          {/* SECTION 7 — Back to Home */}
          <Link
            href="/"
            style={{
              textAlign: 'center', fontSize: '0.8rem', color: '#4a7a4a',
              textDecoration: 'none', fontWeight: 600,
            }}
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </>
  )
}
