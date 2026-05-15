import Link from 'next/link'

export default function Home() {
  return (
    <main>

      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        padding: '1rem 2rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)'
      }}>
        <span style={{ fontWeight: 900, fontSize: '1.4rem', letterSpacing: '0.05em', color: '#f5c842' }}>
          GUESSMA
        </span>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link href="/login" style={{ color: '#ccc', textDecoration: 'none', fontSize: '0.95rem' }}>
            Sign in
          </Link>
          <Link href="/signup" style={{
            background: '#f5c842', color: '#0a0a0f',
            padding: '0.5rem 1.2rem', borderRadius: '8px',
            fontWeight: 700, textDecoration: 'none', fontSize: '0.95rem'
          }}>
            Sign up
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #0a0a0f 0%, #12121e 60%, #0f1a12 100%)',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        textAlign: 'center', padding: '2rem',
        paddingTop: '6rem'
      }}>
        <div style={{
          display: 'inline-block',
          background: 'rgba(245,200,66,0.12)',
          border: '1px solid rgba(245,200,66,0.3)',
          borderRadius: '999px',
          padding: '0.35rem 1rem',
          fontSize: '0.8rem', fontWeight: 600,
          color: '#f5c842', letterSpacing: '0.08em',
          marginBottom: '1.5rem'
        }}>
          DAILY GAME NOW LIVE
        </div>

        <h1 style={{
          fontSize: 'clamp(2.8rem, 8vw, 6rem)',
          fontWeight: 900, margin: '0 0 1rem',
          lineHeight: 1.05, letterSpacing: '-0.02em'
        }}>
          The world's first<br />
          <span style={{ color: '#f5c842' }}>at-home gameshow</span><br />
          for two.
        </h1>

        <p style={{
          fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
          color: '#aaa', maxWidth: '540px',
          lineHeight: 1.6, margin: '0 0 2.5rem'
        }}>
          Grab a friend. One device. Take on today's challenge together —
          a new icebreaker and a 60-second round, every single day.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/daily" style={{
            background: '#f5c842', color: '#0a0a0f',
            padding: '1rem 2rem', borderRadius: '12px',
            fontWeight: 800, textDecoration: 'none',
            fontSize: '1.1rem', letterSpacing: '0.02em'
          }}>
            Play Today's Game →
          </Link>
          <Link href="/signup" style={{
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#f0f0f0',
            padding: '1rem 2rem', borderRadius: '12px',
            fontWeight: 600, textDecoration: 'none',
            fontSize: '1.1rem'
          }}>
            Create Account
          </Link>
        </div>

        <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#555' }}>
          Free to play. No download required.
        </p>
      </section>

      {/* HOW IT WORKS */}
      <section style={{
        background: '#f8f8f6', color: '#0a0a0f',
        padding: '6rem 2rem', textAlign: 'center'
      }}>
        <p style={{ fontWeight: 700, letterSpacing: '0.1em', fontSize: '0.8rem', color: '#888', marginBottom: '0.75rem' }}>
          HOW IT WORKS
        </p>
        <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, margin: '0 0 3.5rem' }}>
          Simple. Loud. Addictive.
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2rem', maxWidth: '900px', margin: '0 auto'
        }}>
          {[
            { num: '01', title: 'Grab a friend', body: 'Sit together. One phone or laptop between you. No app download needed.' },
            { num: '02', title: 'Pick your roles', body: 'One of you hints, one guesses. Swap every day so it stays fair.' },
            { num: '03', title: 'Beat the clock', body: '60 seconds. 5 prompts. An icebreaker to kick things off. Go.' },
            { num: '04', title: 'Build your streak', body: 'Come back tomorrow. Your streak, karma, and stats are waiting.' },
          ].map(({ num, title, body }) => (
            <div key={num} style={{
              background: '#fff', borderRadius: '16px',
              padding: '2rem', textAlign: 'left',
              boxShadow: '0 2px 16px rgba(0,0,0,0.06)'
            }}>
              <div style={{ fontWeight: 900, fontSize: '2rem', color: '#f5c842', marginBottom: '0.75rem' }}>{num}</div>
              <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.5rem' }}>{title}</h3>
              <p style={{ color: '#555', lineHeight: 1.6, margin: 0, fontSize: '0.95rem' }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* STREAK CTA */}
      <section style={{
        background: '#0a0a0f',
        padding: '6rem 2rem', textAlign: 'center'
      }}>
        <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, margin: '0 0 1rem' }}>
          Don't break the streak.
        </h2>
        <p style={{ color: '#888', fontSize: '1.1rem', marginBottom: '2rem', maxWidth: '480px', margin: '0 auto 2rem' }}>
          Sign up free and track your wins, your partner stats, and your daily streak.
        </p>
        <Link href="/signup" style={{
          background: '#f5c842', color: '#0a0a0f',
          padding: '1rem 2.5rem', borderRadius: '12px',
          fontWeight: 800, textDecoration: 'none', fontSize: '1.1rem'
        }}>
          Create Free Account
        </Link>
      </section>

      {/* FOOTER */}
      <footer style={{
        background: '#0a0a0f',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '2rem', textAlign: 'center',
        color: '#444', fontSize: '0.85rem'
      }}>
        © 2026 GUESSMA · <Link href="/login" style={{ color: '#666', textDecoration: 'none' }}>Sign in</Link>
      </footer>

    </main>
  )
}