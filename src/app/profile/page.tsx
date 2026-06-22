'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Nav from '../components/Nav'
import { createClient } from '../lib/supabase'

type Section = 'overview' | 'performance' | 'social' | 'history' | 'account'

const CARD = {
  background: '#0d2d3d',
  border: '1px solid #1a4a5a',
  borderRadius: '12px',
  padding: '1.25rem',
}

const LABEL: React.CSSProperties = {
  fontSize: '0.65rem',
  fontWeight: 700,
  letterSpacing: '0.1em',
  color: '#29afd4',
  textTransform: 'uppercase',
  marginBottom: '0.2rem',
}

const VALUE: React.CSSProperties = {
  fontSize: '1.6rem',
  fontWeight: 900,
  lineHeight: 1,
}

function StatCard({ label, value, color = 'white' }: { label: string; value: string | number; color?: string }) {
  return (
    <div style={{ ...CARD, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <span style={LABEL}>{label}</span>
      <span style={{ ...VALUE, color }}>{value ?? '—'}</span>
    </div>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#29afd4', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 1rem' }}>
      {title}
    </h2>
  )
}

export default function ProfilePage() {
  const router   = useRouter()
  const supabase = createClient()

  const [loading, setLoading]                   = useState(true)
  const [activeSection, setActiveSection]       = useState<Section>('overview')
  const [user, setUser]                         = useState<any>(null)
  const [account, setAccount]                   = useState<any>(null)
  const [playerStats, setPlayerStats]           = useState<any>(null)
  const [dailySessions, setDailySessions]       = useState<any[]>([])
  const [partnerHistory, setPartnerHistory]     = useState<any[]>([])
  const [purchases, setPurchases]               = useState<any[]>([])
  const [karmaLog, setKarmaLog]                 = useState<any[]>([])
  const [accolades, setAccolades]               = useState<any[]>([])
  const [categoryAccuracy, setCategoryAccuracy] = useState<any[]>([])
  const [friendships, setFriendships]           = useState<any[]>([])

  const [editName, setEditName]       = useState('')
  const [savingName, setSavingName]   = useState(false)
  const [nameSuccess, setNameSuccess] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u) { router.replace('/login'); return }
      setUser(u)

      const [
        { data: acc },
        { data: stats },
        { data: sessions },
        { data: partners },
        { data: buys },
        { data: karma },
        { data: badges },
        { data: catAcc },
        { data: friends },
      ] = await Promise.all([
        supabase.from('accounts').select('*').eq('id', u.id).single(),
        supabase.from('player_stats').select('*').eq('account_id', u.id).single(),
        supabase.from('daily_sessions').select('*').eq('account_id', u.id).order('played_at', { ascending: false }).limit(30),
        supabase.from('partner_history').select('*').or(`account_id.eq.${u.id},partner_id.eq.${u.id}`).order('last_played_at', { ascending: false }).limit(20),
        supabase.from('purchases').select('*').eq('account_id', u.id).order('purchased_at', { ascending: false }),
        supabase.from('karma_log').select('*').eq('account_id', u.id).order('created_at', { ascending: false }).limit(50),
        supabase.from('accolades').select('*').eq('account_id', u.id).order('earned_at', { ascending: false }),
        supabase.from('category_accuracy').select('*').eq('account_id', u.id).order('correct_count', { ascending: false }),
        supabase.from('friendships').select('*').or(`requester_id.eq.${u.id},addressee_id.eq.${u.id}`),
      ])

      setAccount(acc)
      setPlayerStats(stats)
      setDailySessions(sessions ?? [])
      setPartnerHistory(partners ?? [])
      setPurchases(buys ?? [])
      setKarmaLog(karma ?? [])
      setAccolades(badges ?? [])
      setCategoryAccuracy(catAcc ?? [])
      setFriendships(friends ?? [])
      setEditName(acc?.display_name ?? '')
      setLoading(false)
    }
    load()
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.replace('/')
  }

  async function handleSaveName() {
    if (!editName.trim()) return
    setSavingName(true)
    await supabase.from('accounts').update({ display_name: editName.trim() }).eq('id', user.id)
    setAccount((a: any) => ({ ...a, display_name: editName.trim() }))
    setSavingName(false)
    setNameSuccess(true)
    setTimeout(() => setNameSuccess(false), 2000)
  }

  if (loading) return (
    <div style={{ height: '100vh', background: '#091e2a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Nav />
      <span style={{ color: '#64748b', fontSize: '1rem', fontWeight: 600 }}>Loading…</span>
    </div>
  )

  const initials = (account?.display_name || '?').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()

  const navItems: { id: Section; label: string; icon: string }[] = [
    { id: 'overview',     label: 'Overview',     icon: '◉' },
    { id: 'performance',  label: 'Performance',  icon: '▲' },
    { id: 'social',       label: 'Social',       icon: '◈' },
    { id: 'history',      label: 'History',      icon: '◷' },
    { id: 'account',      label: 'Account',      icon: '◎' },
  ]

  return (
    <div style={{ height: '100vh', overflow: 'hidden', background: '#091e2a', fontFamily: 'Poppins, sans-serif' }}>
      <Nav />

      <div style={{ display: 'flex', height: 'calc(100vh - 64px)', marginTop: '64px' }}>

        {/* Sidebar */}
        <aside style={{
          width: '220px', flexShrink: 0,
          background: '#0d2d3d',
          borderRight: '1px solid #1a4a5a',
          display: 'flex', flexDirection: 'column',
          overflowY: 'auto',
        }}>
          {/* Identity */}
          <div style={{ padding: '1.5rem 1.25rem 1.25rem', borderBottom: '1px solid #1a4a5a' }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '50%',
              background: '#29afd4',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: '1rem', color: 'white',
              marginBottom: '0.75rem',
            }}>
              {initials}
            </div>
            <div style={{ fontWeight: 900, fontSize: '0.95rem', color: 'white', lineHeight: 1.2 }}>
              {account?.display_name}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.15rem' }}>
              @{account?.username}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
              <div>
                <div style={{ ...LABEL, marginBottom: 0 }}>Karma</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#29afd4' }}>{account?.karma_lifetime ?? 0}</div>
              </div>
              <div>
                <div style={{ ...LABEL, marginBottom: 0 }}>Streak</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#facc15' }}>🔥 {playerStats?.current_streak ?? 0}</div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ padding: '0.75rem 0.5rem', flex: 1 }}>
            {navItems.map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                style={{
                  width: '100%', textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: '0.6rem',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '8px',
                  border: 'none',
                  borderLeft: activeSection === id ? '3px solid #29afd4' : '3px solid transparent',
                  background: activeSection === id ? '#0f3547' : 'transparent',
                  color: activeSection === id ? '#ffffff' : '#64748b',
                  fontWeight: activeSection === id ? 800 : 500,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  fontFamily: 'Poppins, sans-serif',
                  marginBottom: '0.15rem',
                  transition: 'background 0.15s',
                }}
              >
                <span style={{ fontSize: '0.75rem' }}>{icon}</span>
                {label}
              </button>
            ))}
          </nav>

          {/* Sign Out */}
          <div style={{ padding: '1rem' }}>
            <button
              onClick={handleSignOut}
              style={{
                width: '100%', padding: '0.55rem',
                borderRadius: '8px',
                border: '1px solid #1a4a5a',
                background: 'transparent',
                color: '#ef4444',
                fontSize: '0.8rem', fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'Poppins, sans-serif',
              }}
            >
              Sign out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>

          {/* ── OVERVIEW ── */}
          {activeSection === 'overview' && (
            <div style={{ maxWidth: '900px' }}>
              <SectionHeader title="Overview" />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <StatCard label="Total Wins"     value={playerStats?.wins_total ?? 0}           color="#16a34a" />
                <StatCard label="Karma Lifetime" value={account?.karma_lifetime ?? 0}            color="#29afd4" />
                <StatCard label="Current Streak" value={`🔥 ${playerStats?.current_streak ?? 0}`} />
                <StatCard label="Games Played"   value={playerStats?.games_played ?? 0} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ ...CARD }}>
                  <div style={{ ...LABEL, marginBottom: '0.75rem' }}>Accolades</div>
                  {accolades.length === 0 ? (
                    <div style={{ color: '#64748b', fontSize: '0.85rem' }}>No accolades yet</div>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {accolades.slice(0, 8).map((a: any) => (
                        <div key={a.id} title={a.description} style={{
                          background: '#0f3547', border: '1px solid #16a34a22',
                          borderRadius: '8px', padding: '0.35rem 0.65rem',
                          fontSize: '0.75rem', fontWeight: 700, color: '#16a34a',
                        }}>
                          {a.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ ...CARD }}>
                  <div style={{ ...LABEL, marginBottom: '0.75rem' }}>Recent Sessions</div>
                  {dailySessions.length === 0 ? (
                    <div style={{ color: '#64748b', fontSize: '0.85rem' }}>No sessions yet</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {dailySessions.slice(0, 5).map((s: any) => (
                        <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                            {new Date(s.played_at).toLocaleDateString()}
                          </span>
                          <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#16a34a' }}>+{s.score ?? 0}</span>
                            <span style={{ fontSize: '0.75rem', color: s.result === 'win' ? '#16a34a' : '#ef4444' }}>
                              {s.result ?? '—'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ ...CARD }}>
                <div style={{ ...LABEL, marginBottom: '0.75rem' }}>Top Categories</div>
                {categoryAccuracy.length === 0 ? (
                  <div style={{ color: '#64748b', fontSize: '0.85rem' }}>No category data yet</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {categoryAccuracy.slice(0, 5).map((c: any) => {
                      const pct = c.total_count > 0 ? Math.round((c.correct_count / c.total_count) * 100) : 0
                      return (
                        <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ width: '130px', fontSize: '0.8rem', color: '#94a3b8', flexShrink: 0 }}>
                            {c.category}
                          </div>
                          <div style={{ flex: 1, height: '6px', background: '#0f3547', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: '#16a34a', borderRadius: '3px' }} />
                          </div>
                          <div style={{ width: '40px', textAlign: 'right', fontSize: '0.8rem', fontWeight: 700, color: '#16a34a' }}>
                            {pct}%
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── PERFORMANCE ── */}
          {activeSection === 'performance' && (
            <div style={{ maxWidth: '900px' }}>
              <SectionHeader title="Performance" />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <StatCard label="Win Rate"       value={playerStats?.games_played > 0 ? `${Math.round((playerStats.wins_total / playerStats.games_played) * 100)}%` : '—'} color="#16a34a" />
                <StatCard label="Best Streak"    value={playerStats?.best_streak ?? 0}   color="#facc15" />
                <StatCard label="Avg Score/Game" value={playerStats?.games_played > 0 ? Math.round((playerStats?.score_total ?? 0) / playerStats.games_played) : '—'} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ ...CARD }}>
                  <div style={{ ...LABEL, marginBottom: '0.75rem' }}>As Hinter</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {[
                      { label: 'Rounds as Hinter', value: playerStats?.rounds_as_hinter ?? 0 },
                      { label: 'Successful Hints',  value: playerStats?.hints_successful ?? 0 },
                      { label: 'Hint Accuracy',     value: playerStats?.rounds_as_hinter > 0 ? `${Math.round(((playerStats?.hints_successful ?? 0) / playerStats.rounds_as_hinter) * 100)}%` : '—', color: '#16a34a' },
                    ].map(({ label, value, color }) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.82rem', color: '#64748b' }}>{label}</span>
                        <span style={{ fontSize: '0.82rem', fontWeight: 800, color: color ?? 'white' }}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ ...CARD }}>
                  <div style={{ ...LABEL, marginBottom: '0.75rem' }}>As Guesser</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {[
                      { label: 'Rounds as Guesser', value: playerStats?.rounds_as_guesser ?? 0 },
                      { label: 'Correct Guesses',   value: playerStats?.guesses_correct ?? 0 },
                      { label: 'Guess Accuracy',    value: playerStats?.rounds_as_guesser > 0 ? `${Math.round(((playerStats?.guesses_correct ?? 0) / playerStats.rounds_as_guesser) * 100)}%` : '—', color: '#29afd4' },
                    ].map(({ label, value, color }) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.82rem', color: '#64748b' }}>{label}</span>
                        <span style={{ fontSize: '0.82rem', fontWeight: 800, color: color ?? 'white' }}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ ...CARD }}>
                <div style={{ ...LABEL, marginBottom: '0.75rem' }}>Category Accuracy</div>
                {categoryAccuracy.length === 0 ? (
                  <div style={{ color: '#64748b', fontSize: '0.85rem' }}>No category data yet</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {categoryAccuracy.map((c: any) => {
                      const pct = c.total_count > 0 ? Math.round((c.correct_count / c.total_count) * 100) : 0
                      const hue = pct >= 70 ? '#16a34a' : pct >= 40 ? '#facc15' : '#ef4444'
                      return (
                        <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ width: '160px', fontSize: '0.8rem', color: '#94a3b8', flexShrink: 0 }}>
                            {c.category}
                          </div>
                          <div style={{ flex: 1, height: '6px', background: '#0f3547', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: hue, borderRadius: '3px' }} />
                          </div>
                          <div style={{ width: '70px', textAlign: 'right', fontSize: '0.75rem', color: '#64748b' }}>
                            {c.correct_count}/{c.total_count}
                          </div>
                          <div style={{ width: '40px', textAlign: 'right', fontSize: '0.8rem', fontWeight: 700, color: hue }}>
                            {pct}%
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── SOCIAL ── */}
          {activeSection === 'social' && (
            <div style={{ maxWidth: '900px' }}>
              <SectionHeader title="Social" />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <StatCard label="Friends"      value={friendships.filter((f: any) => f.status === 'accepted').length} color="#29afd4" />
                <StatCard label="Partners Played With" value={partnerHistory.length} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ ...CARD }}>
                  <div style={{ ...LABEL, marginBottom: '0.75rem' }}>Friends</div>
                  {friendships.filter((f: any) => f.status === 'accepted').length === 0 ? (
                    <div style={{ color: '#64748b', fontSize: '0.85rem' }}>No friends yet</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {friendships.filter((f: any) => f.status === 'accepted').map((f: any) => (
                        <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{
                            width: '28px', height: '28px', borderRadius: '50%',
                            background: '#0f3547', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontSize: '0.7rem', fontWeight: 900, color: '#16a34a',
                          }}>
                            {(f.friend_display_name || '?')[0].toUpperCase()}
                          </div>
                          <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{f.friend_display_name ?? f.friend_username ?? f.addressee_id}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ ...CARD }}>
                  <div style={{ ...LABEL, marginBottom: '0.75rem' }}>Partner History</div>
                  {partnerHistory.length === 0 ? (
                    <div style={{ color: '#64748b', fontSize: '0.85rem' }}>No partner history yet</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {partnerHistory.slice(0, 8).map((p: any) => (
                        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                            {p.partner_display_name ?? p.partner_id}
                          </span>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.games_together ?? 0} games</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a' }}>
                              {p.wins_together ?? 0}W
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ ...CARD }}>
                <div style={{ ...LABEL, marginBottom: '0.75rem' }}>Recent Karma Activity</div>
                {karmaLog.length === 0 ? (
                  <div style={{ color: '#64748b', fontSize: '0.85rem' }}>No karma activity yet</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {karmaLog.slice(0, 10).map((k: any) => (
                      <div key={k.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{k.reason ?? k.type ?? 'Karma event'}</span>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {new Date(k.created_at).toLocaleDateString()}
                          </span>
                          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: (k.amount ?? 0) >= 0 ? '#29afd4' : '#ef4444' }}>
                            {(k.amount ?? 0) >= 0 ? '+' : ''}{k.amount ?? 0}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── HISTORY ── */}
          {activeSection === 'history' && (
            <div style={{ maxWidth: '900px' }}>
              <SectionHeader title="History" />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <StatCard label="Sessions Played" value={dailySessions.length} />
                <StatCard label="Total Score"     value={playerStats?.score_total ?? 0}  color="#facc15" />
                <StatCard label="Win Rate"        value={playerStats?.games_played > 0 ? `${Math.round((playerStats.wins_total / playerStats.games_played) * 100)}%` : '—'} color="#16a34a" />
              </div>

              <div style={{ ...CARD }}>
                <div style={{ ...LABEL, marginBottom: '0.75rem' }}>Session Log</div>
                {dailySessions.length === 0 ? (
                  <div style={{ color: '#64748b', fontSize: '0.85rem' }}>No sessions yet</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 80px 70px 80px',
                      padding: '0.4rem 0.5rem',
                      borderBottom: '1px solid #1a4a5a',
                    }}>
                      {['Date', 'Score', 'Result', 'Karma'].map(h => (
                        <span key={h} style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</span>
                      ))}
                    </div>
                    {dailySessions.map((s: any) => (
                      <div key={s.id} style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 80px 70px 80px',
                        padding: '0.55rem 0.5rem',
                        borderBottom: '1px solid #1a4a5a22',
                        alignItems: 'center',
                      }}>
                        <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                          {new Date(s.played_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#facc15' }}>{s.score ?? 0}</span>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: s.result === 'win' ? '#16a34a' : '#ef4444' }}>
                          {s.result ? s.result.charAt(0).toUpperCase() + s.result.slice(1) : '—'}
                        </span>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#29afd4' }}>
                          {s.karma_earned != null ? `+${s.karma_earned}` : '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── ACCOUNT ── */}
          {activeSection === 'account' && (
            <div style={{ maxWidth: '600px' }}>
              <SectionHeader title="Account" />

              <div style={{ ...CARD, marginBottom: '1rem' }}>
                <div style={{ ...LABEL, marginBottom: '0.75rem' }}>Profile</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '0.25rem' }}>Display Name</div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        style={{
                          flex: 1, background: '#0f3547', border: '1px solid #1a4a5a',
                          borderRadius: '8px', padding: '0.5rem 0.75rem',
                          color: 'white', fontSize: '0.875rem',
                          fontFamily: 'Poppins, sans-serif', outline: 'none',
                        }}
                      />
                      <button
                        onClick={handleSaveName}
                        disabled={savingName || editName.trim() === (account?.display_name ?? '')}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '8px',
                          border: 'none',
                          background: nameSuccess ? '#16a34a' : '#29afd4',
                          color: '#091e2a',
                          fontWeight: 800, fontSize: '0.8rem',
                          cursor: savingName ? 'wait' : 'pointer',
                          fontFamily: 'Poppins, sans-serif',
                          opacity: editName.trim() === (account?.display_name ?? '') ? 0.4 : 1,
                        }}
                      >
                        {nameSuccess ? 'Saved!' : savingName ? '…' : 'Save'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '0.25rem' }}>Username</div>
                    <div style={{
                      background: '#0f3547', border: '1px solid #1a4a5a',
                      borderRadius: '8px', padding: '0.5rem 0.75rem',
                      color: '#64748b', fontSize: '0.875rem',
                    }}>
                      @{account?.username}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '0.25rem' }}>Email</div>
                    <div style={{
                      background: '#0f3547', border: '1px solid #1a4a5a',
                      borderRadius: '8px', padding: '0.5rem 0.75rem',
                      color: '#64748b', fontSize: '0.875rem',
                    }}>
                      {user?.email}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ ...CARD, marginBottom: '1rem' }}>
                <div style={{ ...LABEL, marginBottom: '0.75rem' }}>Purchases</div>
                {purchases.length === 0 ? (
                  <div style={{ color: '#64748b', fontSize: '0.85rem' }}>No purchases yet</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {purchases.map((p: any) => (
                      <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '0.85rem', color: 'white', fontWeight: 600 }}>{p.product_name ?? p.product_id}</div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                            {new Date(p.purchased_at).toLocaleDateString()}
                          </div>
                        </div>
                        <span style={{
                          background: '#0f3547', border: '1px solid #16a34a33',
                          borderRadius: '6px', padding: '0.2rem 0.5rem',
                          fontSize: '0.72rem', fontWeight: 700, color: '#16a34a',
                        }}>
                          {p.status ?? 'active'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ ...CARD }}>
                <div style={{ ...LABEL, marginBottom: '0.75rem' }}>Danger Zone</div>
                <button
                  onClick={handleSignOut}
                  style={{
                    padding: '0.55rem 1.25rem',
                    borderRadius: '8px',
                    border: '1px solid #ef444455',
                    background: 'transparent',
                    color: '#ef4444',
                    fontSize: '0.85rem', fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'Poppins, sans-serif',
                  }}
                >
                  Sign out
                </button>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}
