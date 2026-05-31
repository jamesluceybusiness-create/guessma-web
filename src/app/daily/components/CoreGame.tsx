'use client'

import { useEffect, useRef, useState } from 'react'
import type { GameState, DotState } from '../types'
import { diffPts, diffBonus } from '../types'
import Nav from '../../components/Nav'

interface Props {
  gs: GameState
  update: (partial: Partial<GameState>) => void
}

const TIMER_DURATION = 60

const CATEGORY_LABELS: Record<string, string> = {
  core_sports: 'Sports',
  core_food: 'Food',
  core_groups: 'Groups',
  core_wabws: 'What A Blank Would Say',
  core_actitout: 'Act It Out',
}

const DIFFICULTY_LABELS: Record<number, string> = {
  0: 'Easy', 1: 'Medium', 2: 'Hard', 3: 'Expert',
}

export default function CoreGame({ gs, update }: Props) {
  const hostName = gs.hostAccount?.display_name || 'You'
  const partnerName = gs.partnerAccount?.display_name || 'Guest'
  const hinterName = gs.hinterRole === 'host' ? hostName : partnerName
  const guesserName = gs.hinterRole === 'host' ? partnerName : hostName

  const prompts = gs.corePrompts
  const difficulty = gs.schedule?.core_difficulty ?? 0
  const pts = diffPts(difficulty)
  const bonusPts = diffBonus(difficulty)

  const categoryLabel = CATEGORY_LABELS[gs.schedule?.core_category_id ?? ''] ?? 'Core Round'
  const difficultyLabel = DIFFICULTY_LABELS[difficulty] ?? 'Easy'

  const [primaryQueue, setPrimaryQueue] = useState<number[]>(Array.from({ length: Math.min(prompts.length, 5) }, (_, i) => i))
  const [skipQueue, setSkipQueue] = useState<number[]>([])
  const [inSkipPhase, setInSkipPhase] = useState(false)
  const [showBonus, setShowBonus] = useState(false)
  const [bonusDone, setBonusDone] = useState(false)
  const [roundOver, setRoundOver] = useState(false)

  const [dotStates, setDotStates] = useState<DotState[]>(Array(6).fill(null))
  const dotStatesRef = useRef<DotState[]>(Array(6).fill(null))

  const [hostScore, setHostScore] = useState(gs.hostScore)
  const [partnerScore, setPartnerScore] = useState(gs.partnerScore)

  const finalHostScoreRef = useRef(gs.hostScore)
  const finalPartnerScoreRef = useRef(gs.partnerScore)
  const finalDotsRef = useRef<DotState[]>(Array(6).fill(null))

  const promptShownAtRef = useRef<number>(Date.now())
  const promptTimingsRef = useRef<Array<{
    promptId: string
    timeMs: number
    wasCorrect: boolean
    wasSkipped: boolean
    slot: number
  }>>([])

  useEffect(() => { finalHostScoreRef.current = hostScore }, [hostScore])
  useEffect(() => { finalPartnerScoreRef.current = partnerScore }, [partnerScore])

  const [timer, setTimer] = useState(TIMER_DURATION)
  const timerRef = useRef(TIMER_DURATION)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const doneRef = useRef(false)

  const currentQueue = inSkipPhase ? skipQueue : primaryQueue
  const activeIdx = currentQueue[0] ?? null
  const activePrompt = showBonus ? (prompts[5] ?? null) : (activeIdx !== null ? prompts[activeIdx] : null)

  function clearTimer() {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
  }

  function finishRound() {
    if (doneRef.current) return
    doneRef.current = true
    clearTimer()
    const finalDots = [...dotStatesRef.current]
    if (activeIdx !== null && activeIdx < 6 && finalDots[activeIdx] === null) {
      finalDots[activeIdx] = 'gray'
    }
    dotStatesRef.current = finalDots
    setDotStates([...finalDots])
    setRoundOver(true)
    finalDotsRef.current = finalDots
    finalHostScoreRef.current = hostScore
    finalPartnerScoreRef.current = partnerScore
  }

  useEffect(() => {
    if (prompts.length > 0) markDot(0, 'blue')
    promptShownAtRef.current = Date.now()
    timerRef.current = TIMER_DURATION
    intervalRef.current = setInterval(() => {
      timerRef.current -= 1
      setTimer(timerRef.current)
      if (timerRef.current <= 0) {
        clearTimer()
        finishRound()
      }
    }, 1000)
    return () => clearTimer()
  }, [])

  function markDot(slot: number, state: DotState) {
    const next = [...dotStatesRef.current]
    next[slot] = state
    dotStatesRef.current = next
    setDotStates([...next])
  }

  function advanceQueue(result: 'correct' | 'skip' | 'incorrect') {
    if (doneRef.current) return

    if (showBonus) {
      if (result === 'correct') {
        markDot(5, 'green')
        if (gs.hinterRole === 'host') setHostScore(s => s + bonusPts)
        else setPartnerScore(s => s + bonusPts)
      } else {
        markDot(5, result === 'incorrect' ? 'red' : 'gray')
      }
      setBonusDone(true)
      setShowBonus(false)
      finishRound()
      return
    }

    const slot = activeIdx!
    const timeMs = Date.now() - promptShownAtRef.current
    promptTimingsRef.current.push({
      promptId: prompts[slot]?.prompt_id ?? '',
      timeMs,
      wasCorrect: result === 'correct',
      wasSkipped: result === 'skip',
      slot,
    })

    if (!inSkipPhase) {
      const newPrimary = primaryQueue.slice(1)
      const newSkips = result === 'skip' ? [...skipQueue, activeIdx!] : skipQueue

      if (newPrimary.length === 0) {
        if (newSkips.length > 0) {
          if (result === 'correct') {
            markDot(slot, 'green')
            if (gs.hinterRole === 'host') setHostScore(s => s + pts)
            else setPartnerScore(s => s + pts)
          } else if (result === 'incorrect') {
            markDot(slot, 'red')
          } else {
            markDot(slot, 'yellow')
          }
          setPrimaryQueue([])
          setSkipQueue(newSkips)
          setInSkipPhase(true)
          markDot(newSkips[0], 'blue')
          promptShownAtRef.current = Date.now()
        } else {
          if (result === 'correct') {
            markDot(slot, 'green')
            if (gs.hinterRole === 'host') setHostScore(s => s + pts)
            else setPartnerScore(s => s + pts)
          } else if (result === 'incorrect') {
            markDot(slot, 'red')
          } else {
            markDot(slot, 'yellow')
          }
          setPrimaryQueue([])
          setSkipQueue([])
          checkBonus([...dotStatesRef.current])
        }
      } else {
        if (result === 'correct') {
          markDot(slot, 'green')
          if (gs.hinterRole === 'host') setHostScore(s => s + pts)
          else setPartnerScore(s => s + pts)
        } else if (result === 'incorrect') {
          markDot(slot, 'red')
        } else {
          markDot(slot, 'yellow')
        }
        setPrimaryQueue(newPrimary)
        setSkipQueue(newSkips)
        markDot(newPrimary[0], 'blue')
        promptShownAtRef.current = Date.now()
      }
    } else {
      // in skip phase
      if (result === 'skip') {
        markDot(slot, 'yellow')
        const rotated = [...skipQueue.slice(1), skipQueue[0]]
        setSkipQueue(rotated)
        markDot(rotated[0], 'blue')
        promptShownAtRef.current = Date.now()
        return
      }

      if (result === 'correct') {
        markDot(slot, 'green')
        if (gs.hinterRole === 'host') setHostScore(s => s + pts)
        else setPartnerScore(s => s + pts)
      } else {
        markDot(slot, 'red')
      }

      const newSkip = skipQueue.slice(1)

      if (newSkip.length === 0) {
        setSkipQueue([])
        setInSkipPhase(false)
        checkBonus([...dotStatesRef.current])
      } else {
        setSkipQueue(newSkip)
        markDot(newSkip[0], 'blue')
        promptShownAtRef.current = Date.now()
      }
    }
  }

  function checkBonus(currentDots?: DotState[]) {
    const dots = currentDots ?? dotStatesRef.current
    const allFiveGreen =
      dots[0] === 'green' &&
      dots[1] === 'green' &&
      dots[2] === 'green' &&
      dots[3] === 'green' &&
      dots[4] === 'green'

    if (allFiveGreen) {
      setShowBonus(true)
      const next = [...dots]
      next[5] = 'blue'
      dotStatesRef.current = next
      setDotStates([...next])
      promptShownAtRef.current = Date.now()
      clearTimer()
    } else {
      finishRound()
    }
  }

  function handleSeeResults() {
    update({
      dotStates: finalDotsRef.current,
      hostScore: finalHostScoreRef.current,
      partnerScore: finalPartnerScoreRef.current,
      promptTimings: promptTimingsRef.current,
      phase: 'roundResults',
    })
  }

  const timerColor = timer > 20 ? '#22c55e' : timer > 10 ? '#eab308' : '#ef4444'

  const totalRemaining = primaryQueue.length + skipQueue.length
  const skipDimmed = showBonus || totalRemaining <= 1

  return (
    <>
      <Nav />
      <div style={{
        height: '100vh', overflow: 'hidden',
        background: '#0a0f0a', color: 'white',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: 'calc(64px + 1vh) 2vw 1vh',
      }}>
        <div style={{ maxWidth: 'min(860px, 92vw)', width: '100%', display: 'flex', flexDirection: 'column', gap: '1vh', flex: 1, minHeight: 0 }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '1.1rem', fontWeight: 900, lineHeight: 1.1, margin: '0 0 0.2rem' }}>
                {categoryLabel}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#4a7a4a', fontStyle: 'italic', margin: '0 0 0.35rem' }}>
                {difficultyLabel} · Daily Game
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>HINTER</span>
                <span style={{ padding: '0.18rem 0.75rem', fontSize: '0.82rem', fontWeight: 700, borderRadius: '999px', background: '#92400e', color: '#fde68a' }}>
                  {hinterName}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#52525b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>GUESSER</span>
                <span style={{ padding: '0.18rem 0.75rem', fontSize: '0.82rem', fontWeight: 700, borderRadius: '999px', background: '#3f3f46', color: 'white' }}>
                  {guesserName}
                </span>
              </div>
            </div>
            {/* Timer */}
            <div style={{
              width: 'clamp(4rem, 7vh, 6rem)', height: 'clamp(4rem, 7vh, 6rem)', borderRadius: '50%',
              border: `3px solid ${timerColor}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span style={{ fontSize: 'clamp(1.5rem, 4vh, 2.2rem)', fontWeight: 900, color: timerColor, lineHeight: 1 }}>{timer}</span>
            </div>
          </div>

          {/* Prompt card */}
          <div style={{
            background: '#0d1710', border: '1px solid #1a2e1a', borderRadius: '16px',
            padding: '3vh 2vw', flex: 1, minHeight: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            textAlign: 'center',
          }}>
            {activePrompt ? (
              <>
                {showBonus && (
                  <p style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.12em', color: '#eab308', textTransform: 'uppercase', margin: '0 0 1rem' }}>
                    BONUS · {bonusPts} pts
                  </p>
                )}
                <p style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 900, color: 'white', lineHeight: 1.1, margin: 0, textTransform: 'uppercase' }}>
                  {activePrompt.payload.text}
                </p>
                <p style={{ fontSize: '0.75rem', color: '#52525b', marginTop: '1rem', marginBottom: 0 }}>
                  {showBonus ? `Bonus · ${bonusPts} pts` : `${pts} pts`}
                </p>
              </>
            ) : (
              <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#52525b', margin: 0 }}>Waiting…</p>
            )}
          </div>

          {/* Progress tiles */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.4rem', width: '100%' }}>
            {Array.from({ length: 6 }, (_, i) => {
              const label = i === 5 ? 'BONUS' : String(i + 1)
              const state = dotStates[i]
              const isCurrent = i === (showBonus ? 5 : activeIdx)
              const color =
                state === 'green' ? '#22c55e' :
                state === 'red' ? '#ef4444' :
                state === 'yellow' ? '#eab308' :
                state === 'blue' ? '#3b82f6' :
                state === 'gray' ? '#52525b' :
                isCurrent ? '#3b82f6' :
                '#3f3f46'
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.15rem' }}>
                  <span style={{ fontSize: '0.6rem', opacity: isCurrent ? 1 : 0, color: 'white', lineHeight: 1 }}>▼</span>
                  <div style={{
                    width: '100%',
                    height: 'clamp(20px, 3vh, 32px)',
                    borderRadius: '0.35rem',
                    background: color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.2s',
                  }}>
                    <span style={{
                      fontSize: i === 5 ? '0.65rem' : '0.85rem',
                      fontWeight: 900,
                      color: 'white',
                      letterSpacing: i === 5 ? '-0.03em' : 'normal',
                    }}>
                      {label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Action buttons */}
          {activePrompt && !bonusDone && !roundOver && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <button
                onClick={() => advanceQueue('incorrect')}
                style={{
                  height: 'clamp(4rem, 8vh, 6rem)', borderRadius: '12px', border: 'none',
                  background: 'rgba(239,68,68,0.18)', color: '#f87171',
                  fontWeight: 800, fontSize: 'clamp(1rem, 2.5vh, 1.3rem)', cursor: 'pointer',
                  fontFamily: 'Lexend, sans-serif', textTransform: 'uppercase', letterSpacing: '0.06em',
                }}
              >
                ✗ Wrong
              </button>
              {!showBonus ? (
                <button
                  onClick={() => advanceQueue('skip')}
                  disabled={skipDimmed}
                  style={{
                    height: 'clamp(4rem, 8vh, 6rem)', borderRadius: '12px', border: 'none',
                    background: 'rgba(234,179,8,0.15)', color: '#fde68a',
                    fontWeight: 800, fontSize: 'clamp(1rem, 2.5vh, 1.3rem)',
                    cursor: skipDimmed ? 'not-allowed' : 'pointer',
                    pointerEvents: skipDimmed ? 'none' : 'auto',
                    fontFamily: 'Lexend, sans-serif', textTransform: 'uppercase', letterSpacing: '0.06em',
                    opacity: skipDimmed ? 0.35 : 1,
                  }}
                >
                  ⟳ Skip
                </button>
              ) : <div />}
              <button
                onClick={() => advanceQueue('correct')}
                style={{
                  height: 'clamp(4rem, 8vh, 6rem)', borderRadius: '12px', border: 'none',
                  background: '#16a34a', color: 'white',
                  fontWeight: 800, fontSize: '1.3rem', cursor: 'pointer',
                  fontFamily: 'Lexend, sans-serif', textTransform: 'uppercase', letterSpacing: '0.06em',
                }}
              >
                ✓ Correct
              </button>
            </div>
          )}

          {(roundOver || bonusDone) && (
            <button
              onClick={handleSeeResults}
              style={{
                width: '100%', height: 'clamp(3.5rem, 9vh, 6rem)', background: '#15803d', color: 'white',
                border: 'none', borderRadius: '12px', fontWeight: 900, fontSize: '1.1rem',
                cursor: 'pointer', fontFamily: 'Lexend, sans-serif', textTransform: 'uppercase', letterSpacing: '0.06em',
              }}
            >
              See Results →
            </button>
          )}

        </div>
      </div>
    </>
  )
}
