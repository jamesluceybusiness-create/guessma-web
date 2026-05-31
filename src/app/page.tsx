import Link from 'next/link'
import Nav from './components/Nav'
import HeroCarousel from './components/HeroCarousel'

export default function Home() {
  return (
    <main>
      <Nav />

      {/* SECTION 1 — HERO CAROUSEL */}
      <HeroCarousel />

      {/* SECTION 2 — ABOUT */}
      <section style={{
        background: '#f8f8f6',
        padding: '5rem 2rem',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{ maxWidth: '680px', width: '100%' }}>

          <h2 style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
            fontWeight: 800,
            color: '#09090b',
            margin: '0 0 2.5rem',
            lineHeight: 1.15,
            fontFamily: 'inherit',
          }}>
            How it started.
          </h2>

          <div style={{
            borderLeft: '4px solid #29afd4',
            paddingLeft: '1.5rem',
            display: 'flex', flexDirection: 'column', gap: '0',
          }}>
            {[
              'It started at Thanksgiving.',
              'My family loves to play games at gatherings, but I was sick of the same old ones. I wanted to bring back that feeling of sitting with my grandma, watching the gameshow channel together. The joy of knowing the answer when the contestant got it wrong. As a kid I always thought — I could do that. I could be up there.',
              'That Thanksgiving, an idea was born.',
              'I sat down and made the base of what GUESSMA is today. We played it three times over the holiday, new people joining every round. It was a rough prototype, but the laughs and memories from those nights made every bit of effort worth it.',
              'Today, I hope whoever reads this gets to share that same feeling. To make a great memory watching the people you love most laugh and yell at each other.',
              'Happy Guessing.',
              'Grab a partner and start with today\'s daily game.',
            ].map((text, i) => (
              <p
                key={i}
                style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: '1.15rem',
                  lineHeight: 1.85,
                  color: '#2a2a2a',
                  margin: '0',
                }}
              >
                {text}
              </p>
            ))}
          </div>

          <div style={{ marginTop: '2.5rem', paddingLeft: '1.5rem' }}>
            <Link
              href="/daily"
              style={{
                color: '#16a34a',
                fontWeight: 700,
                fontSize: '1rem',
                textDecoration: 'underline',
              }}
              className="hover:text-green-700"
            >
              → Play Today's Game
            </Link>

            <p style={{
              marginTop: '1rem',
              fontSize: '0.85rem',
              color: '#71717a',
            }}>
              Free. No download. Just you and someone else.
            </p>
          </div>

        </div>
      </section>

      {/* SECTION 3 — THANKS */}
      <section style={{
        background: '#0a1628',
        padding: '5rem 2rem',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{ maxWidth: '680px', width: '100%' }}>

          <h2 style={{
            fontFamily: 'Lexend, sans-serif',
            fontWeight: 700,
            color: 'white',
            fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
            margin: '0 0 2rem',
            lineHeight: 1.15,
          }}>
            Thank You.
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', lineHeight: 1.8, color: '#c8d8e8', margin: 0 }}>
              This game would not exist without the Lucey Family. Thank you for your love, your laughter, and your endless support — and thank you for playing every rough prototype without complaint. You believed in this before it was anything.
            </p>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', lineHeight: 1.8, color: '#c8d8e8', margin: 0 }}>
              Thank you Mom, for giving GUESSMA its name.
            </p>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', lineHeight: 1.8, color: '#c8d8e8', margin: 0 }}>
              And a special thank you to Meer Balaj — a freelance developer who partnered with me early on and helped bring this vision to life. His talent and belief in the project are a big part of why GUESSMA is where it is today.
            </p>
            <a
              href="https://meerbalaj.site/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#22d3c8', textDecoration: 'underline', fontWeight: 600, fontSize: '0.95rem' }}
            >
              → Check out Meer&apos;s work
            </a>
          </div>

        </div>
      </section>
    </main>
  )
}
