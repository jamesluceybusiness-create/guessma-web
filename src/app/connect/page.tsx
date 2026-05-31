'use client'

import Link from 'next/link'
import Nav from '../components/Nav'

const styles = {
  page: {
    background: '#0a0f0a',
    color: '#e8f0e8',
    minHeight: '100vh',
  } as React.CSSProperties,
  content: {
    marginTop: '64px',
    maxWidth: '760px',
    margin: '64px auto 0',
    padding: '3rem 2rem 5rem',
  } as React.CSSProperties,
  badge: {
    display: 'inline-block',
    background: '#1a3a1a',
    color: '#22c55e',
    border: '1px solid #166534',
    borderRadius: '999px',
    padding: '0.2rem 0.75rem',
    fontSize: '0.72rem',
    fontWeight: 700,
    letterSpacing: '0.05em',
    marginBottom: '0.6rem',
  } as React.CSSProperties,
  h1: {
    fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
    fontWeight: 900,
    color: 'white',
    lineHeight: 1.15,
    margin: '0.25rem 0 0.5rem',
  } as React.CSSProperties,
  subtitle: {
    fontFamily: 'Georgia, serif',
    fontSize: '1.1rem',
    color: '#9ab89a',
    margin: '0 0 2.5rem',
    lineHeight: 1.6,
  } as React.CSSProperties,
  hr: {
    border: 'none',
    borderBottom: '1px solid #1a2e1a',
    margin: '2.5rem 0',
  } as React.CSSProperties,
  section: {
    marginBottom: '2.5rem',
  } as React.CSSProperties,
  h2: {
    fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
    fontWeight: 900,
    color: 'white',
    margin: '0 0 0.75rem',
    lineHeight: 1.2,
  } as React.CSSProperties,
  p: {
    fontFamily: 'Georgia, serif',
    fontSize: '1rem',
    lineHeight: 1.8,
    color: '#c8d8c8',
    margin: '0 0 1rem',
  } as React.CSSProperties,
  ol: {
    fontFamily: 'Georgia, serif',
    fontSize: '1rem',
    lineHeight: 1.8,
    color: '#c8d8c8',
    paddingLeft: '1.5rem',
    margin: '0 0 1rem',
  } as React.CSSProperties,
  li: {
    marginBottom: '0.5rem',
  } as React.CSSProperties,
  note: {
    background: '#1a2e1a',
    borderLeft: '3px solid #22c55e',
    padding: '1rem',
    borderRadius: '8px',
    fontFamily: 'Georgia, serif',
    fontSize: '0.9rem',
    lineHeight: 1.7,
    color: '#c8d8c8',
    margin: '0.5rem 0 0',
  } as React.CSSProperties,
  ul: {
    fontFamily: 'Georgia, serif',
    fontSize: '1rem',
    lineHeight: 1.8,
    color: '#c8d8c8',
    paddingLeft: '1.5rem',
    margin: '0 0 1rem',
  } as React.CSSProperties,
  backLink: {
    display: 'inline-block',
    color: '#22c55e',
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontWeight: 600,
    marginTop: '1rem',
  } as React.CSSProperties,
}

export default function ConnectPage() {
  return (
    <div style={styles.page}>
      <Nav />

      <div style={styles.content}>

        {/* Page header */}
        <h1 style={styles.h1}>Connect to a TV or Projector</h1>
        <p style={styles.subtitle}>Get the full gameshow experience on a big screen.</p>

        <hr style={styles.hr} />

        {/* Why Connect */}
        <section style={styles.section}>
          <h2 style={styles.h2}>Why Connect?</h2>
          <p style={styles.p}>
            GUESSMA is designed to be played on a shared screen. The bigger that screen, the better the experience. Casting your laptop to a TV or projector makes prompts easier to read from across the room and adds to the gameshow atmosphere. The Guesser sits with their back to the screen — a larger display makes this setup feel exactly like a real gameshow stage.
          </p>
        </section>

        <hr style={styles.hr} />

        {/* Method 1 */}
        <section style={styles.section}>
          <span style={styles.badge}>MOST RELIABLE</span>
          <h2 style={styles.h2}>Method 1 — HDMI Cable</h2>
          <p style={styles.p}>
            The simplest and most reliable method. An HDMI cable carries both video and audio in a single connection with no lag.
          </p>
          <p style={styles.p}>
            <strong style={{ color: '#e8f0e8' }}>Works on:</strong> Windows, Mac, Chromebook
          </p>
          <ol style={styles.ol}>
            <li style={styles.li}>Plug one end of an HDMI cable into your laptop&apos;s HDMI port and the other end into your TV or projector&apos;s HDMI input.</li>
            <li style={styles.li}>On your TV, press the Source or Input button and select the HDMI port you connected to.</li>
            <li style={styles.li}>On Windows: press <strong style={{ color: '#e8f0e8' }}>Windows + P</strong> and select <em>Duplicate</em> to show the same screen on both displays.</li>
            <li style={styles.li}>On Mac: go to <strong style={{ color: '#e8f0e8' }}>System Settings → Displays</strong>. Check <em>Mirror Displays</em> to show the same content on both screens.</li>
          </ol>
          <div style={styles.note}>
            No HDMI port on your laptop? Use a USB-C to HDMI adapter. Most modern ultrabooks support this.
          </div>
        </section>

        <hr style={styles.hr} />

        {/* Method 2 */}
        <section style={styles.section}>
          <span style={styles.badge}>BEST FOR MAC</span>
          <h2 style={styles.h2}>Method 2 — AirPlay (Mac + Apple TV or AirPlay 2 TV)</h2>
          <p style={styles.p}>
            If you have a MacBook and an Apple TV or a smart TV that supports AirPlay 2, this is the easiest wireless option.
          </p>
          <p style={styles.p}>
            <strong style={{ color: '#e8f0e8' }}>Works on:</strong> Mac only
          </p>
          <ol style={styles.ol}>
            <li style={styles.li}>Make sure your Mac and TV are connected to the same Wi-Fi network.</li>
            <li style={styles.li}>Click the <strong style={{ color: '#e8f0e8' }}>Control Center</strong> icon in the top-right corner of your Mac&apos;s menu bar.</li>
            <li style={styles.li}>Select <strong style={{ color: '#e8f0e8' }}>Screen Mirroring</strong> and choose your Apple TV or AirPlay-compatible TV from the list.</li>
            <li style={styles.li}>Your Mac screen will now appear on the TV.</li>
          </ol>
          <div style={styles.note}>
            Most smart TVs made after 2019 support AirPlay 2 — including newer models from Samsung, LG, Sony, and Vizio.
          </div>
        </section>

        <hr style={styles.hr} />

        {/* Method 3 */}
        <section style={styles.section}>
          <span style={styles.badge}>WORKS ON ANY LAPTOP</span>
          <h2 style={styles.h2}>Method 3 — Chromecast or Google TV</h2>
          <p style={styles.p}>
            Chromecast lets you cast directly from the Google Chrome browser — no matter what operating system you&apos;re using.
          </p>
          <p style={styles.p}>
            <strong style={{ color: '#e8f0e8' }}>Works on:</strong> Windows, Mac, Chromebook, Linux
          </p>
          <ol style={styles.ol}>
            <li style={styles.li}>Plug your Chromecast into your TV&apos;s HDMI port and connect it to your Wi-Fi network using the Google Home app.</li>
            <li style={styles.li}>Open <strong style={{ color: '#e8f0e8' }}>Google Chrome</strong> on your laptop.</li>
            <li style={styles.li}>Click the three-dot menu in the top-right corner and select <strong style={{ color: '#e8f0e8' }}>Cast</strong>.</li>
            <li style={styles.li}>Click <strong style={{ color: '#e8f0e8' }}>Sources</strong> and select <em>Cast Desktop</em> to mirror your entire screen.</li>
            <li style={styles.li}>Select your Chromecast device from the list.</li>
          </ol>
          <div style={styles.note}>
            Make sure your laptop and Chromecast are on the same Wi-Fi network. A 5GHz network gives the best performance.
          </div>
        </section>

        <hr style={styles.hr} />

        {/* Method 4 */}
        <section style={styles.section}>
          <span style={styles.badge}>WINDOWS ONLY</span>
          <h2 style={styles.h2}>Method 4 — Windows Miracast (Wireless)</h2>
          <p style={styles.p}>
            Most Windows laptops support Miracast — a wireless display standard that works like wireless HDMI. Many modern smart TVs support it built-in.
          </p>
          <p style={styles.p}>
            <strong style={{ color: '#e8f0e8' }}>Works on:</strong> Windows only
          </p>
          <ol style={styles.ol}>
            <li style={styles.li}>On your TV, enable <em>Screen Mirroring</em> or <em>Wireless Display</em> mode in the TV&apos;s settings menu.</li>
            <li style={styles.li}>On your Windows laptop, press <strong style={{ color: '#e8f0e8' }}>Windows + K</strong>.</li>
            <li style={styles.li}>Wait for the Cast panel to scan for nearby displays.</li>
            <li style={styles.li}>Select your TV from the list and accept any prompt that appears on the TV.</li>
            <li style={styles.li}>Press <strong style={{ color: '#e8f0e8' }}>Windows + P</strong> to switch between Duplicate, Extend, or Second Screen Only.</li>
          </ol>
          <div style={styles.note}>
            If your TV doesn&apos;t show up, make sure both devices are on the same Wi-Fi network and your laptop&apos;s display drivers are up to date.
          </div>
        </section>

        <hr style={styles.hr} />

        {/* Method 5 */}
        <section style={styles.section}>
          <h2 style={styles.h2}>Method 5 — Projector</h2>
          <p style={styles.p}>
            A projector takes the gameshow feel to the next level. Most projectors connect via HDMI the same way a TV does. Some newer projectors support wireless casting via Chromecast or built-in Wi-Fi.
          </p>
          <ol style={styles.ol}>
            <li style={styles.li}>Connect your laptop to the projector using an HDMI cable or your projector&apos;s wireless connection method.</li>
            <li style={styles.li}>Set your display to <em>Duplicate</em> so both your laptop and the projected image show the same screen.</li>
            <li style={styles.li}>Position the projector so the image faces the players — remember the Guesser will have their back to it.</li>
          </ol>
          <div style={styles.note}>
            For the best image quality, dim the lights in the room and position the projector as close to the screen as your setup allows.
          </div>
        </section>

        <hr style={styles.hr} />

        {/* Tips */}
        <section style={styles.section}>
          <h2 style={styles.h2}>Tips for the Best Setup</h2>
          <ul style={styles.ul}>
            <li style={styles.li}>Use <em>Duplicate</em> display mode, not Extend — the Hinter needs to see the prompt on their laptop screen too.</li>
            <li style={styles.li}>Set your display resolution to match your TV&apos;s native resolution for the sharpest image. Most TVs are 1080p or 4K.</li>
            <li style={styles.li}>HDMI carries audio automatically. For wireless connections, check your TV&apos;s audio input settings if sound doesn&apos;t come through.</li>
            <li style={styles.li}>For wireless methods, a 5GHz Wi-Fi network reduces lag. Move your router closer if you experience delays.</li>
            <li style={styles.li}>Test your connection before guests arrive — nothing kills the vibe like a 10-minute setup struggle.</li>
          </ul>
        </section>

        <hr style={styles.hr} />

        <Link href="/how-to-play/setup-guide" style={styles.backLink}>
          ← Back to Setup Guide
        </Link>

      </div>
    </div>
  )
}
