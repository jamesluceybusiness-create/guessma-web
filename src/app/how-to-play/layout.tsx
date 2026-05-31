'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Nav from '../components/Nav'

const NAV_SECTIONS = [
  {
    header: 'GENERAL',
    links: [
      { label: 'What is GUESSMA?', href: '/how-to-play/what-is-guessma' },
      { label: 'Setup Guide',       href: '/how-to-play/setup-guide' },
      { label: 'Best Practices',    href: '/how-to-play/best-practices' },
    ],
  },
  {
    header: 'GAME MODES',
    links: [
      { label: 'Duos',         href: '/how-to-play/duos' },
      { label: 'Free For All', href: '/how-to-play/ffa' },
      { label: 'Odd Man In',   href: '/how-to-play/odd-man-in' },
    ],
  },
  {
    header: 'CATEGORIES — CORE',
    links: [
      { label: 'Sports',                   href: '/how-to-play/sports' },
      { label: 'Food',                     href: '/how-to-play/food' },
      { label: 'Groups',                   href: '/how-to-play/groups' },
      { label: 'What A Blank Would Say',   href: '/how-to-play/what-a-blank-would-say' },
      { label: 'Act It Out',               href: '/how-to-play/act-it-out' },
    ],
  },
  {
    header: 'CATEGORIES — ICEBREAKER',
    links: [
      { label: 'Country Outlines', href: '/how-to-play/country-outlines' },
    ],
  },
]

export default function HowToPlayLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const sidebarContent = (
    <div style={{ paddingTop: '0.5rem', paddingBottom: '1.5rem' }}>
      {NAV_SECTIONS.map(section => (
        <div key={section.header}>
          <p style={{
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontSize: '0.65rem',
            color: '#4a7a4a',
            fontWeight: 700,
            padding: '1rem 1.25rem 0.4rem',
            margin: 0,
          }}>
            {section.header}
          </p>
          {section.links.map(link => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="htp-nav-link"
                style={{
                  display: 'block',
                  padding: '0.45rem 1.25rem',
                  paddingLeft: isActive ? 'calc(1.25rem - 3px)' : '1.25rem',
                  fontSize: '0.875rem',
                  color: isActive ? 'white' : '#9ab89a',
                  fontWeight: 500,
                  textDecoration: 'none',
                  background: isActive ? '#1a3a1a' : 'transparent',
                  borderLeft: isActive ? '3px solid #22c55e' : '3px solid transparent',
                  transition: 'color 0.1s, background 0.1s',
                }}
              >
                {link.label}
              </Link>
            )
          })}
        </div>
      ))}
    </div>
  )

  return (
    <>
      <Nav />

      <style>{`
        .htp-nav-link:hover {
          color: white !important;
          background: #152815 !important;
        }
        .htp-mobile-bar {
          display: none !important;
        }
        .htp-overlay {
          display: none;
        }
        @media (max-width: 768px) {
          .htp-mobile-bar {
            display: flex !important;
          }
          .htp-sidebar {
            position: fixed !important;
            top: 64px;
            left: 0;
            bottom: 0;
            width: 260px;
            z-index: 40;
            transform: translateX(-100%);
            transition: transform 0.25s ease;
            overflow-y: auto !important;
          }
          .htp-sidebar.open {
            transform: translateX(0);
          }
          .htp-overlay.open {
            display: block !important;
            position: fixed;
            inset: 0;
            top: 64px;
            background: rgba(0, 0, 0, 0.6);
            z-index: 39;
          }
        }
      `}</style>

      {/* Mobile overlay backdrop */}
      <div
        className={`htp-overlay${mobileOpen ? ' open' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      <div style={{
        marginTop: '64px',
        height: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
        background: '#0a0f0a',
      }}>
        {/* Mobile toggle bar */}
        <div
          className="htp-mobile-bar"
          style={{
            flexShrink: 0,
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.6rem 1.25rem',
            background: '#0d1710',
            borderBottom: '1px solid #1a2e1a',
          }}
        >
          <button
            onClick={() => setMobileOpen(v => !v)}
            style={{
              background: 'none',
              border: '1px solid #1a2e1a',
              color: '#9ab89a',
              borderRadius: '0.4rem',
              padding: '0.35rem 0.75rem',
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            ☰ Contents
          </button>
        </div>

        {/* Two-column row */}
        <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
          {/* Sidebar */}
          <aside
            className={`htp-sidebar${mobileOpen ? ' open' : ''}`}
            style={{
              width: '260px',
              flexShrink: 0,
              background: '#0d1710',
              borderRight: '1px solid #1a2e1a',
              overflowY: 'auto',
            }}
          >
            {sidebarContent}
          </aside>

          {/* Content area */}
          <main style={{ flex: 1, overflowY: 'auto', background: '#0a0f0a' }}>
            <div style={{ padding: '3rem', maxWidth: '760px' }}>
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  )
}
