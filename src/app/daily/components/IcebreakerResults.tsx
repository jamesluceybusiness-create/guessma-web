'use client'

import { useEffect, useState } from 'react'
import Nav from '../../components/Nav'
import type { GameState } from '../types'

interface Props {
  gs: GameState
  update: (partial: Partial<GameState>) => void
}

const ICEBREAKER_PTS = 50

type FlipRole = 'host' | 'partner'
type FlipState = { used: boolean; won: boolean } | null

interface FlipModal {
  role: FlipRole
  phase: 'choose' | 'spinning' | 'result'
  choice: string | null
  coinResult: string | null
  won: boolean | null
}

export default function IcebreakerResults({ gs, update }: Props) {
  const hostName = gs.hostAccount?.display_name || 'You'
  const partnerName = gs.partnerAccount?.display_name || 'Guest'

  const answer = gs.icebreakerPrompt?.payload?.answer || gs.icebreakerPrompt?.payload?.text || '—'
  const [selected, setSelected] = useState<'host' | 'partner' | 'none' | null>(null)
  const [flipResults, setFlipResults] = useState<Record<FlipRole, FlipState>>({ host: null, partner: null })
  const [flipModal, setFlipModal] = useState<FlipModal | null>(null)

  useEffect(() => {
    if (flipModal?.phase !== 'spinning') return
    const coinResult = Math.random() < 0.5 ? 'heads' : 'tails'
    const won = flipModal.choice === coinResult
    const t = setTimeout(() => {
      setFlipModal(prev => prev ? { ...prev, phase: 'result', coinResult, won } : null)
    }, 1500)
    return () => clearTimeout(t)
  }, [flipModal?.phase]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (flipModal?.phase !== 'result' || !flipModal) return
    const { role, won } = flipModal
    const t = setTimeout(() => {
      setFlipResults(prev => ({ ...prev, [role]: { used: true, won: !!won } }))
      if (won) setSelected(role)
      setFlipModal(null)
    }, 1500)
    return () => clearTimeout(t)
  }, [flipModal?.phase]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const h = flipResults.host
    const p = flipResults.partner
    if (h?.used && !h.won && p?.used && !p.won) setSelected('none')
  }, [flipResults])

  function openFlip(role: FlipRole) {
    if (flipModal !== null) return
    if (flipResults[role]?.used) return
    setFlipModal({ role, phase: 'choose', choice: null, coinResult: null, won: null })
  }

  function handleChoose(choice: string) {
    if (!flipModal || flipModal.phase !== 'choose') return
    setFlipModal(prev => prev ? { ...prev, phase: 'spinning', choice } : null)
  }

  function handleConfirm() {
    if (selected === null) return
    const newHost = gs.hostScore + (selected === 'host' ? ICEBREAKER_PTS : 0)
    const newPartner = gs.partnerScore + (selected === 'partner' ? ICEBREAKER_PTS : 0)
    update({
      icebreakerWinner: selected,
      hostScore: newHost,
      partnerScore: newPartner,
      phase: 'coreRules',
    })
  }

  const playerOptions: Array<{ role: FlipRole; label: string; bg: string }> = [
    { role: 'host', label: hostName, bg: 'rgba(41,175,212,0.15)' },
    { role: 'partner', label: partnerName, bg: 'rgba(239,68,68,0.15)' },
  ]

  const modalRoleName = flipModal?.role === 'host' ? hostName : partnerName

  return (
    <div style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#091e2a', color: 'white' }}>
      <style>{`@keyframes coin-spin { from { transform: rotateY(0deg); } to { transform: rotateY(360deg); } }`}</style>
      <Nav />

      {/* Coin flip modal */}
      {flipModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
          <div style={{
            background: '#0d2d3d', border: '1px solid #1a4a5a', borderRadius: '16px',
            padding: '2.5rem 2rem', textAlign: 'center', maxWidth: '320px', width: '90%',
            display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'center',
          }}>
            {flipModal.phase === 'choose' && (
              <>
                <p style={{ color: '#94a3b8', fontWeight: 700, fontSize: '1rem', margin: 0 }}>
                  {modalRoleName}
                </p>
                <p style={{ color: 'white', fontWeight: 900, fontSize: '1.4rem', margin: 0 }}>
                  Heads or Tails?
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
                  {['heads', 'tails'].map(side => (
                    <button
                      key={side}
                      onClick={() => handleChoose(side)}
                      style={{
                        flex: 1, padding: '0.75rem', background: '#1a4a5a', color: 'white',
                        border: 'none', borderRadius: '10px', fontWeight: 900, fontSize: '1rem',
                        cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
                        textTransform: 'capitalize', letterSpacing: '0.04em',
                      }}
                    >
                      {side.charAt(0).toUpperCase() + side.slice(1)}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setFlipModal(null)}
                  style={{
                    width: '100%', padding: '0.45rem', background: 'transparent',
                    border: '1px solid #1a4a5a', color: '#94a3b8', borderRadius: '8px',
                    cursor: 'pointer', fontFamily: 'Poppins, sans-serif', fontSize: '0.85rem',
                  }}
                >
                  Cancel
                </button>
              </>
            )}

            {flipModal.phase === 'spinning' && (
              <>
                <p style={{ color: '#94a3b8', fontWeight: 700, fontSize: '1.1rem', margin: 0 }}>Flipping…</p>
                <div style={{ fontSize: '4rem', lineHeight: 1, animation: 'coin-spin 0.3s linear infinite' }}>
                  🪙
                </div>
              </>
            )}

            {flipModal.phase === 'result' && (
              <>
                <div style={{
                  width: '5rem', height: '5rem', borderRadius: '50%',
                  background: flipModal.won
                    ? 'linear-gradient(135deg, #16a34a, #16a34a)'
                    : 'linear-gradient(135deg, #ef4444, #dc2626)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.9rem', fontWeight: 900, color: '#fff', textAlign: 'center',
                }}>
                  {flipModal.coinResult?.toUpperCase()}
                </div>
                <p style={{ color: 'white', fontWeight: 900, fontSize: '1.15rem', margin: 0, lineHeight: 1.3 }}>
                  {flipModal.won
                    ? `${modalRoleName} won the flip!`
                    : `${modalRoleName} lost the flip — no points`}
                </p>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0 }}>Just a sec…</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main content */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1vh 2vw', paddingTop: 'calc(64px + 1vh)',
      }}>
        <div style={{
          background: '#0d2d3d', border: '1px solid #1a4a5a', borderRadius: '16px',
          padding: 'clamp(1.5rem, 2.5vh, 2.5rem)', maxWidth: 'min(680px, 90vw)', width: '100%',
          maxHeight: 'calc(100vh - 64px - 4vh)', overflowY: 'auto',
          display: 'flex', flexDirection: 'column', gap: '1.5vh',
        }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', color: '#29afd4', textTransform: 'uppercase', margin: 0 }}>
            Icebreaker · Results
          </p>

          {/* Answer reveal */}
          <div style={{ background: '#0d2d3d', border: '1px solid #1a4a5a', borderRadius: '12px', padding: '1.25rem 1.5rem', position: 'relative', textAlign: 'center' }}>
            <p style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '0.5rem', marginTop: 0 }}>
              The Correct Answer Is:
            </p>
            <p style={{ fontSize: 'clamp(1.8rem, 5vh, 3.2rem)', fontWeight: 900, color: 'white', textTransform: 'uppercase', margin: 0, lineHeight: 1.1 }}>
              {answer}
            </p>
            <span style={{
              position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
              background: '#facc15', color: 'black', fontWeight: 900, borderRadius: '8px',
              padding: '0.25rem 0.65rem', fontSize: '0.82rem',
            }}>
              {ICEBREAKER_PTS} pts
            </span>
          </div>

          <p style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', margin: 0, fontWeight: 600 }}>
            Who said it first?
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {playerOptions.map(({ role, label, bg }) => {
              const flip = flipResults[role]
              const dimmed = flip?.used && !flip.won
              return (
                <div
                  key={role}
                  role="button"
                  tabIndex={dimmed ? -1 : 0}
                  onClick={() => !dimmed && setSelected(role)}
                  onKeyDown={e => e.key === 'Enter' && !dimmed && setSelected(role)}
                  style={{
                    padding: '0.85rem 1rem', borderRadius: '10px', textAlign: 'left',
                    cursor: dimmed ? 'default' : 'pointer',
                    border: `2px solid ${selected === role ? '#facc15' : 'transparent'}`,
                    background: bg,
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.15rem',
                    color: dimmed ? '#64748b' : 'white',
                    opacity: dimmed ? 0.45 : 1,
                    transition: 'opacity 0.2s',
                    minHeight: 'clamp(60px, 10vh, 90px)',
                  }}
                >
                  <span style={{ flex: 1 }}>{label}</span>

                  {flip?.used && flip.won && (
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#16a34a', background: 'rgba(34,197,94,0.15)', padding: '0.2rem 0.5rem', borderRadius: '6px', flexShrink: 0 }}>
                      ✓ Flip won
                    </span>
                  )}
                  {flip?.used && !flip.won && (
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ef4444', background: 'rgba(239,68,68,0.15)', padding: '0.2rem 0.5rem', borderRadius: '6px', flexShrink: 0 }}>
                      ✗ Flip lost
                    </span>
                  )}

                  {!flip?.used && (
                    <button
                      onClick={e => { e.stopPropagation(); openFlip(role) }}
                      style={{
                        padding: '0.2rem 0.6rem', borderRadius: '6px',
                        background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                        color: '#94a3b8', fontWeight: 700, fontSize: '0.75rem',
                        cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
                        display: 'flex', alignItems: 'center', gap: '0.25rem',
                        flexShrink: 0,
                      }}
                    >
                      🪙 Coin Flip
                    </button>
                  )}

                  {selected === role && !flip?.won && (
                    <span style={{ color: '#facc15', fontSize: '1rem', flexShrink: 0 }}>✓</span>
                  )}
                </div>
              )
            })}

            <button
              onClick={() => setSelected('none')}
              style={{
                padding: '0.85rem 1rem', borderRadius: '10px', textAlign: 'left',
                cursor: 'pointer', border: `2px solid ${selected === 'none' ? '#facc15' : 'transparent'}`,
                background: '#0d2d3d',
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.05rem',
                color: 'white',
              }}
            >
              <span style={{ flex: 1 }}>Neither — time ran out</span>
              {selected === 'none' && <span style={{ color: '#facc15', fontSize: '1rem' }}>✓</span>}
            </button>
          </div>

          <button
            disabled={selected === null}
            onClick={handleConfirm}
            style={{
              width: '100%', height: 'clamp(2.8rem, 6vh, 3.5rem)', background: '#16a34a', color: 'white',
              border: 'none', borderRadius: '10px', fontWeight: 800, fontSize: 'clamp(0.9rem, 1.8vh, 1.1rem)',
              cursor: selected !== null ? 'pointer' : 'not-allowed',
              opacity: selected !== null ? 1 : 0.35, fontFamily: 'Poppins, sans-serif',
            }}
          >
            Continue to Core Round →
          </button>
        </div>
      </div>
    </div>
  )
}
