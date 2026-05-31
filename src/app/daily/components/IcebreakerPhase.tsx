'use client'

import { useEffect, useRef, useState } from 'react'
import type { GameState } from '../types'
import Nav from '../../components/Nav'

interface Props {
  gs: GameState
  update: (partial: Partial<GameState>) => void
}

const TURN_DURATION = 7

export default function IcebreakerPhase({ gs, update }: Props) {
  const [revealed, setRevealed] = useState(false)
  const [timer, setTimer] = useState(TURN_DURATION)
  const [timerExpired, setTimerExpired] = useState(false)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function clearTimer() {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
  }

  useEffect(() => () => clearTimer(), [])

  const imgSrc = gs.icebreakerPrompt?.payload?.image_ref
    ? `/${gs.icebreakerPrompt.payload.image_ref}`
    : null

  console.log('[IcebreakerPhase] imgSrc:', imgSrc)
  console.log('[IcebreakerPhase] payload:', gs.icebreakerPrompt?.payload)

  function handleReveal() {
    setRevealed(true)
    let t = TURN_DURATION
    intervalRef.current = setInterval(() => {
      t -= 1
      setTimer(t)
      if (t <= 0) {
        clearTimer()
        setTimerExpired(true)
        update({ phase: 'icebreakerResults' })
      }
    }, 1000)
  }

  function handleEndRound() {
    clearTimer()
    update({ phase: 'icebreakerResults' })
  }

  const timerColor = timer > 4 ? '#22c55e' : timer > 2 ? '#eab308' : '#ef4444'

  return (
    <div style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#0a0f0a', color: 'white' }}>
      <Nav />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1vh 2vw', paddingTop: 'calc(64px + 1vh)' }}>
        <div style={{
          background: '#0d1710', border: '1px solid #1a2e1a', borderRadius: '16px',
          padding: 'clamp(1.5rem, 2.5vh, 2rem)', width: '100%', maxWidth: 'min(900px, 92vw)',
          maxHeight: 'calc(100vh - 64px - 4vh)',
          display: 'flex', flexDirection: 'column', gap: '2vh',
        }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', color: '#22c55e', textTransform: 'uppercase', margin: 0, flexShrink: 0 }}>
            Icebreaker
          </p>

          {!revealed ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <p style={{ fontSize: 'clamp(1.8rem, 4vh, 2.5rem)', fontWeight: 700, color: 'white', marginBottom: '0.5rem', marginTop: 0 }}>
                Ready?
              </p>
              <p style={{ color: '#4a7a4a', fontSize: 'clamp(0.9rem, 2vh, 1.1rem)', marginBottom: '2rem', marginTop: 0 }}>
                Both players look at the screen together
              </p>
              <button
                onClick={handleReveal}
                style={{
                  height: 'clamp(3rem, 7vh, 5rem)', padding: '0 3rem', background: '#16a34a', color: 'white',
                  border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: 'clamp(1rem, 2vh, 1.2rem)',
                  cursor: 'pointer', fontFamily: 'Lexend, sans-serif', textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                REVEAL IMAGE →
              </button>
            </div>
          ) : (
            <>
              <div style={{
                flex: 1, minHeight: 0, borderRadius: '12px', overflow: 'hidden',
                background: '#0a0a0a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {imgSrc ? (
                  <img
                    src={imgSrc}
                    alt={`Country outline: ${gs.icebreakerPrompt?.payload?.answer}`}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                ) : gs.icebreakerPrompt?.payload?.text ? (
                  <p style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', fontWeight: 900, textAlign: 'center', color: 'white', padding: '1rem', margin: 0 }}>
                    {gs.icebreakerPrompt.payload.text}
                  </p>
                ) : null}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                <div style={{
                  width: 'clamp(4rem, 8vh, 6rem)', height: 'clamp(4rem, 8vh, 6rem)', borderRadius: '50%',
                  border: `3px solid ${timerColor}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <span style={{ fontSize: 'clamp(1.5rem, 4vh, 2.2rem)', fontWeight: 900, color: timerColor, lineHeight: 1 }}>
                    {timerExpired ? 0 : timer}
                  </span>
                </div>
                <button
                  onClick={handleEndRound}
                  style={{
                    flex: 1, height: 'clamp(3rem, 7vh, 5rem)', background: '#3f3f46', color: 'white',
                    border: 'none', borderRadius: '10px', fontWeight: 800, fontSize: 'clamp(1rem, 2vh, 1.2rem)',
                    cursor: 'pointer', fontFamily: 'Lexend, sans-serif', textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  END ROUND →
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
