'use client'

import { useState } from 'react'
import Nav from '../../components/Nav'
import type { GameState } from '../types'
import { diffPts, diffBonus } from '../types'

interface Props {
  gs: GameState
  update: (partial: Partial<GameState>) => void
}

export default function RoundResults({ gs, update }: Props) {
  const difficulty = gs.schedule?.core_difficulty ?? 0
  const pts = diffPts(difficulty)
  const bonusPts = diffBonus(difficulty)

  const prompts = gs.corePrompts
  const hasBonus = prompts.length > 5

  // Initialize correct[] from dotStates: green → true, all else → false
  const initialCorrect = prompts.map((_, i) => {
    const slot = i < 5 ? i : 5
    return gs.dotStates[slot] === 'green'
  })
  const [correct, setCorrect] = useState<boolean[]>(initialCorrect)

  function toggle(i: number) {
    setCorrect(prev => {
      const next = [...prev]
      next[i] = !next[i]
      return next
    })
  }

  const hinterIsHost = gs.hinterRole === 'host'
  const correctCount = correct.slice(0, 5).filter(Boolean).length
  const bonusCorrect = hasBonus && correct[5]

  const baseScore = correctCount * pts + (bonusCorrect ? bonusPts : 0)
  const newHostScore = hinterIsHost
    ? gs.hostScore - (initialCorrect.slice(0, 5).filter(Boolean).length * pts + (hasBonus && initialCorrect[5] ? bonusPts : 0)) + baseScore
    : gs.hostScore
  const newPartnerScore = !hinterIsHost
    ? gs.partnerScore - (initialCorrect.slice(0, 5).filter(Boolean).length * pts + (hasBonus && initialCorrect[5] ? bonusPts : 0)) + baseScore
    : gs.partnerScore

  const hostName = gs.hostAccount?.display_name || 'You'
  const partnerName = gs.partnerAccount?.display_name || 'Guest'
  const hinterName = hinterIsHost ? hostName : partnerName

  function handleFinish() {
    update({
      hostScore: newHostScore,
      partnerScore: newPartnerScore,
      phase: 'finalResults',
    })
  }

  const regularPrompts = prompts.slice(0, 5)
  const bonusPrompt = hasBonus ? prompts[5] : null

  return (
    <div style={{
        height: '100vh', overflowY: 'auto',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        background: '#0a0f0a', color: 'white',
        padding: 'calc(64px + 2vh) 2vw 2vh',
      }}>
      <Nav />
        <div style={{
          background: '#0d1710', border: '1px solid #1a2e1a', borderRadius: '16px',
          padding: 'clamp(1.5rem, 3vh, 2.5rem)', maxWidth: 'min(720px, 92vw)', width: '100%',
          display: 'flex', flexDirection: 'column', gap: '1.5vh',
        }}>
          <div>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', color: '#22c55e', textTransform: 'uppercase', margin: '0 0 0.3rem' }}>
              Round Results
            </p>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'white', margin: 0 }}>
              {hinterName} got {correctCount}/{regularPrompts.length} correct
            </h2>
          </div>

          {/* Score summary */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ flex: 1, background: '#13131a', border: '1px solid #27272a', borderRadius: '10px', padding: '0.75rem 1rem' }}>
              <p style={{ fontSize: '0.65rem', color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, margin: '0 0 0.25rem' }}>
                {hostName}
              </p>
              <p style={{ fontSize: '1.3rem', fontWeight: 900, color: 'white', margin: 0 }}>
                {newHostScore}
              </p>
            </div>
            <div style={{ flex: 1, background: '#13131a', border: '1px solid #27272a', borderRadius: '10px', padding: '0.75rem 1rem' }}>
              <p style={{ fontSize: '0.65rem', color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, margin: '0 0 0.25rem' }}>
                {partnerName}
              </p>
              <p style={{ fontSize: '1.3rem', fontWeight: 900, color: 'white', margin: 0 }}>
                {newPartnerScore}
              </p>
            </div>
          </div>

          {/* Prompt rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {regularPrompts.map((prompt, i) => (
              <div
                key={prompt.prompt_id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  background: '#13131a', border: `1px solid ${correct[i] ? '#166534' : '#27272a'}`,
                  borderRadius: '10px', padding: '1rem 1.25rem',
                }}
              >
                <span style={{ flex: 1, fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>
                  {prompt.payload.text}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#52525b', fontWeight: 600 }}>
                  +{pts}
                </span>
                <button
                  onClick={() => toggle(i)}
                  style={{
                    padding: '0.4rem 1.1rem', borderRadius: '8px', border: 'none',
                    background: correct[i] ? '#16a34a' : '#3f3f46',
                    color: correct[i] ? 'white' : '#71717a',
                    fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer',
                    fontFamily: 'Lexend, sans-serif', textTransform: 'uppercase',
                    letterSpacing: '0.06em', flexShrink: 0,
                  }}
                >
                  {correct[i] ? '✓ TRUE' : '✗ FALSE'}
                </button>
              </div>
            ))}

            {bonusPrompt && (
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  background: '#13131a',
                  border: `1px solid ${correct[5] ? '#854d0e' : '#27272a'}`,
                  borderRadius: '10px', padding: '1rem 1.25rem',
                }}
              >
                <span style={{ fontSize: '0.6rem', fontWeight: 800, background: '#78350f', color: '#fde68a', padding: '0.15rem 0.5rem', borderRadius: '999px', flexShrink: 0 }}>
                  BONUS
                </span>
                <span style={{ flex: 1, fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>
                  {bonusPrompt.payload.text}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#eab308', fontWeight: 600 }}>
                  +{bonusPts}
                </span>
                <button
                  onClick={() => toggle(5)}
                  style={{
                    padding: '0.4rem 1.1rem', borderRadius: '8px', border: 'none',
                    background: correct[5] ? '#b45309' : '#3f3f46',
                    color: correct[5] ? '#fde68a' : '#71717a',
                    fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer',
                    fontFamily: 'Lexend, sans-serif', textTransform: 'uppercase',
                    letterSpacing: '0.06em', flexShrink: 0,
                  }}
                >
                  {correct[5] ? '✓ TRUE' : '✗ FALSE'}
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleFinish}
            style={{
              width: '100%', padding: '1rem', background: '#16a34a', color: 'white',
              border: 'none', borderRadius: '10px', fontWeight: 800, fontSize: '1.1rem',
              cursor: 'pointer', fontFamily: 'Lexend, sans-serif',
            }}
          >
            Finish &amp; See Results →
          </button>
        </div>
    </div>
  )
}
