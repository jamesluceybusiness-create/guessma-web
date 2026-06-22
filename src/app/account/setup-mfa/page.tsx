'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase'

const CARD: React.CSSProperties = {
  background: '#0d1710',
  border: '1px solid #1a2e1a',
  borderRadius: 16,
  padding: '2.5rem 2rem',
  width: '100%',
  maxWidth: 420,
}

const INPUT: React.CSSProperties = {
  background: '#0a0f0a',
  border: '1px solid #1a2e1a',
  borderRadius: 8,
  padding: '0.65rem 0.85rem',
  color: '#c8d8c8',
  fontFamily: 'Poppins, sans-serif',
  fontSize: '1.1rem',
  width: '100%',
  letterSpacing: '0.15em',
  textAlign: 'center',
}

const LABEL: React.CSSProperties = {
  fontSize: '0.62rem',
  fontWeight: 700,
  letterSpacing: '0.1em',
  color: '#4a7a4a',
  textTransform: 'uppercase',
  marginBottom: '0.4rem',
  display: 'block',
}

export default function SetupMfaPage() {
  const router = useRouter()
  const supabase = createClient()
  const codeRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [alreadyEnabled, setAlreadyEnabled] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [factorId, setFactorId] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/login'); return }

      const { data: factors } = await supabase.auth.mfa.listFactors()
      const verified = factors?.totp?.find(f => f.status === 'verified')
      if (verified) {
        setAlreadyEnabled(true)
        setLoading(false)
        return
      }

      const { data, error: enrollError } = await supabase.auth.mfa.enroll({ factorType: 'totp' })
      if (enrollError || !data) {
        setError('Failed to start enrollment. Please try again.')
        setLoading(false)
        return
      }

      setFactorId(data.id)
      setQrCode(data.totp.qr_code)
      setSecret(data.totp.secret)
      setLoading(false)
      setTimeout(() => codeRef.current?.focus(), 100)
    }
    init()
  }, [])

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    if (!factorId || code.length !== 6) return
    setVerifying(true)
    setError(null)

    const { data: challengeData, error: challengeErr } = await supabase.auth.mfa.challenge({ factorId })
    if (challengeErr || !challengeData) {
      setError('Failed to start challenge. Try again.')
      setVerifying(false)
      return
    }

    const { error: verifyErr } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challengeData.id,
      code,
    })
    setVerifying(false)
    if (verifyErr) {
      setError('Invalid code — check your app and try again')
      setCode('')
      codeRef.current?.focus()
      return
    }
    setSuccess(true)
  }

  function copySecret() {
    if (!secret) return
    navigator.clipboard.writeText(secret)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const PAGE: React.CSSProperties = {
    minHeight: '100vh',
    background: '#0a0f0a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Poppins, sans-serif',
    padding: '2rem 1rem',
  }

  if (loading) {
    return (
      <div style={PAGE}>
        <div style={{ width: 40, height: 40, border: '4px solid #1a2e1a', borderTop: '4px solid #22c55e', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (alreadyEnabled) {
    return (
      <div style={PAGE}>
        <div style={CARD}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>✅</div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#22c55e', marginBottom: '0.75rem' }}>MFA Already Enabled</h1>
            <p style={{ fontSize: '0.85rem', color: '#9ab89a', lineHeight: 1.6 }}>
              Two-factor authentication is already enabled on your account.
            </p>
          </div>
          <button
            onClick={() => router.push('/profile')}
            style={{ width: '100%', background: '#14532d', border: '1px solid #22c55e', borderRadius: 8, padding: '0.65rem', color: '#22c55e', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', fontSize: '0.85rem', fontWeight: 700 }}
          >
            Return to Profile
          </button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div style={PAGE}>
        <div style={CARD}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🔐</div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#22c55e', marginBottom: '0.75rem' }}>
              ✓ Two-factor authentication enabled!
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#9ab89a', lineHeight: 1.6 }}>
              You will now need your authenticator app every time you access the admin panel.
            </p>
          </div>
          <button
            onClick={() => router.push('/admin')}
            style={{ width: '100%', background: '#22c55e', border: 'none', borderRadius: 8, padding: '0.65rem', color: '#000', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', fontSize: '0.9rem', fontWeight: 900 }}
          >
            Go to Admin →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={PAGE}>
      <div style={CARD}>
        <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: '0.4rem' }}>
          Set Up Two-Factor Authentication
        </h1>
        <p style={{ fontSize: '0.82rem', color: '#9ab89a', marginBottom: '1.5rem', lineHeight: 1.5 }}>
          Scan this QR code with Google Authenticator or Authy.
        </p>

        {/* QR code */}
        {qrCode && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <div style={{ background: '#fff', padding: 12, borderRadius: 10 }}>
              <img
                src={`data:image/svg+xml;utf8,${encodeURIComponent(qrCode)}`}
                width={200}
                height={200}
                alt="MFA QR code"
                style={{ display: 'block' }}
              />
            </div>
          </div>
        )}

        {/* Manual secret */}
        {secret && (
          <div style={{ marginBottom: '1.5rem' }}>
            <span style={LABEL}>Can&apos;t scan? Enter this code manually:</span>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <code style={{ flex: 1, background: '#0a0f0a', border: '1px solid #1a2e1a', borderRadius: 6, padding: '0.45rem 0.65rem', fontFamily: 'monospace', fontSize: '0.85rem', color: '#22c55e', letterSpacing: '0.12em', wordBreak: 'break-all' }}>
                {secret}
              </code>
              <button
                onClick={copySecret}
                style={{ flexShrink: 0, background: copied ? '#14532d' : '#1a2e1a', border: `1px solid ${copied ? '#22c55e' : '#1a2e1a'}`, borderRadius: 6, padding: '0.4rem 0.65rem', color: copied ? '#22c55e' : '#9ab89a', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', fontSize: '0.72rem', fontWeight: 700, transition: 'all 0.15s' }}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        )}

        {/* Verify form */}
        <form onSubmit={handleVerify}>
          <label style={LABEL}>Enter the 6-digit code from your app</label>
          <input
            ref={codeRef}
            type="text"
            inputMode="numeric"
            maxLength={6}
            pattern="[0-9]*"
            value={code}
            onChange={e => { setCode(e.target.value.replace(/\D/g, '')); setError(null) }}
            placeholder="000000"
            style={INPUT}
            autoComplete="one-time-code"
          />

          {error && (
            <p style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '0.5rem' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={verifying || code.length !== 6}
            style={{
              marginTop: '1rem',
              width: '100%',
              background: code.length === 6 ? '#22c55e' : '#1a2e1a',
              border: 'none',
              borderRadius: 8,
              padding: '0.65rem',
              color: code.length === 6 ? '#000' : '#52525b',
              cursor: verifying || code.length !== 6 ? 'not-allowed' : 'pointer',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '0.9rem',
              fontWeight: 900,
              transition: 'background 0.15s',
              opacity: verifying ? 0.7 : 1,
            }}
          >
            {verifying ? 'Verifying…' : 'Enable 2FA'}
          </button>
        </form>
      </div>
    </div>
  )
}
