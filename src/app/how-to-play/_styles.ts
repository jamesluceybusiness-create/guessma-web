import type { CSSProperties } from 'react'

export const tag: CSSProperties = {
  background: '#0f3547',
  color: '#29afd4',
  border: '1px solid #1a4a5a',
  borderRadius: '999px',
  padding: '0.2rem 0.75rem',
  fontSize: '0.75rem',
  fontWeight: 700,
  display: 'inline-block',
  marginBottom: '0.5rem',
}

export const tagComingSoon: CSSProperties = {
  background: '#1a1a3a',
  color: '#818cf8',
  border: '1px solid #3730a3',
  borderRadius: '999px',
  padding: '0.2rem 0.75rem',
  fontSize: '0.75rem',
  fontWeight: 700,
  display: 'inline-block',
  marginLeft: '0.75rem',
}

export const h1: CSSProperties = {
  fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
  fontWeight: 900,
  color: 'white',
  lineHeight: 1.15,
  margin: '0.5rem 0 0.25rem 0',
}

export const h2: CSSProperties = {
  fontSize: '1.2rem',
  fontWeight: 900,
  color: 'white',
  margin: '0 0 0.75rem 0',
}

export const p: CSSProperties = {
  fontFamily: 'Georgia, serif',
  fontSize: '1rem',
  lineHeight: 1.8,
  color: '#94a3b8',
  margin: '0 0 1rem 0',
}

export const hr: CSSProperties = {
  border: 'none',
  borderBottom: '1px solid #1a4a5a',
  margin: '2rem 0',
}

export const sec: CSSProperties = {
  marginBottom: '2rem',
}

export const tbl = {
  table: {
    borderCollapse: 'collapse',
    width: '100%',
    marginTop: '0.75rem',
  } as CSSProperties,
  th: {
    background: '#0f3547',
    color: '#29afd4',
    padding: '0.6rem 1rem',
    textAlign: 'left' as const,
    fontSize: '0.85rem',
    fontWeight: 700,
  } as CSSProperties,
  td: {
    padding: '0.6rem 1rem',
    borderBottom: '1px solid #1a4a5a',
    color: '#94a3b8',
    fontSize: '0.9rem',
  } as CSSProperties,
}
