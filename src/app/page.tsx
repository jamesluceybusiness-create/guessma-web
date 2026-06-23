'use client'
import Link from 'next/link'
import Nav from './components/Nav'

export default function Home() {
  return (
    <main style={{ background: '#091e2a', minHeight: '100vh' }}>
      <Nav />

      {/* HERO */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(5rem, 12vh, 8rem) clamp(1.5rem, 5vw, 4rem) clamp(3rem, 8vh, 6rem)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background accent */}
        <div style={{
          position: 'absolute',
          top: '20%', left: '50%',
          transform: 'translateX(-50%)',
          width: 'clamp(400px, 70vw, 900px)',
          height: 'clamp(400px, 70vw, 900px)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(41,175,212,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Category pills */}
        <div style={{
          display: 'flex', gap: '0.6rem', flexWrap: 'wrap',
          justifyContent: 'center', marginBottom: 'clamp(1.5rem, 4vh, 2.5rem)',
        }}>
          {['Sports', 'Food', 'Groups', 'Act It Out', 'WABWS', 'Country Outlines'].map(cat => (
            <span key={cat} style={{
              background: '#0d2d3d', border: '1px solid #1a4a5a',
              borderRadius: '999px', padding: '0.3rem 0.9rem',
              fontSize: 'clamp(0.65rem, 1.2vw, 0.8rem)', fontWeight: 600,
              color: '#94a3b8', letterSpacing: '0.04em',
            }}>{cat}</span>
          ))}
        </div>

        {/* Main headline */}
        <h1 style={{
          fontSize: 'clamp(3rem, 8vw, 7rem)',
          fontWeight: 900,
          color: '#ffffff',
          lineHeight: 1.0,
          margin: '0 0 clamp(1rem, 3vh, 1.5rem)',
          letterSpacing: '-0.02em',
        }}>
          GUESSMA
        </h1>

        <p style={{
          fontSize: 'clamp(1rem, 2.5vw, 1.5rem)',
          color: '#29afd4',
          fontWeight: 600,
          margin: '0 0 clamp(0.5rem, 1.5vh, 0.75rem)',
          letterSpacing: '0.02em',
        }}>
          The Party Guessing Game
        </p>

        <p style={{
          fontSize: 'clamp(0.9rem, 1.8vw, 1.1rem)',
          color: '#94a3b8',
          maxWidth: 'min(560px, 90vw)',
          lineHeight: 1.7,
          margin: '0 0 clamp(2rem, 5vh, 3rem)',
        }}>
          One player hints. One player guesses. Everyone else watches — or steals.
          Play daily for free, or grab the full game for game night.
        </p>

        {/* CTA buttons */}
        <div style={{
          display: 'flex', gap: '1rem', flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          <Link href="/daily" style={{
            background: '#29afd4', color: '#091e2a',
            padding: 'clamp(0.75rem, 2vh, 1rem) clamp(1.5rem, 4vw, 2.5rem)',
            borderRadius: '12px', fontWeight: 800,
            fontSize: 'clamp(0.9rem, 1.8vw, 1.1rem)',
            textDecoration: 'none', letterSpacing: '0.02em',
          }}>
            Play Today's Daily →
          </Link>
          <Link href="/get-the-game" style={{
            background: 'transparent',
            border: '2px solid #1a4a5a',
            color: '#94a3b8',
            padding: 'clamp(0.75rem, 2vh, 1rem) clamp(1.5rem, 4vw, 2.5rem)',
            borderRadius: '12px', fontWeight: 700,
            fontSize: 'clamp(0.9rem, 1.8vw, 1.1rem)',
            textDecoration: 'none',
          }}>
            Get the Full Game
          </Link>
        </div>

        {/* Scroll hint */}
        <p style={{
          position: 'absolute', bottom: '2rem',
          fontSize: '0.75rem', color: '#64748b',
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          scroll to learn more ↓
        </p>
      </section>

      {/* HOW IT WORKS */}
      <section style={{
        background: '#0d2d3d',
        borderTop: '1px solid #1a4a5a',
        borderBottom: '1px solid #1a4a5a',
        padding: 'clamp(3rem, 8vh, 6rem) clamp(1.5rem, 5vw, 4rem)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        <p style={{
          fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em',
          color: '#29afd4', textTransform: 'uppercase',
          margin: '0 0 1rem',
        }}>How it works</p>

        <h2 style={{
          fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
          fontWeight: 900, color: 'white',
          margin: '0 0 clamp(2rem, 5vh, 4rem)',
          textAlign: 'center', lineHeight: 1.15,
        }}>
          Simple to learn.<br />Hard to put down.
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 90vw), 1fr))',
          gap: 'clamp(1rem, 3vw, 1.5rem)',
          width: '100%', maxWidth: 'min(960px, 92vw)',
        }}>
          {[
            { num: '01', title: 'Pick a category', body: 'Sports, Food, Groups, Act It Out — each plays completely differently.' },
            { num: '02', title: 'Assign roles', body: 'One player hints. One guesses with their back to the screen.' },
            { num: '03', title: 'Race the clock', body: '60 seconds. 5 prompts. Get them all right to unlock the Bonus.' },
            { num: '04', title: 'Steal or be stolen', body: 'Miss a prompt and the other team gets a crack at it.' },
          ].map(({ num, title, body }) => (
            <div key={num} style={{
              background: '#091e2a', border: '1px solid #1a4a5a',
              borderRadius: '16px', padding: 'clamp(1.25rem, 3vh, 2rem)',
            }}>
              <p style={{
                fontSize: '0.7rem', fontWeight: 800, color: '#29afd4',
                letterSpacing: '0.1em', margin: '0 0 0.75rem',
              }}>{num}</p>
              <p style={{
                fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                fontWeight: 800, color: 'white',
                margin: '0 0 0.5rem',
              }}>{title}</p>
              <p style={{
                fontSize: 'clamp(0.85rem, 1.5vw, 0.95rem)',
                color: '#94a3b8', lineHeight: 1.6, margin: 0,
              }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DAILY GAME CTA */}
      <section style={{
        padding: 'clamp(3rem, 8vh, 6rem) clamp(1.5rem, 5vw, 4rem)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em',
          color: '#16a34a', textTransform: 'uppercase', margin: '0 0 1rem',
        }}>Free every day</p>
        <h2 style={{
          fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
          fontWeight: 900, color: 'white',
          margin: '0 0 1rem', lineHeight: 1.15,
        }}>Play today's daily game</h2>
        <p style={{
          fontSize: 'clamp(0.9rem, 1.8vw, 1.1rem)',
          color: '#94a3b8', maxWidth: 'min(480px, 90vw)',
          lineHeight: 1.7, margin: '0 0 2rem',
        }}>
          One icebreaker. One core round. A new category every day.
          No download, no account required.
        </p>
        <Link href="/daily" style={{
          background: '#16a34a', color: 'white',
          padding: 'clamp(0.75rem, 2vh, 1rem) clamp(2rem, 5vw, 3rem)',
          borderRadius: '12px', fontWeight: 800,
          fontSize: 'clamp(1rem, 2vw, 1.2rem)',
          textDecoration: 'none',
        }}>
          Play Now — It's Free
        </Link>
      </section>

      {/* THE STORY */}
      <section style={{
        background: '#0d2d3d',
        borderTop: '1px solid #1a4a5a',
        padding: 'clamp(3rem, 8vh, 6rem) clamp(1.5rem, 5vw, 4rem)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        <div style={{ maxWidth: 'min(680px, 92vw)', width: '100%' }}>
          <p style={{
            fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em',
            color: '#29afd4', textTransform: 'uppercase', margin: '0 0 1rem',
          }}>The story</p>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
            fontWeight: 900, color: 'white',
            margin: '0 0 2rem', lineHeight: 1.15,
          }}>How it started.</h2>

          <div style={{
            borderLeft: '3px solid #29afd4',
            paddingLeft: '1.5rem',
            display: 'flex', flexDirection: 'column', gap: '1.25rem',
          }}>
            {[
              'It started at Thanksgiving.',
              'My family loves to play games at gatherings, but I was sick of the same old ones. I wanted to bring back that feeling of sitting with my grandma, watching the gameshow channel together. As a kid I always thought — I could do that. I could be up there.',
              'That Thanksgiving, an idea was born. We played it three times over the holiday, new people joining every round.',
              'Today, I hope whoever reads this gets to share that same feeling. To make a great memory watching the people you love most laugh and yell at each other.',
              'Happy Guessing.',
            ].map((text, i) => (
              <p key={i} style={{
                fontSize: 'clamp(0.95rem, 1.8vw, 1.1rem)',
                lineHeight: 1.8, color: '#94a3b8', margin: 0,
              }}>{text}</p>
            ))}
          </div>
        </div>
      </section>

      {/* THANKS */}
      <section style={{
        borderTop: '1px solid #1a4a5a',
        padding: 'clamp(3rem, 8vh, 5rem) clamp(1.5rem, 5vw, 4rem)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        <div style={{ maxWidth: 'min(680px, 92vw)', width: '100%' }}>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            fontWeight: 900, color: 'white', margin: '0 0 1.5rem',
          }}>Thank You.</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ fontSize: 'clamp(0.9rem, 1.6vw, 1rem)', lineHeight: 1.8, color: '#94a3b8', margin: 0 }}>
              This game would not exist without the Lucey Family — thank you for your love, your laughter, and for playing every rough prototype without complaint.
            </p>
            <p style={{ fontSize: 'clamp(0.9rem, 1.6vw, 1rem)', lineHeight: 1.8, color: '#94a3b8', margin: 0 }}>
              Thank you Mom, for giving GUESSMA its name.
            </p>
            <p style={{ fontSize: 'clamp(0.9rem, 1.6vw, 1rem)', lineHeight: 1.8, color: '#94a3b8', margin: 0 }}>
              And a special thank you to Meer Balaj — a freelance developer who partnered with me early on and helped bring this vision to life.
            </p>
            <a href="https://meerbalaj.site/" target="_blank" rel="noopener noreferrer"
              style={{ color: '#29afd4', fontWeight: 600, fontSize: '0.95rem' }}>
              → Check out Meer's work
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        borderTop: '1px solid #1a4a5a',
        padding: '1.5rem clamp(1.5rem, 5vw, 4rem)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '1rem',
      }}>
        <span style={{ fontWeight: 900, color: '#29afd4', fontSize: '1rem', letterSpacing: '0.06em' }}>
          GUESSMA
        </span>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Daily', href: '/daily' },
            { label: 'How to Play', href: '/how-to-play' },
            { label: 'Get the Game', href: '/get-the-game' },
            { label: 'Redeem', href: '/redeem' },
          ].map(({ label, href }) => (
            <Link key={href} href={href} style={{
              color: '#64748b', textDecoration: 'none',
              fontSize: '0.82rem', fontWeight: 500,
            }}>{label}</Link>
          ))}
        </div>
        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
          © 2026 JC Skipper LLC
        </span>
      </footer>
    </main>
  )
}
