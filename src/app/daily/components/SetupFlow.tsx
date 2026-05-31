'use client'

import { useEffect, useRef, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import Link from 'next/link'
import Nav from '../../components/Nav'
import type { Account, GameState } from '../types'

interface Props {
  gs: GameState
  supabase: SupabaseClient
  update: (partial: Partial<GameState>) => void
}

const CARD: React.CSSProperties = {
  background: '#0d1710', border: '1px solid #1a2e1a', borderRadius: '16px',
  padding: 'clamp(1.5rem, 3vh, 2.5rem)', width: '100%', maxWidth: 'min(680px, 90vw)',
  maxHeight: 'calc(100vh - 64px - 4vh)', overflow: 'hidden',
  display: 'flex', flexDirection: 'column', gap: '1.5vh',
}

const BTN_GREEN: React.CSSProperties = {
  width: '100%', height: 'clamp(2.8rem, 6vh, 3.5rem)', padding: '0 1.5rem',
  background: '#16a34a', color: 'white', border: 'none', borderRadius: '10px',
  fontWeight: 800, fontSize: 'clamp(0.9rem, 1.8vh, 1.1rem)',
  cursor: 'pointer', fontFamily: 'Lexend, sans-serif',
}

const BTN_OUTLINE: React.CSSProperties = {
  width: '100%', height: 'clamp(2.8rem, 6vh, 3.5rem)', padding: '0 1.5rem',
  background: 'transparent', color: '#4a7a4a', border: '1px solid #1a2e1a',
  borderRadius: '10px', fontWeight: 700, fontSize: 'clamp(0.9rem, 1.8vh, 1.1rem)',
  cursor: 'pointer', fontFamily: 'Lexend, sans-serif',
}

function Wrap({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#0a0f0a', color: 'white' }}>
      <Nav />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1vh 2vw', paddingTop: 'calc(64px + 1vh)' }}>
        {children}
      </div>
    </div>
  )
}

function Initials({ name }: { name: string }) {
  const parts = (name || '?').split(' ')
  return <>{parts.map(p => p[0]).join('').slice(0, 2).toUpperCase()}</>
}

export default function SetupFlow({ gs, supabase, update }: Props) {
  const [authLoading, setAuthLoading] = useState(true)
  const [playerStats, setPlayerStats] = useState<any>(null)

  const [partnerMode, setPartnerMode] = useState<'guest' | 'linked' | null>(null)
  const [guestName, setGuestName] = useState('')
  const [partnerSearch, setPartnerSearch] = useState('')
  const [searchResults, setSearchResults] = useState<Account[]>([])
  const [selectedPartner, setSelectedPartner] = useState<Account | null>(null)

  const [hinterRole, setHinterRole] = useState<'host' | 'partner'>('host')
  const [randomized, setRandomized] = useState(false)

  const hostName = gs.hostAccount?.display_name || 'You'
  const partnerDisplayName = selectedPartner?.display_name || gs.partnerAccount?.display_name || 'Guest'

  useEffect(() => {
    if (gs.phase !== 'setup1') return
    async function checkAuth() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const [{ data: acc }, { data: stats }] = await Promise.all([
            supabase.from('accounts')
              .select('id, display_name, username, karma_lifetime, karma_balance')
              .eq('id', user.id).single(),
            supabase.from('player_stats')
              .select('current_streak')
              .eq('account_id', user.id).single(),
          ])
          update({ hostUser: user, hostAccount: acc })
          setPlayerStats(stats)
        }
      } catch {}
      setAuthLoading(false)
    }
    checkAuth()
  }, [gs.phase])

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (!partnerSearch || partnerSearch.length < 2) { setSearchResults([]); return }
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(async () => {
      const { data } = await supabase
        .from('accounts')
        .select('id, display_name, username, karma_lifetime, karma_balance')
        .ilike('username', `%${partnerSearch}%`)
        .neq('id', gs.hostUser?.id ?? '')
        .limit(5)
      setSearchResults((data ?? []) as Account[])
    }, 300)
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current) }
  }, [partnerSearch])

  // ─── SCREEN 1 ─────────────────────────────────────────────────────────────
  if (gs.phase === 'setup1') {
    return (
      <Wrap>
        <div style={CARD}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', color: '#22c55e', textTransform: 'uppercase', margin: 0 }}>
            Daily Game · Setup 1 of 4
          </p>

          {authLoading ? (
            <div style={{ color: '#4a7a4a', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>Checking account…</div>
          ) : gs.hostAccount ? (
            <>
              <p style={{ color: '#a0c4a0', fontSize: 'clamp(0.85rem, 1.8vh, 1rem)', margin: 0 }}>Playing as:</p>
              <div style={{
                background: '#13131a', border: '1px solid #3f3f46', borderRadius: '0.75rem',
                padding: '0.6rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
              }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%', background: '#0e9f8e',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, fontSize: '0.9rem', color: 'white', textTransform: 'uppercase', flexShrink: 0,
                }}>
                  <Initials name={gs.hostAccount.display_name} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 900, color: 'white', fontSize: '0.95rem', lineHeight: 1.2 }}>
                    {gs.hostAccount.display_name}
                  </div>
                  <div style={{ color: '#71717a', fontSize: '0.7rem' }}>@{gs.hostAccount.username ?? ''}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#22d3c8', fontWeight: 900, fontSize: '0.8rem' }}>
                    {gs.hostAccount.karma_lifetime ?? 0} <span style={{ color: '#52525b', fontWeight: 400, fontSize: '0.62rem' }}>KARMA</span>
                  </div>
                  <div style={{ color: '#f97316', fontWeight: 700, fontSize: '0.75rem' }}>
                    🔥 {playerStats?.current_streak ?? 0} <span style={{ color: '#52525b', fontWeight: 400, fontSize: '0.62rem' }}>STREAK</span>
                  </div>
                </div>
              </div>
              <button style={BTN_GREEN} onClick={() => update({ phase: 'setup2' })}>
                Continue as {gs.hostAccount.display_name} →
              </button>
            </>
          ) : (
            <>
              <div style={{
                background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)',
                borderRadius: '10px', padding: '0.9rem 1rem',
                display: 'flex', gap: '0.6rem', alignItems: 'flex-start',
              }}>
                <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>⚠️</span>
                <div>
                  <div style={{ fontWeight: 700, color: '#fbbf24', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Playing as guest</div>
                  <div style={{ color: '#a3a3a3', fontSize: 'clamp(0.8rem, 1.6vh, 0.9rem)', lineHeight: 1.5 }}>
                    You can play without an account but your stats, streak, and karma won&apos;t be tracked.
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <button style={BTN_GREEN} onClick={() => update({ phase: 'setup2' })}>
                  Continue as Guest →
                </button>
                <Link href="/login" style={{ ...BTN_OUTLINE, textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  Sign In →
                </Link>
              </div>
            </>
          )}
        </div>
      </Wrap>
    )
  }

  // ─── SCREEN 2 ─────────────────────────────────────────────────────────────
  if (gs.phase === 'setup2') {
    const canContinue = partnerMode === 'guest' || (partnerMode === 'linked' && selectedPartner)
    return (
      <Wrap>
        <div style={CARD}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', color: '#22c55e', textTransform: 'uppercase', margin: 0 }}>
            Daily Game · Setup 2 of 4
          </p>
          <h2 style={{ color: 'white', fontSize: 'clamp(1.2rem, 2.5vh, 1.6rem)', fontWeight: 800, margin: 0 }}>
            Who are you playing with?
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, minHeight: 0, overflowY: 'auto' }}>
            <button
              onClick={() => { setPartnerMode('guest'); setSelectedPartner(null) }}
              style={{
                background: partnerMode === 'guest' ? 'rgba(22,163,74,0.15)' : '#0a0f0a',
                border: partnerMode === 'guest' ? '2px solid #16a34a' : '1px solid #1a2e1a',
                borderRadius: '12px', padding: '1rem', textAlign: 'left',
                cursor: 'pointer', display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                fontFamily: 'Lexend, sans-serif',
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>👤</span>
              <div>
                <div style={{ fontWeight: 700, color: 'white', fontSize: '0.95rem', marginBottom: '0.2rem' }}>Guest</div>
                <div style={{ color: '#4a7a4a', fontSize: 'clamp(0.8rem, 1.6vh, 0.9rem)', lineHeight: 1.4 }}>
                  Partner plays without an account. Only your stats will be tracked.
                </div>
              </div>
            </button>

            {partnerMode === 'guest' && (
              <input
                type="text"
                placeholder="Guest name (optional)"
                value={guestName}
                onChange={e => setGuestName(e.target.value)}
                style={{
                  width: '100%', padding: '0.55rem 0.75rem', background: '#0a0f0a',
                  border: '1px solid #1a2e1a', borderRadius: '8px', color: '#c8d8c8',
                  fontFamily: 'Lexend, sans-serif', fontSize: 'clamp(0.85rem, 1.8vh, 1rem)', outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            )}

            {gs.hostUser && (
              <button
                onClick={() => setPartnerMode('linked')}
                style={{
                  background: partnerMode === 'linked' ? 'rgba(22,163,74,0.15)' : '#0a0f0a',
                  border: partnerMode === 'linked' ? '2px solid #16a34a' : '1px solid #1a2e1a',
                  borderRadius: '12px', padding: '1rem', textAlign: 'left',
                  cursor: 'pointer', display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                  fontFamily: 'Lexend, sans-serif',
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>🔗</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: 'white', fontSize: '0.95rem', marginBottom: '0.2rem' }}>Link Partner Account</div>
                  <div style={{ color: '#4a7a4a', fontSize: 'clamp(0.8rem, 1.6vh, 0.9rem)', lineHeight: 1.4, marginBottom: partnerMode === 'linked' ? '0.75rem' : 0 }}>
                    Both players earn karma and track stats
                  </div>

                  {partnerMode === 'linked' && (
                    <div onClick={e => e.stopPropagation()}>
                      {selectedPartner ? (
                        <div style={{
                          background: '#13131a', border: '1px solid #3f3f46', borderRadius: '8px',
                          padding: '0.5rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                        }}>
                          <div style={{
                            width: '28px', height: '28px', borderRadius: '50%', background: '#0e9f8e',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 900, fontSize: '0.65rem', color: 'white', textTransform: 'uppercase', flexShrink: 0,
                          }}>
                            <Initials name={selectedPartner.display_name} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, color: 'white', fontSize: '0.82rem' }}>{selectedPartner.display_name}</div>
                            <div style={{ color: '#71717a', fontSize: '0.65rem' }}>@{selectedPartner.username ?? ''}</div>
                          </div>
                          <button
                            onClick={() => { setSelectedPartner(null); setPartnerSearch('') }}
                            style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', fontSize: '0.75rem', padding: '0.2rem' }}
                          >✕</button>
                        </div>
                      ) : (
                        <>
                          <input
                            type="text"
                            placeholder="Search by username"
                            value={partnerSearch}
                            onChange={e => setPartnerSearch(e.target.value)}
                            style={{
                              width: '100%', padding: '0.45rem 0.65rem', background: '#0a0f0a',
                              border: '1px solid #1a2e1a', borderRadius: '8px', color: '#c8d8c8',
                              fontFamily: 'Lexend, sans-serif', fontSize: 'clamp(0.85rem, 1.8vh, 1rem)', outline: 'none',
                              boxSizing: 'border-box',
                            }}
                          />
                          {searchResults.length > 0 && (
                            <div style={{ marginTop: '0.35rem', background: '#0a0f0a', border: '1px solid #1a2e1a', borderRadius: '8px', overflow: 'hidden' }}>
                              {searchResults.map(acc => (
                                <button
                                  key={acc.id}
                                  onClick={() => { setSelectedPartner(acc); setPartnerSearch('') }}
                                  style={{
                                    width: '100%', padding: '0.45rem 0.65rem', textAlign: 'left',
                                    background: 'none', border: 'none', borderBottom: '1px solid #1a2e1a',
                                    cursor: 'pointer', display: 'flex', gap: '0.5rem', alignItems: 'center',
                                    fontFamily: 'Lexend, sans-serif',
                                  }}
                                >
                                  <span style={{ fontWeight: 700, color: 'white', fontSize: '0.82rem' }}>{acc.display_name}</span>
                                  <span style={{ color: '#4a7a4a', fontSize: '0.72rem' }}>@{acc.username}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </button>
            )}
          </div>

          <button
            disabled={!canContinue}
            onClick={() => {
              const isLinked = partnerMode === 'linked' && !!selectedPartner
              update({
                phase: 'setup3',
                partnerType: isLinked ? 'linked' : 'guest',
                partnerAccount: isLinked
                  ? selectedPartner
                  : { display_name: guestName.trim() || 'Guest', id: null, username: null, karma_lifetime: 0, karma_balance: 0 },
              })
            }}
            style={{ ...BTN_GREEN, opacity: canContinue ? 1 : 0.4, cursor: canContinue ? 'pointer' : 'not-allowed', flexShrink: 0 }}
          >
            Continue →
          </button>
        </div>
      </Wrap>
    )
  }

  // ─── SCREEN 3 ─────────────────────────────────────────────────────────────
  if (gs.phase === 'setup3') {
    return (
      <Wrap>
        <div style={CARD}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', color: '#22c55e', textTransform: 'uppercase', margin: 0 }}>
            Daily Game · Setup 3 of 4
          </p>
          <h2 style={{ color: 'white', fontSize: 'clamp(1.2rem, 2.5vh, 1.6rem)', fontWeight: 800, margin: 0 }}>
            Assign Roles
          </h2>
          <p style={{ color: '#4a7a4a', fontSize: 'clamp(0.85rem, 1.8vh, 1rem)', margin: 0 }}>
            Who is hinting and who is guessing for the core round?
          </p>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ flex: 1, background: '#0a0f0a', border: '1px solid #1a2e1a', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ fontWeight: 700, color: 'white', fontSize: '0.9rem' }}>{hostName}</div>
              <select
                value={hinterRole === 'host' ? 'hinter' : 'guesser'}
                onChange={e => setHinterRole(e.target.value === 'hinter' ? 'host' : 'partner')}
                style={{
                  background: '#13131a', border: '1px solid #3f3f46', borderRadius: '6px',
                  color: 'white', padding: '0.35rem 0.5rem', fontFamily: 'Lexend, sans-serif',
                  fontSize: '0.8rem', cursor: 'pointer',
                }}
              >
                <option value="hinter">Hint Giver</option>
                <option value="guesser">Guesser</option>
              </select>
            </div>

            <div style={{ flex: 1, background: '#0a0f0a', border: '1px solid #1a2e1a', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ fontWeight: 700, color: 'white', fontSize: '0.9rem' }}>{partnerDisplayName}</div>
              <div style={{
                background: '#13131a', border: '1px solid #3f3f46', borderRadius: '6px',
                color: '#a0c4a0', padding: '0.35rem 0.5rem', fontSize: '0.8rem',
              }}>
                {hinterRole === 'host' ? 'Guesser' : 'Hint Giver'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <button
              onClick={() => {
                setHinterRole(Math.random() < 0.5 ? 'host' : 'partner')
                setRandomized(true)
              }}
              style={BTN_OUTLINE}
            >
              🎲 Randomize Roles
            </button>
            {randomized && (
              <p style={{ color: '#22c55e', fontSize: '0.78rem', textAlign: 'center', margin: 0 }}>
                Randomized! {hinterRole === 'host' ? hostName : partnerDisplayName} hints
              </p>
            )}
            <button
              onClick={() => update({ phase: 'setup4', hinterRole })}
              style={BTN_GREEN}
            >
              Continue →
            </button>
          </div>
        </div>
      </Wrap>
    )
  }

  // ─── SCREEN 4 ─────────────────────────────────────────────────────────────
  if (gs.phase === 'setup4') {
    const hinterName = gs.hinterRole === 'host' ? hostName : partnerDisplayName
    const guesserName = gs.hinterRole === 'host' ? partnerDisplayName : hostName
    return (
      <Wrap>
        <div style={CARD}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', color: '#22c55e', textTransform: 'uppercase', margin: 0 }}>
            Daily Game · Setup 4 of 4
          </p>
          <h2 style={{ color: 'white', fontSize: 'clamp(1.2rem, 2.5vh, 1.6rem)', fontWeight: 800, margin: 0 }}>
            Get into position 🎬
          </h2>
          <p style={{ color: '#4a7a4a', fontSize: 'clamp(0.85rem, 1.8vh, 1rem)', margin: 0, lineHeight: 1.6 }}>
            The Guesser sits with their back to the screen, facing the room. The Hinter faces the screen and describes the prompts.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{
              flex: 1, background: 'rgba(245,158,11,0.08)', border: '1px solid #78350f',
              borderRadius: '12px', padding: '1rem', textAlign: 'center',
            }}>
              <div style={{ fontSize: '0.65rem', color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '0.3rem' }}>
                Hinting
              </div>
              <div style={{ fontWeight: 800, color: '#fbbf24', fontSize: '1rem' }}>{hinterName}</div>
              <div style={{ color: '#78350f', fontSize: '0.72rem', marginTop: '0.2rem' }}>facing screen</div>
            </div>
            <div style={{
              flex: 1, background: 'rgba(63,63,70,0.3)', border: '1px solid #3f3f46',
              borderRadius: '12px', padding: '1rem', textAlign: 'center',
            }}>
              <div style={{ fontSize: '0.65rem', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '0.3rem' }}>
                Guessing
              </div>
              <div style={{ fontWeight: 800, color: 'white', fontSize: '1rem' }}>{guesserName}</div>
              <div style={{ color: '#52525b', fontSize: '0.72rem', marginTop: '0.2rem' }}>back to screen</div>
            </div>
          </div>

          <button
            onClick={() => update({ phase: 'icebreakerRules' })}
            style={BTN_GREEN}
          >
            Everyone&apos;s Ready — Start Game →
          </button>
        </div>
      </Wrap>
    )
  }

  return null
}
