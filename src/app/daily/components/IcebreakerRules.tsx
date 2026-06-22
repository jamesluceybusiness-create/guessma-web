'use client'

import { useState } from 'react'
import Nav from '../../components/Nav'
import type { GameState } from '../types'

interface Props {
  gs: GameState
  update: (partial: Partial<GameState>) => void
}

const RULES = [
  {
    icon: '🧊',
    title: 'Both Players Look',
    body: 'An image appears on screen. Both players look at it at the same time. First person to say the correct answer out loud wins.',
  },
  {
    icon: '⏱️',
    title: '7 Seconds',
    body: 'You have 7 seconds from the moment the image is revealed. If time runs out with no correct answer, no points are awarded. Close call? Use the coin flip on the results screen.',
  },
  {
    icon: '⭐',
    title: 'Unlock the Bonus',
    body: 'In the core round that follows, get all 5 prompts correct to unlock the BONUS prompt — worth the full round value.',
  },
]

export default function IcebreakerRules({ update }: Props) {
  const [page, setPage] = useState(0)

  const rule = RULES[page]
  const isLast = page === RULES.length - 1

  return (
    <div style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#091e2a', color: 'white' }}>
      <Nav />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1vh 2vw', paddingTop: 'calc(64px + 1vh)' }}>
        <div style={{
          background: '#0d2d3d', border: '1px solid #1a4a5a', borderRadius: '16px',
          padding: 'clamp(1.5rem, 3vh, 2.5rem)', width: '100%', maxWidth: 'min(720px, 90vw)',
          maxHeight: 'calc(100vh - 64px - 4vh)', overflow: 'hidden',
          display: 'flex', flexDirection: 'column', gap: '2vh',
        }}>

          {/* Progress dots */}
          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', flexShrink: 0 }}>
            {RULES.map((_, i) => (
              <div key={i} style={{
                width: '0.45rem', height: '0.45rem', borderRadius: '50%',
                background: i === page ? '#29afd4' : '#1a4a5a',
                transition: 'background 0.2s',
              }} />
            ))}
          </div>

          {/* Rule card */}
          <div style={{ flex: 1, minHeight: 0, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{rule.icon}</div>
            <h2 style={{ color: 'white', fontSize: 'clamp(1.1rem, 2.2vh, 1.25rem)', fontWeight: 800, margin: '0 0 0.75rem' }}>
              {rule.title}
            </h2>
            <p style={{ color: '#94a3b8', fontSize: 'clamp(0.95rem, 2vh, 1.2rem)', lineHeight: 1.6, margin: 0 }}>
              {rule.body}
            </p>
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
            {page > 0 && (
              <button
                onClick={() => setPage(p => p - 1)}
                style={{
                  flex: 1, height: 'clamp(2.8rem, 6vh, 3.5rem)', background: 'transparent', color: '#94a3b8',
                  border: '1px solid #1a4a5a', borderRadius: '10px', fontWeight: 700, fontSize: 'clamp(0.9rem, 1.8vh, 1.1rem)',
                  cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
                }}
              >
                ← Back
              </button>
            )}
            {!isLast && (
              <button
                onClick={() => setPage(p => p + 1)}
                style={{
                  flex: 1, height: 'clamp(2.8rem, 6vh, 3.5rem)', background: '#16a34a', color: 'white',
                  border: 'none', borderRadius: '10px', fontWeight: 800, fontSize: 'clamp(0.9rem, 1.8vh, 1.1rem)',
                  cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
                }}
              >
                Next →
              </button>
            )}
            {isLast && (
              <button
                onClick={() => update({ phase: 'icebreaker' })}
                style={{
                  flex: 1, height: 'clamp(2.8rem, 6vh, 3.5rem)', background: '#16a34a', color: 'white',
                  border: 'none', borderRadius: '10px', fontWeight: 800, fontSize: 'clamp(0.9rem, 1.8vh, 1.1rem)',
                  cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
                }}
              >
                Got it — Show the Image →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
