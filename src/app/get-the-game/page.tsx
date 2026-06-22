import Nav from '../components/Nav'

export default function GetTheGamePage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}>
      <Nav />
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '2rem', paddingTop: '7rem',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em',
          color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '1rem',
        }}>
          One-time purchase
        </p>
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800,
          color: 'var(--color-text)', margin: '0 0 0.75rem',
        }}>
          Get the Game
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', marginBottom: '3rem', maxWidth: '420px', lineHeight: 1.6 }}>
          Everything you need for the full GUESSMA experience.
        </p>

        <div style={{
          background: 'var(--color-surface)',
          border: '1.5px solid rgba(41,175,212,0.25)',
          borderRadius: '20px',
          padding: '2.5rem 3rem',
          width: '100%', maxWidth: '380px',
          display: 'flex', flexDirection: 'column', gap: '1.5rem',
        }}>
          <div>
            <div style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1 }}>$5</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>one-time · no subscription</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left' }}>
            {[
              'Full board game access',
              'Base game modes — Duos, Free For All, and Odd Man In',
              '5 core categories + 2 icebreakers to get you started',
              'Base themes — Light, Dark, and GUESSMA Default',
              'Custom category creator — build and play your own prompts',
              'Access to the Game Library — redeem or purchase new categories and themes with karma',
              'Full session history and player stats',
            ].map(feature => (
              <div key={feature} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <span style={{ color: 'var(--color-green)', fontSize: '1rem', fontWeight: 700, flexShrink: 0, marginTop: '0.1rem' }}>✓</span>
                <span style={{ color: 'var(--color-text)', fontSize: '0.95rem' }}>{feature}</span>
              </div>
            ))}
          </div>

          <button style={{
            background: 'var(--color-green)', color: '#fff',
            border: 'none', borderRadius: '10px',
            padding: '0.9rem', fontSize: '1rem', fontWeight: 700,
            cursor: 'pointer', width: '100%',
          }}>
            Get the Game
          </button>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', margin: 0, textAlign: 'center', lineHeight: 1.5 }}>
            The free daily game is always available — no purchase required.<br />
            New game modes and premium categories may be released separately.
          </p>
        </div>
      </div>
    </main>
  )
}
