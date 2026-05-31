'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../lib/supabase'

export default function RedeemPage() {
  const [user, setUser]         = useState(null)
  const [accountId, setAccountId] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [code, setCode]         = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [success, setSuccess]   = useState(null)

  useEffect(() => {
    async function loadAuth() {
      const supabase = createClient()
      try {
        const { data: { user: u } } = await supabase.auth.getUser()
        setUser(u)
        if (u) {
          const { data: acc } = await supabase.from('accounts').select('id').eq('user_id', u.id).single()
          if (acc) setAccountId(acc.id)
        }
      } catch (_) {}
      setAuthReady(true)
    }
    loadAuth()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const trimmed = code.trim().toUpperCase()
    if (!trimmed) return

    setLoading(true)
    const supabase = createClient()

    try {
      // 1. Look up the code
      const { data: lockerCode, error: lookupErr } = await supabase
        .from('locker_codes')
        .select('*')
        .eq('code', trimmed)
        .eq('is_active', true)
        .single()

      if (lookupErr || !lockerCode) {
        setError('Code not found or no longer active.')
        setLoading(false)
        return
      }

      // 2. Check expiry
      if (lockerCode.expires_at && new Date(lockerCode.expires_at) < new Date()) {
        setError('This code has expired.')
        setLoading(false)
        return
      }

      // 3. Check max uses
      if (lockerCode.max_uses !== null && lockerCode.uses_count >= lockerCode.max_uses) {
        setError('This code has been fully claimed.')
        setLoading(false)
        return
      }

      // 4. Check if already redeemed
      const { data: existing } = await supabase
        .from('locker_code_redemptions')
        .select('id')
        .eq('account_id', accountId)
        .eq('code_id', lockerCode.id)
        .maybeSingle()

      if (existing) {
        setError('You have already redeemed this code.')
        setLoading(false)
        return
      }

      // 5. Insert redemption record
      await supabase.from('locker_code_redemptions').insert({
        account_id: accountId,
        code_id:    lockerCode.id,
      })

      // 6. Increment uses_count
      await supabase
        .from('locker_codes')
        .update({ uses_count: lockerCode.uses_count + 1 })
        .eq('id', lockerCode.id)

      // 7. Apply reward
      const rv = lockerCode.reward_value
      const ct = lockerCode.code_type

      if (ct === 'karma') {
        const amount = parseInt(rv, 10)
        const { data: acc } = await supabase.from('accounts').select('karma_balance, karma_lifetime').eq('id', accountId).single()
        await supabase.from('accounts').update({
          karma_balance:  (acc?.karma_balance  ?? 0) + amount,
          karma_lifetime: (acc?.karma_lifetime ?? 0) + amount,
        }).eq('id', accountId)
        await supabase.from('karma_log').insert({
          account_id: accountId,
          amount,
          source: `locker_code:${trimmed}`,
        })
        setSuccess(`🎉 +${amount} karma added to your account!`)
      } else if (ct === 'free_game') {
        await supabase.from('accounts').update({ full_game_unlocked: true }).eq('id', accountId)
        setSuccess('🎮 Full game unlocked! Check your email for setup instructions.')
      } else if (ct === 'category') {
        await supabase.from('purchases').insert({
          account_id:  accountId,
          item_type:   'category',
          item_id:     String(rv),
          price_paid:  0,
          karma_spent: 0,
        })
        setSuccess('🎉 Category unlocked and added to your account!')
      } else if (ct === 'theme') {
        await supabase.from('purchases').insert({
          account_id:  accountId,
          item_type:   'theme',
          item_id:     String(rv),
          price_paid:  0,
          karma_spent: 0,
        })
        setSuccess('🎨 Theme unlocked and added to your account!')
      } else {
        setSuccess('Code redeemed successfully!')
      }

      setCode('')
    } catch (err) {
      setError('Something went wrong. Please try again.')
    }

    setLoading(false)
  }

  if (!authReady) return null

  if (!user) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <p style={{ color: '#a1a1aa', fontSize: '1rem', textAlign: 'center', marginBottom: '1.25rem' }}>
            Sign in to redeem a code
          </p>
          <Link href="/login" style={styles.linkBtn}>Sign In →</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <Link href="/" style={styles.backLink}>← Back</Link>

        <h1 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '0.25rem' }}>Redeem a Code</h1>
        <p style={{ color: '#555', fontSize: '0.85rem', marginBottom: '1.75rem' }}>
          Enter a locker code or redemption code below
        </p>

        {error && <div style={styles.errorBox}>{error}</div>}
        {success && <div style={styles.successBox}>{success}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={styles.field}>
            <label style={styles.label}>Code</label>
            <input
              type="text"
              required
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="Enter your code"
              style={{ ...styles.input, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !accountId}
            style={{ ...styles.submitBtn, opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Redeeming…' : 'Redeem'}
          </button>
        </form>
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
  successBox: {
    background: '#052e16',
    border: '1px solid #166534',
    borderRadius: '0.6rem',
    padding: '0.75rem 1rem',
    color: '#4ade80',
    fontSize: '0.9rem',
    fontWeight: 700,
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
    fontSize: '0.95rem',
    outline: 'none',
    width: '100%',
  },
  submitBtn: {
    marginTop: '0.5rem',
    padding: '0.75rem',
    borderRadius: '0.75rem',
    background: '#16a34a',
    color: '#fff',
    fontWeight: 900,
    fontSize: '0.95rem',
    border: 'none',
    cursor: 'pointer',
    letterSpacing: '0.04em',
  },
  linkBtn: {
    display: 'block',
    textAlign: 'center',
    padding: '0.75rem',
    borderRadius: '0.75rem',
    background: '#f5c842',
    color: '#000',
    fontWeight: 800,
    fontSize: '0.95rem',
    textDecoration: 'none',
  },
}
