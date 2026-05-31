'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../lib/supabase'

type TileState = null | 'blue' | 'green' | 'yellow' | 'red'
type TvPhase   = 'on'

const SLIDE_TEXTS = [
  'GUESSMA',
  'THE NEWEST AT-HOME GAMESHOW',
  'MADE FOR ALL AGES — PLAY WITH FAMILY AND FRIENDS',
  'IN YOUR BROWSER OR ON THE BIG SCREEN',
  'PLAY OUR DAILY GAME!',
]
const DOT_LABELS = ['1', '2', '3', '4', '5', 'BONUS']

function tileHex(s: TileState): string {
  if (s === 'green')  return '#22c55e'
  if (s === 'red')    return '#ef4444'
  if (s === 'yellow') return '#eab308'
  if (s === 'blue')   return '#3b82f6'
  return '#3f3f46'
}

export default function HeroCarousel() {
  const router   = useRouter()
  const supabase = createClient()

  // ── TV turn-on ──────────────────────────────────────────────────────────
  const [tvPhase, setTvPhase] = useState<TvPhase>('on')

  // ── Game state ──────────────────────────────────────────────────────────
  const [dotStates, setDotStates]         = useState<TileState[]>(Array(6).fill(null))
  const [primaryQueue, setPrimaryQueue]   = useState([0, 1, 2, 3, 4])
  const [skipQueue, setSkipQueue]         = useState<number[]>([])
  const [inSkipPhase, setInSkipPhase]     = useState(false)
  const [showBonus, setShowBonus]         = useState(false)
  const [bonusUnlocked, setBonusUnlocked] = useState(false)
  const [bonusComplete, setBonusComplete] = useState(false)
  const [carouselDone, setCarouselDone]   = useState(false)
  const [signupCount, setSignupCount]     = useState(0)
  const [alreadyClaimed, setAlreadyClaimed] = useState(false)

  // ── Auth ────────────────────────────────────────────────────────────────
  const [user, setUser]       = useState<any>(null)
  const [account, setAccount] = useState<any>(null)

  // ── Karma animation ─────────────────────────────────────────────────────
  const [showKarmaAnim, setShowKarmaAnim] = useState(false)
  const [karmaCounter, setKarmaCounter]   = useState(0)
  const karmaTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Derived ─────────────────────────────────────────────────────────────
  const currentIndex = showBonus ? 5 : inSkipPhase ? skipQueue[0] : primaryQueue[0]
  const canSkip      = !showBonus && (primaryQueue.length + skipQueue.length) > 1
  const slideText    = showBonus ? '' : (SLIDE_TEXTS[currentIndex] ?? '')
  const isDone       = bonusComplete || carouselDone

  // Mark first tile blue on mount
  useEffect(() => {
    setDotStates(prev => prev.map((s, i) => i === 0 ? 'blue' : s))
  }, [])

  // ── Auth on mount ────────────────────────────────────────────────────────
  useEffect(() => {
    async function loadAuth() {
      try {
        const { data: { user: u } } = await supabase.auth.getUser()
        setUser(u)
        if (u) {
          const { data: acc } = await supabase
            .from('accounts').select('id, display_name, username, karma_lifetime, welcome_bonus_shown').eq('id', u.id).single()
          setAccount(acc)

          const params = new URLSearchParams(window.location.search)
          if (params.get('welcome') === 'true' && acc && !acc.welcome_bonus_shown) {
            setKarmaCounter(0)
            setShowKarmaAnim(true)
            let count = 0
            const iv = setInterval(() => {
              count += 5
              setKarmaCounter(Math.min(count, 125))
              if (count >= 125) clearInterval(iv)
            }, 80)
            setTimeout(async () => {
              try { await supabase.from('accounts').update({ welcome_bonus_shown: true }).eq('id', u.id) } catch (_) {}
            }, 2500)
            karmaTimerRef.current = setTimeout(() => setShowKarmaAnim(false), 4000)
          }
        }
      } catch (_) {}
    }
    loadAuth()
    return () => { if (karmaTimerRef.current) clearTimeout(karmaTimerRef.current) }
  }, [])

  // ── Live counter (refresh every 30s) ─────────────────────────────────────
  useEffect(() => {
    async function fetchCount() {
      try {
        const { data } = await supabase.rpc('get_signup_count')
        if (typeof data === 'number') setSignupCount(data)
      } catch (_) {}
    }
    fetchCount()
    const id = setInterval(fetchCount, 30_000)
    return () => clearInterval(id)
  }, [])

  // ── Advance after CORRECT / INCORRECT ────────────────────────────────────
  function advanceAfterAction(newDots: TileState[]): void {
    const newPrimary = inSkipPhase ? primaryQueue : primaryQueue.slice(1)
    const newSkip    = inSkipPhase ? skipQueue.slice(1) : skipQueue
    let   newInSkip  = inSkipPhase
    if (newPrimary.length === 0 && newSkip.length > 0) newInSkip = true

    const bothEmpty = newPrimary.length === 0 && newSkip.length === 0
    const allGreen  = bothEmpty && newDots.slice(0, 5).every(s => s === 'green')

    const nextIdx = newInSkip ? newSkip[0] : newPrimary[0]
    if (nextIdx !== undefined) newDots[nextIdx] = 'blue'
    if (bothEmpty && allGreen) newDots[5] = 'blue'

    setDotStates([...newDots])
    setPrimaryQueue(newPrimary)
    setSkipQueue(newSkip)
    setInSkipPhase(newInSkip)

    if (bothEmpty) {
      if (allGreen) { setShowBonus(true); setBonusUnlocked(true) }
      else setCarouselDone(true)
    }
  }

  // ── Action handlers ───────────────────────────────────────────────────────
  async function handleCorrect() {
    if (showBonus) {
      if (!bonusUnlocked) return
      if (!user) { router.push('/signup?bonus=unlocked'); return }
      try {
        const { data: existingRedemption } = await supabase
          .from('locker_code_redemptions').select('id').eq('account_id', account?.id).limit(1)
        const { data: acc } = await supabase
          .from('accounts').select('full_game_unlocked').eq('id', account?.id).single()
        if (acc?.full_game_unlocked || (existingRedemption && existingRedemption.length > 0)) {
          setAlreadyClaimed(true)
          setBonusComplete(true)
          return
        }
        setBonusComplete(true)
      } catch (_) { setBonusComplete(true) }
      return
    }
    const idx = inSkipPhase ? skipQueue[0] : primaryQueue[0]
    if (idx === undefined) return
    const newDots = dotStates.map((s, i) => i === idx ? 'green' : s) as TileState[]
    advanceAfterAction(newDots)
  }

  function handleSkip() {
    if (!canSkip || showBonus) return
    const idx = inSkipPhase ? skipQueue[0] : primaryQueue[0]
    if (idx === undefined) return

    const newDots = dotStates.map((s, i) => i === idx ? 'yellow' : s) as TileState[]
    let newPrimary: number[]
    let newSkip: number[]
    let newInSkip = inSkipPhase

    if (!inSkipPhase) {
      newPrimary = primaryQueue.slice(1)
      newSkip    = [...skipQueue, idx]
    } else {
      newPrimary = primaryQueue
      newSkip    = [...skipQueue.slice(1), idx]
    }
    if (newPrimary.length === 0 && newSkip.length > 0) newInSkip = true

    const nextIdx = newInSkip ? newSkip[0] : newPrimary[0]
    if (nextIdx !== undefined) newDots[nextIdx] = 'blue'

    setDotStates([...newDots])
    setPrimaryQueue(newPrimary)
    setSkipQueue(newSkip)
    setInSkipPhase(newInSkip)
  }

  function handleIncorrect() {
    if (showBonus) return
    const idx = inSkipPhase ? skipQueue[0] : primaryQueue[0]
    if (idx === undefined) return
    const newDots = dotStates.map((s, i) => i === idx ? 'red' : s) as TileState[]
    advanceAfterAction(newDots)
  }

  function reset() {
    const freshDots: TileState[] = Array(6).fill(null)
    freshDots[0] = 'blue'
    setDotStates(freshDots)
    setPrimaryQueue([0, 1, 2, 3, 4])
    setSkipQueue([])
    setInSkipPhase(false)
    setShowBonus(false)
    setBonusUnlocked(false)
    setBonusComplete(false)
    setCarouselDone(false)
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes tvFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes bonusPulse {
          0%, 100% { outline-color: #eab308; box-shadow: 0 0 4px #eab30870; }
          50%      { outline-color: #fde047; box-shadow: 0 0 10px #eab308b0; }
        }
      `}</style>

      {/* ── Fullscreen wall ─────────────────────────────────────────────── */}
      <section style={{
        width: '100vw',
        height: 'calc(100vh - 64px)',
        marginTop: '64px',
        background: '#0a2e1a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        padding: '1.5rem',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}>

        {/* Karma animation overlay */}
        {showKarmaAnim && (
          <div
            onClick={() => setShowKarmaAnim(false)}
            style={{
              position: 'absolute', inset: 0, zIndex: 50,
              background: 'rgba(0,0,0,0.9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <div style={{
              background: '#13131a', border: '1px solid #3f3f46',
              borderRadius: '1.5rem', padding: '3rem',
              textAlign: 'center', maxWidth: '380px',
            }}>
              <p style={{ color: 'white', fontSize: '1.6rem', fontWeight: 900, margin: '0 0 1rem' }}>
                Welcome to GUESSMA!
              </p>
              <p style={{
                fontSize: '4rem', fontWeight: 900,
                color: '#f5c842', margin: '0 0 0.5rem', lineHeight: 1,
              }}>
                +{karmaCounter}
              </p>
              <p style={{ color: '#71717a', fontSize: '0.95rem', margin: 0 }}>
                karma added to your account
              </p>
            </div>
          </div>
        )}

        {/* ── TV outer bezel ─────────────────────────────────────────────── */}
        <div style={{
          width: 'min(calc((100vh - 64px - 3rem) * 16/9), calc(100vw - 3rem))',
          aspectRatio: '16 / 9',
          background: '#111111',
          borderRadius: '12px',
          padding: '10px',
          boxShadow: '0 0 60px rgba(34,197,94,0.25), 0 0 120px rgba(34,197,94,0.1), 0 25px 80px rgba(0,0,0,0.85), 0 0 0 1px #166534',
          boxSizing: 'border-box',
          flexShrink: 0,
        }}>

          {/* Inner bezel */}
          <div style={{
            width: '100%', height: '100%',
            background: '#0a0a0a',
            borderRadius: '6px',
            overflow: 'hidden',
            border: '4px solid #0a0a0a',
            boxSizing: 'border-box',
          }}>

            {/* ── Screen content by phase ────────────────────────────────── */}

            {/* Slideshow content */}
            {tvPhase === 'on' && (
              <div style={{
                width: '100%', height: '100%',
                background: '#0a1628',
                display: 'flex', flexDirection: 'column',
                animation: 'tvFadeIn 0.6s ease-out',
              }}>

                {/* Screen content wrapper — 85% width, centered */}
                <div style={{
                  width: '85%', margin: '0 auto',
                  flex: 1, display: 'flex', flexDirection: 'column',
                  minHeight: 0,
                  containerType: 'inline-size',
                }}>

                  {/* Prompt area */}
                  <div style={{
                    flex: 1, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    padding: '1rem 0',
                    textAlign: 'center',
                  }}>
                    {isDone ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        {bonusComplete && (
                          <p style={{ color: '#22c55e', fontSize: 'clamp(0.75rem, 2vw, 1rem)', fontWeight: 700, margin: 0 }}>
                            {alreadyClaimed
                              ? "You've already claimed this bonus. Check your email for your code."
                              : '🎉 Bonus claimed! Check your email for your redemption code.'}
                          </p>
                        )}
                        {carouselDone && (
                          <p style={{ color: '#71717a', fontSize: 'clamp(0.75rem, 2vw, 1rem)', fontWeight: 700, margin: 0 }}>
                            Not quite — want to try again?
                          </p>
                        )}
                        <button
                          onClick={reset}
                          style={{
                            background: '#16a34a', color: 'white', border: 'none',
                            borderRadius: '0.6rem', padding: '0.6rem 1.5rem',
                            fontWeight: 900, fontSize: 'clamp(0.7rem, 1.8vw, 0.85rem)',
                            textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer',
                          }}
                        >
                          ↺ Play Again
                        </button>
                      </div>
                    ) : showBonus ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                        <p style={{
                          fontSize: 'clamp(0.55rem, 1.2vw, 0.75rem)',
                          color: '#22c55e', fontWeight: 700,
                          textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0,
                        }}>
                          BONUS ROUND
                        </p>
                        <p style={{
                          fontSize: 'clamp(2rem, 7cqw, 4rem)',
                          fontWeight: 900, textTransform: 'uppercase',
                          color: 'white', margin: 0, lineHeight: 1.15,
                        }}>
                          {1000 - signupCount} SPOTS REMAINING
                        </p>
                        <p style={{
                          fontSize: 'clamp(0.55rem, 1.2vw, 0.75rem)',
                          color: '#52525b', margin: 0,
                        }}>
                          First 1,000 signups get the full game free
                        </p>
                      </div>
                    ) : (
                      <p style={{
                        fontSize: 'clamp(2rem, 7cqw, 4rem)',
                        fontWeight: 900, textTransform: 'uppercase',
                        color: 'white', margin: 0, lineHeight: 1.15,
                      }}>
                        {slideText}
                      </p>
                    )}
                  </div>

                  {/* Progress bar + buttons */}
                  {!isDone && (
                    <div style={{ flexShrink: 0, paddingBottom: 'clamp(0.5rem, 1.5vw, 1rem)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>

                      {/* 6-tile bar */}
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.3rem' }}>
                        {dotStates.map((s, i) => {
                          const isCurrent = i === currentIndex
                          const label     = DOT_LABELS[i]
                          const bonusGlow = i === 5 && bonusUnlocked && !bonusComplete
                          return (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.1rem' }}>
                              <span style={{ fontSize: 'clamp(0.4rem, 0.8vw, 0.55rem)', opacity: isCurrent ? 1 : 0, lineHeight: 1, color: 'white' }}>▼</span>
                              <div style={{
                                width: '100%', height: '20px', borderRadius: '0.25rem',
                                background: tileHex(s), transition: 'background 0.2s',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                outline: bonusGlow ? '2px solid #eab308' : 'none',
                                animation: bonusGlow ? 'bonusPulse 1.2s ease-in-out infinite' : 'none',
                              }}>
                                <span style={{
                                  fontSize: label === 'BONUS' ? 'clamp(0.4rem, 0.9vw, 0.6rem)' : 'clamp(0.55rem, 1.1vw, 0.75rem)',
                                  fontWeight: 900, color: '#fff',
                                  letterSpacing: label === 'BONUS' ? '-0.03em' : 'normal',
                                }}>
                                  {label}
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* Buttons */}
                      <div style={{ display: 'flex', gap: '0.3rem' }}>
                        {showBonus ? (
                          <button
                            onClick={handleCorrect}
                            disabled={!bonusUnlocked}
                            style={{
                              flex: 1, height: '3.5rem',
                              fontSize: 'clamp(0.6rem, 1.4vw, 0.85rem)',
                              background: bonusUnlocked ? '#15803d' : '#14532d',
                              color: 'white', border: 'none', borderRadius: '0.6rem',
                              fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em',
                              cursor: bonusUnlocked ? 'pointer' : 'not-allowed',
                              opacity: bonusUnlocked ? 1 : 0.5,
                            }}
                          >
                            {bonusUnlocked ? '★ CLAIM BONUS' : 'COMPLETE ALL 5 FIRST'}
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={handleCorrect}
                              style={{
                                flex: 1, height: '3.5rem',
                                fontSize: 'clamp(0.6rem, 1.4vw, 0.85rem)',
                                background: '#15803d', color: 'white', border: 'none',
                                borderRadius: '0.6rem', fontWeight: 900,
                                textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer',
                              }}
                            >
                              ✓ CORRECT
                            </button>
                            <button
                              onClick={handleSkip}
                              disabled={!canSkip}
                              style={{
                                flex: 1, height: '3.5rem',
                                fontSize: 'clamp(0.6rem, 1.4vw, 0.85rem)',
                                background: '#a16207', color: 'white', border: 'none',
                                borderRadius: '0.6rem', fontWeight: 900,
                                textTransform: 'uppercase', letterSpacing: '0.06em',
                                cursor: canSkip ? 'pointer' : 'not-allowed',
                                opacity: canSkip ? 1 : 0.4,
                              }}
                            >
                              → SKIP
                            </button>
                            <button
                              onClick={handleIncorrect}
                              style={{
                                flex: 1, height: '3.5rem',
                                fontSize: 'clamp(0.6rem, 1.4vw, 0.85rem)',
                                background: '#b91c1c', color: 'white', border: 'none',
                                borderRadius: '0.6rem', fontWeight: 900,
                                textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer',
                              }}
                            >
                              ✗ INCORRECT
                            </button>
                          </>
                        )}
                      </div>

                    </div>
                  )}

                </div>
              </div>
            )}

          </div>
        </div>
      </section>
    </>
  )
}
