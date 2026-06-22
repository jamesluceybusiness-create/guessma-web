'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '../lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState(null)
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)

    if (authError) {
      setError(authError.message)
    } else {
      router.push('/profile')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#091e2a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
    }}>
      <div style={{
        background: '#0d2d3d',
        border: '1px solid #1a4a5a',
        borderRadius: 16,
        padding: '2.5rem 2rem',
        width: '100%',
        maxWidth: '440px',
        color: '#ffffff',
      }}>

        <Link href="/" style={{
          display: 'inline-block',
          fontSize: '0.8rem',
          color: '#94a3b8',
          textDecoration: 'none',
          marginBottom: '1.75rem',
          fontWeight: 600,
        }}>
          ← Back
        </Link>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, margin: '0 0 0.25rem' }}>Sign in</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 1.75rem' }}>Welcome back to GUESSMA</p>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.12)',
            border: '1px solid rgba(239,68,68,0.4)',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            color: '#ef4444',
            fontSize: '0.85rem',
            marginBottom: '1rem',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                background: '#091e2a',
                border: '1px solid #1a4a5a',
                borderRadius: '8px',
                padding: '0.7rem 0.9rem',
                color: '#ffffff',
                fontSize: '0.9rem',
                outline: 'none',
                width: '100%',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Your password"
              style={{
                background: '#091e2a',
                border: '1px solid #1a4a5a',
                borderRadius: '8px',
                padding: '0.7rem 0.9rem',
                color: '#ffffff',
                fontSize: '0.9rem',
                outline: 'none',
                width: '100%',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '0.5rem',
              padding: '0.8rem',
              borderRadius: '10px',
              background: '#29afd4',
              color: '#091e2a',
              fontWeight: 800,
              fontSize: '0.95rem',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              width: '100%',
              letterSpacing: '0.03em',
              transition: 'opacity 0.15s',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ marginTop: '1.25rem', fontSize: '0.82rem', color: '#94a3b8', textAlign: 'center' }}>
          Don&apos;t have an account?{' '}
          <Link href="/signup" style={{ color: '#29afd4', fontWeight: 700, textDecoration: 'none' }}>
            Create one
          </Link>
        </p>

        <p style={{ marginTop: '0.6rem', textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', cursor: 'default' }}>
            Forgot password?
          </span>
        </p>

      </div>
    </div>
  )
}
