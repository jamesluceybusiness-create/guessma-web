'use client'

import { useEffect, useState } from 'react'
import Nav from '../../components/Nav'
import type { GameState } from '../types'
import { CATEGORY_LABELS, CATEGORY_RULES, DIFFICULTY_LABELS } from '../types'

interface Props {
  gs: GameState
  update: (partial: Partial<GameState>) => void
}

export default function CoreRules({ gs, update }: Props) {
  const [canStart, setCanStart] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setCanStart(true), 3000)
    return () => clearTimeout(t)
  }, [])

  const categoryId = gs.schedule?.core_category_id ?? ''
  const difficulty = gs.schedule?.core_difficulty ?? 0
  const categoryLabel = CATEGORY_LABELS[categoryId] ?? categoryId
  const difficultyLabel = DIFFICULTY_LABELS[difficulty] ?? 'Medium'
  const rules = CATEGORY_RULES[categoryId] ?? 'Describe the prompt.'

  const hostName = gs.hostAccount?.display_name || 'You'
  const partnerName = gs.partnerAccount?.display_name || 'Guest'
  const hinterName = gs.hinterRole === 'host' ? hostName : partnerName
  const guesserName = gs.hinterRole === 'host' ? partnerName : hostName

  return (
    <div style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#0a0f0a', color: 'white' }}>
      <Nav />
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1vh 2vw', paddingTop: 'calc(64px + 1vh)',
      }}>
        <div style={{
          background: '#0d1710', border: '1px solid #1a2e1a', borderRadius: '16px',
          padding: 'clamp(1.5rem, 3vh, 2.5rem)', maxWidth: 'min(700px, 90vw)', width: '100%',
          maxHeight: 'calc(100vh - 64px - 4vh)', overflow: 'hidden',
          display: 'flex', flexDirection: 'column', gap: '1.5vh',
        }}>
          {/* Header */}
          <div>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', color: '#22c55e', textTransform: 'uppercase', margin: '0 0 0.4rem' }}>
              Core Round · {difficultyLabel}
            </p>
            <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.8rem)', fontWeight: 900, color: 'white', margin: 0, lineHeight: 1.1 }}>
              {categoryLabel}
            </h1>
          </div>

          {/* Rules box */}
          <div style={{ background: '#13131a', border: '1px solid #27272a', borderRadius: '12px', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <p style={{ fontSize: '0.65rem', color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, margin: 0 }}>
              How to play
            </p>
            <p style={{ fontSize: '1.15rem', color: '#d4d4d8', margin: 0, lineHeight: 1.5 }}>
              {hinterName} gives clues. {guesserName} guesses. You have 60 seconds.
            </p>
            <div style={{ borderTop: '1px solid #27272a', paddingTop: '0.75rem' }}>
              <p style={{ fontSize: '0.65rem', color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, margin: '0 0 0.35rem' }}>
                Category rule
              </p>
              <p style={{ fontSize: '0.9rem', color: '#a1a1aa', margin: 0, lineHeight: 1.5 }}>
                {rules}
              </p>
            </div>
          </div>

          {/* Bonus callout */}
          <div style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)', borderRadius: '12px', padding: '1rem 1.25rem' }}>
            <p style={{ fontSize: '0.9rem', color: '#fde68a', margin: 0, lineHeight: 1.5, fontWeight: 600 }}>
              ⭐ Get all 5 prompts correct to unlock the BONUS prompt — worth the full round value!
            </p>
          </div>

          {/* Role cards */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{
              flex: 1, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)',
              borderRadius: '12px', padding: '1rem',
            }}>
              <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 0.4rem' }}>
                Hinter
              </p>
              <p style={{ fontSize: '1.05rem', fontWeight: 800, color: 'white', margin: 0 }}>
                {hinterName}
              </p>
            </div>
            <div style={{
              flex: 1, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)',
              borderRadius: '12px', padding: '1rem',
            }}>
              <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 0.4rem' }}>
                Guesser
              </p>
              <p style={{ fontSize: '1.05rem', fontWeight: 800, color: 'white', margin: 0 }}>
                {guesserName}
              </p>
            </div>
          </div>

          {/* Prompt count + points info */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: '#4a7a4a', fontWeight: 600 }}>
              {gs.corePrompts.length} prompts
            </span>
            <span style={{ fontSize: '0.75rem', color: '#27272a' }}>·</span>
            <span style={{ fontSize: '0.75rem', color: '#4a7a4a', fontWeight: 600 }}>
              {(difficulty + 1) * 5} pts each
            </span>
            <span style={{ fontSize: '0.75rem', color: '#27272a' }}>·</span>
            <span style={{ fontSize: '0.75rem', color: '#eab308', fontWeight: 600 }}>
              {(difficulty + 1) * 25} pts bonus
            </span>
          </div>

          <button
            disabled={!canStart}
            onClick={() => update({ phase: 'coreGame' })}
            style={{
              width: '100%', height: 'clamp(2.8rem, 6vh, 3.5rem)', background: '#16a34a', color: 'white',
              border: 'none', borderRadius: '10px', fontWeight: 800, fontSize: 'clamp(0.9rem, 1.8vh, 1.1rem)',
              cursor: canStart ? 'pointer' : 'not-allowed',
              opacity: canStart ? 1 : 0.35, fontFamily: 'Lexend, sans-serif',
            }}
          >
            Start Round →
          </button>
        </div>
      </div>
    </div>
  )
}
