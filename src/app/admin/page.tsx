'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../lib/supabase'
import ScheduleTab from './components/ScheduleTab'
import PromptsTab from './components/PromptsTab'
import AddContentTab from './components/AddContentTab'
import AnalyticsTab from './components/AnalyticsTab'

type Tab = 'schedule' | 'prompts' | 'add' | 'analytics'

const OWNER_EMAIL = 'luceyjames2021@gmail.com'

const TABS: { id: Tab; label: string }[] = [
  { id: 'schedule', label: 'Schedule' },
  { id: 'prompts', label: 'Prompts' },
  { id: 'add', label: 'Add Content' },
  { id: 'analytics', label: 'Analytics' },
]

export default function AdminPage() {
  const router = useRouter()
  const supabase = createClient()
  const [authChecked, setAuthChecked] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [mfaLevel, setMfaLevel] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('schedule')
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.email !== OWNER_EMAIL) {
        router.replace('/')
        return
      }

      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
      const currentLevel = aalData?.currentLevel
      const nextLevel = aalData?.nextLevel

      if (nextLevel === 'aal2' && currentLevel !== 'aal2') {
        router.push('/admin-verify')
        return
      }

      setUserEmail(user.email)
      setMfaLevel(currentLevel ?? null)
      setAuthChecked(true)
    }
    checkAuth()
  }, [])

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.replace('/')
  }

  if (!authChecked) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#091e2a' }}>
        <div style={{ width: 48, height: 48, border: '4px solid #1a4a5a', borderTop: '4px solid #29afd4', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#091e2a', color: '#c8d8c8', fontFamily: 'Poppins, sans-serif', overflow: 'hidden' }}>
      {/* Top bar */}
      <div style={{ height: 48, flexShrink: 0, background: '#0d2d3d', borderBottom: '1px solid #1a4a5a', display: 'flex', alignItems: 'center', paddingInline: '1.5rem', gap: '1.5rem' }}>
        <span style={{ color: '#29afd4', fontWeight: 900, fontSize: '0.9rem', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>GUESSMA ADMIN</span>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.25rem', flex: 1, justifyContent: 'center' }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.25rem 0.9rem',
                fontSize: '0.8rem',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 600,
                color: activeTab === t.id ? '#fff' : '#94a3b8',
                borderBottom: activeTab === t.id ? '2px solid #29afd4' : '2px solid transparent',
                transition: 'color 0.15s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', whiteSpace: 'nowrap' }}>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{userEmail}</span>
          {mfaLevel !== 'aal2' && (
            <a
              href="/account/setup-mfa"
              style={{ fontSize: '0.72rem', color: '#29afd4', textDecoration: 'none', fontWeight: 700 }}
            >
              Setup 2FA →
            </a>
          )}
          <button
            onClick={signOut}
            style={{ background: 'none', border: '1px solid #1a4a5a', borderRadius: 6, padding: '0.2rem 0.6rem', fontSize: '0.72rem', color: '#94a3b8', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'schedule'  && <ScheduleTab   supabase={supabase} showToast={showToast} />}
        {activeTab === 'prompts'   && <PromptsTab    supabase={supabase} showToast={showToast} />}
        {activeTab === 'add'       && <AddContentTab supabase={supabase} showToast={showToast} />}
        {activeTab === 'analytics' && <AnalyticsTab  supabase={supabase} showToast={showToast} />}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '1rem', right: '1rem', zIndex: 9999,
          background: toast.ok ? '#14532d' : '#7f1d1d',
          border: `1px solid ${toast.ok ? '#16a34a' : '#ef4444'}`,
          borderRadius: 8, padding: '0.6rem 1rem',
          fontSize: '0.82rem', color: '#fff', fontFamily: 'Poppins, sans-serif',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          animation: 'fadeIn 0.15s ease',
        }}>
          {toast.msg}
        </div>
      )}
      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(-4px) } to { opacity:1; transform:translateY(0) } }`}</style>
    </div>
  )
}
