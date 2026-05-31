'use client'

import Link from 'next/link'
import Nav from '../../components/Nav'

export default function NoGame() {
  return (
    <>
      <Nav />
      <div style={{
        minHeight: '100vh', background: '#0a0f0a',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '80px 1.5rem 2rem',
      }}>
        <div style={{
          background: '#0d1710', border: '1px solid #1a2e1a', borderRadius: '16px',
          padding: '3rem 2.5rem', maxWidth: '420px', width: '100%', textAlign: 'center',
          display: 'flex', flexDirection: 'column', gap: '1rem',
        }}>
          <div style={{ fontSize: '2.5rem' }}>🎮</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', margin: 0 }}>
            No game today
          </h1>
          <p style={{ color: '#4a7a4a', fontSize: '0.9rem', margin: 0 }}>
            Check back tomorrow — games reset at midnight UTC.
          </p>
          <Link
            href="/"
            style={{
              marginTop: '0.5rem', padding: '0.65rem 1.5rem',
              background: '#16a34a', color: 'white', borderRadius: '10px',
              textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem',
              display: 'inline-block',
            }}
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </>
  )
}
