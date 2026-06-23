'use client'
import Link from 'next/link'
import Nav from '../../components/Nav'

export default function NoGame() {
  return (
    <>
      <Nav />
      <div style={{
        height: '100vh', background: '#091e2a',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '0 clamp(1.5rem, 5vw, 4rem)',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em',
          color: '#29afd4', textTransform: 'uppercase', margin: '0 0 1rem',
        }}>Daily Game</p>
        <h1 style={{
          fontSize: 'clamp(2rem, 6vw, 4rem)',
          fontWeight: 900, color: 'white',
          margin: '0 0 1rem', lineHeight: 1.1,
        }}>No game today.</h1>
        <p style={{
          fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
          color: '#94a3b8', lineHeight: 1.7,
          maxWidth: 'min(440px, 90vw)',
          margin: '0 0 2.5rem',
        }}>
          Today's game hasn't been scheduled yet.
          Check back later — games reset at midnight UTC.
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/" style={{
            background: '#29afd4', color: '#091e2a',
            padding: '0.8rem 2rem', borderRadius: '10px',
            fontWeight: 800, textDecoration: 'none',
            fontSize: 'clamp(0.9rem, 1.8vw, 1rem)',
          }}>← Back to Home</Link>
          <Link href="/how-to-play" style={{
            background: 'transparent', border: '1px solid #1a4a5a',
            color: '#94a3b8',
            padding: '0.8rem 2rem', borderRadius: '10px',
            fontWeight: 600, textDecoration: 'none',
            fontSize: 'clamp(0.9rem, 1.8vw, 1rem)',
          }}>How to Play</Link>
        </div>
      </div>
    </>
  )
}
