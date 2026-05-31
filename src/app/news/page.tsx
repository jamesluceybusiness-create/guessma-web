import Nav from '../components/Nav'

export default function NewsPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <Nav />
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '2rem', paddingTop: '7rem',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em',
          color: 'var(--blue-primary)', textTransform: 'uppercase', marginBottom: '1rem',
        }}>
          News
        </p>
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800,
          color: 'var(--text)', margin: '0 0 1rem',
        }}>
          Nothing here yet.
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '1.05rem', maxWidth: '380px', lineHeight: 1.6 }}>
          No posts yet — check back soon.
        </p>
      </div>
    </main>
  )
}
