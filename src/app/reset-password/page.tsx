'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../lib/supabase'

type State = 'loading' | 'form' | 'success' | 'error'

const PAGE: React.CSSProperties = {
  minHeight: '100vh',
  background: '#091e2a',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'Poppins, sans-serif',
  padding: '2rem 1rem',
}

const CARD: React.CSSProperties = {
  background: '#0d2d3d',
  border: '1px solid #1a4a5a',
  borderRadius: 16,
  padding: '2.5rem 2rem',
  width: '100%',
  maxWidth: 380,
}

const INPUT: React.CSSProperties = {
  width: '100%',
  background: '#091e2a',
  border: '1px solid #1a4a5a',
  borderRadius: 8,
  padding: '0.75rem 1rem',
  color: '#ffffff',
  fontFamily: 'Poppins, sans-serif',
  fontSize: '1rem',
}

const ERROR_BOX: React.CSSProperties = {
  background: 'rgba(239,68,68,0.12)',
  border: '1px solid rgba(239,68,68,0.4)',
  borderRadius: 8,
  padding: '0.75rem 1rem',
  color: '#ef4444',
  fontSize: '0.85rem',
}

const CTA_BUTTON: React.CSSProperties = {
  background: '#29afd4',
  border: 'none',
  borderRadius: 8,
  padding: '0.75rem 1rem',
  color: '#091e2a',
  fontFamily: 'Poppins, sans-serif',
  fontSize: '1rem',
  fontWeight: 800,
  width: '100%',
  cursor: 'pointer',
  textAlign: 'center',
  display: 'block',
}

export default function ResetPasswordPage() {
  const supabase = createClient()

  const [state, setState] = useState<State>('loading')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function init() {
      try {
        const { data, error: sessionErr } = await supabase.auth.getSession()
        if (sessionErr || !data.session) {
          setState('error')
          return
        }
        setState('form')
      } catch {
        setState('error')
      }
    }
    init()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    try {
      const { error: updateErr } = await supabase.auth.updateUser({ password: newPassword })
      if (updateErr) {
        setError(updateErr.message)
        setSubmitting(false)
        return
      }
      setState('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (state === 'loading') {
    return (
      <div style={{ ...PAGE, flexDirection: 'column', gap: '1rem' }}>
        <div
          style={{
            width: 40,
            height: 40,
            border: '4px solid #1a4a5a',
            borderTop: '4px solid #29afd4',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>Verifying reset link...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (state === 'success') {
    return (
      <div style={PAGE}>
        <div style={{ ...CARD, textAlign: 'center' }}>
          <div style={{ fontSize: '3.5rem', lineHeight: 1, marginBottom: '1rem', color: '#16a34a' }}>✓</div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '0.75rem' }}>
            Password updated!
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '1.75rem' }}>
            Your password has been changed. You can now sign in with your new password.
          </p>
          <Link href="/login" style={CTA_BUTTON}>
            Go to Sign In
          </Link>
        </div>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div style={PAGE}>
        <div style={{ ...CARD, textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '0.75rem' }}>
            Link expired
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '1.75rem' }}>
            This password reset link is invalid or has expired. Reset links are only valid for 1 hour.
          </p>
          <Link href="/login" style={CTA_BUTTON}>
            Request New Link
          </Link>
        </div>
      </div>
    )
  }

  // form state
  return (
    <div style={PAGE}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <Link
          href="/"
          style={{
            display: 'inline-block',
            color: '#94a3b8',
            fontSize: '0.85rem',
            textDecoration: 'none',
            marginBottom: '1rem',
          }}
        >
          ← Back
        </Link>

        <div style={CARD}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
            Set New Password
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '1.75rem' }}>
            Choose a strong password for your GUESSMA account.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <input
              type="password"
              minLength={8}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value)
                setError(null)
              }}
              placeholder="New password"
              style={INPUT}
              autoComplete="new-password"
            />

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                setError(null)
              }}
              placeholder="Confirm password"
              style={INPUT}
              autoComplete="new-password"
            />

            {error && <div style={ERROR_BOX}>{error}</div>}

            <button
              type="submit"
              disabled={submitting}
              style={{
                ...CTA_BUTTON,
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
