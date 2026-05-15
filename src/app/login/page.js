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
      background: '#0a0a0f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
    }}>
      <div style={{
        background: '#13131a',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        padding: '2.5rem 2rem',
        width: '100%',
        maxWidth: '440px',
        color: '#f0f0f0',
      }}>

        <Link href="/" style={{
          display: 'inline-block',
          fontSize: '0.8rem',
          color: '#555',
          textDecoration: 'none',
          marginBottom: '1.75rem',
          fontWeight: 600,
        }}>
          ← Back
        </Link>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, margin: '0 0 0.25rem' }}>Sign in</h1>
        <p style={{ color: '#555', fontSize: '0.85rem', margin: '0 0 1.75rem' }}>Welcome back to GUESSMA</p>

        {error && (
          <div style={{
            background: 'rgba(224,85,85,0.12)',
            border: '1px solid rgba(224,85,85,0.3)',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            color: '#e05555',
            fontSize: '0.85rem',
            marginBottom: '1rem',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#888' }}>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                background: '#0a0a0f',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                padding: '0.7rem 0.9rem',
                color: '#f0f0f0',
                fontSize: '0.9rem',
                outline: 'none',
                width: '100%',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#888' }}>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Your password"
              style={{
                background: '#0a0a0f',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                padding: '0.7rem 0.9rem',
                color: '#f0f0f0',
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
              background: '#f5c842',
              color: '#000',
              fontWeight: 900,
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

        <p style={{ marginTop: '1.25rem', fontSize: '0.82rem', color: '#555', textAlign: 'center' }}>
          Don&apos;t have an account?{' '}
          <Link href="/signup" style={{ color: '#f5c842', fontWeight: 700, textDecoration: 'none' }}>
            Create one
          </Link>
        </p>

        <p style={{ marginTop: '0.6rem', textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: '#333', cursor: 'default' }}>
            Forgot password?
          </span>
        </p>

      </div>
    </div>
  )
}
