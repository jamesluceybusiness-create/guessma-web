'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '../lib/supabase'

export default function SignupPage() {
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [username, setUsername]         = useState('')
  const [displayName, setDisplayName]   = useState('')
  const [error, setError]               = useState(null)
  const [loading, setLoading]           = useState(false)
  const [done, setDone]                 = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (!/^[a-zA-Z0-9_]{1,20}$/.test(username)) {
      setError('Username must be 1–20 characters: letters, numbers, and underscores only.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          display_name: displayName || username,
        },
      },
    })
    setLoading(false)

    if (authError) {
      setError(authError.message)
    } else {
      setDone(true)
    }
  }

  if (done) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📬</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>Check your email</h2>
          <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: 1.6 }}>
            We sent a confirmation link to <strong style={{ color: '#f0f0f0' }}>{email}</strong>.
            Click it to activate your account, then head back to sign in.
          </p>
          <Link href="/login" style={styles.linkBtn}>Go to Sign In →</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <Link href="/" style={styles.backLink}>← Back</Link>

        <h1 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '0.25rem' }}>Create account</h1>
        <p style={{ color: '#555', fontSize: '0.85rem', marginBottom: '1.75rem' }}>Join GUESSMA and track your stats</p>

        {error && (
          <div style={styles.errorBox}>{error}</div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Username <span style={{ color: '#555' }}>(max 20 chars, letters/numbers/underscores)</span></label>
            <input
              type="text"
              required
              maxLength={20}
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="e.g. jlucey"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Display Name <span style={{ color: '#555' }}>(optional)</span></label>
            <input
              type="text"
              maxLength={40}
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="e.g. JLucey"
              style={styles.input}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.submitBtn, opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p style={{ marginTop: '1.25rem', fontSize: '0.8rem', color: '#444', textAlign: 'center' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#f5c842', fontWeight: 700 }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#0a0a0f',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem 1rem',
  },
  card: {
    background: '#13131a',
    border: '1px solid #1f1f1f',
    borderRadius: '1.25rem',
    padding: '2.5rem 2rem',
    width: '100%',
    maxWidth: '420px',
    color: '#f0f0f0',
  },
  backLink: {
    display: 'inline-block',
    fontSize: '0.8rem',
    color: '#555',
    textDecoration: 'none',
    marginBottom: '1.5rem',
    fontWeight: 600,
  },
  errorBox: {
    background: '#2a0f0f',
    border: '1px solid #5a1a1a',
    borderRadius: '0.6rem',
    padding: '0.75rem 1rem',
    color: '#f87171',
    fontSize: '0.85rem',
    marginBottom: '0.5rem',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  label: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#888',
  },
  input: {
    background: '#0a0a0f',
    border: '1px solid #1f1f1f',
    borderRadius: '0.6rem',
    padding: '0.65rem 0.85rem',
    color: '#f0f0f0',
    fontSize: '0.9rem',
    outline: 'none',
    width: '100%',
  },
  submitBtn: {
    marginTop: '0.5rem',
    padding: '0.75rem',
    borderRadius: '0.75rem',
    background: '#f5c842',
    color: '#000',
    fontWeight: 900,
    fontSize: '0.95rem',
    border: 'none',
    cursor: 'pointer',
    letterSpacing: '0.04em',
  },
  linkBtn: {
    display: 'inline-block',
    marginTop: '1.5rem',
    padding: '0.65rem 1.25rem',
    borderRadius: '0.6rem',
    background: '#f5c842',
    color: '#000',
    fontWeight: 800,
    fontSize: '0.85rem',
    textDecoration: 'none',
  },
}
