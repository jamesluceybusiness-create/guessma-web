'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '../lib/supabase'

export default function Nav() {
  const router   = useRouter()
  const supabase = createClient()
  const [user, setUser]               = useState<any>(null)
  const [account, setAccount]         = useState<any>(null)
  const [playerStats, setPlayerStats] = useState<any>(null)

  useEffect(() => {
    async function loadAuth() {
      try {
        const { data: { user: u } } = await supabase.auth.getUser()
        setUser(u)
        if (u) {
          const [{ data: acc }, { data: stats }] = await Promise.all([
            supabase.from('accounts').select('id, display_name, username, karma_lifetime').eq('id', u.id).single(),
            supabase.from('player_stats').select('current_streak').eq('account_id', u.id).single(),
          ])
          setAccount(acc)
          setPlayerStats(stats)
        }
      } catch (_) {}
    }
    loadAuth()
  }, [])

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      padding: '0 2rem',
      height: '64px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      background: 'rgba(9,30,42,0.95)', backdropFilter: 'blur(10px)',
      borderBottom: '1px solid #1a4a5a',
    }}>
      <Link href="/" style={{
        fontWeight: 900, fontSize: '1.3rem', letterSpacing: '0.06em',
        color: '#29afd4', textDecoration: 'none',
      }}>
        GUESSMA
      </Link>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <Link href="/daily" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>
          Daily
        </Link>
        <Link href="/how-to-play" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>
          How to Play
        </Link>
        <Link href="/get-the-game" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>
          Get the Game
        </Link>
        <Link href="/news" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>
          News
        </Link>
        <Link href="/redeem" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>
          Redeem
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        {user && account ? (
          <div style={{
            background: '#0d2d3d',
            border: '1px solid #1a4a5a',
            borderRadius: '0.75rem',
            padding: '0.4rem 0.75rem',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '0.6rem',
            cursor: 'pointer',
          }} onClick={() => router.push('/profile')}>
            <div style={{
              width: '34px', height: '34px',
              borderRadius: '50%',
              background: '#29afd4',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: '0.8rem', color: 'white',
              textTransform: 'uppercase', flexShrink: 0,
            }}>
              {(account.display_name || '?').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.05rem' }}>
              <span style={{ fontWeight: 900, color: 'white', fontSize: '0.8rem', lineHeight: 1.1 }}>
                {account.display_name}
              </span>
              <span style={{ color: '#71717a', fontSize: '0.65rem' }}>
                @{account.username}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.1rem', marginLeft: '0.5rem' }}>
              <span style={{ color: '#29afd4', fontWeight: 900, fontSize: '0.75rem' }}>
                {account.karma_lifetime ?? 0} <span style={{ color: '#52525b', fontWeight: 400, fontSize: '0.6rem' }}>KARMA</span>
              </span>
              <span style={{ color: '#facc15', fontWeight: 700, fontSize: '0.7rem' }}>
                🔥 {playerStats?.current_streak ?? 0} <span style={{ color: '#52525b', fontWeight: 400, fontSize: '0.6rem' }}>STREAK</span>
              </span>
            </div>
          </div>
        ) : (
          <>
            <Link href="/login" style={{
              color: '#94a3b8', textDecoration: 'none',
              fontSize: '0.9rem', fontWeight: 500,
              padding: '0.45rem 1rem',
            }}>
              Sign in
            </Link>
            <Link href="/signup" style={{
              background: '#29afd4', color: '#091e2a',
              padding: '0.45rem 1.1rem', borderRadius: '8px',
              fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem',
            }}>
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
