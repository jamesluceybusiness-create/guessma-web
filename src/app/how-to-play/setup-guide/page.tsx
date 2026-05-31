import Link from 'next/link'
import * as s from '../_styles'

export default function SetupGuide() {
  return (
    <div>
      <span style={s.tag}>SETUP</span>
      <h1 style={s.h1}>Setup Guide</h1>

      <section style={s.sec}>
        <h2 style={s.h2}>The Ideal Setup</h2>
        <p style={s.p}>GUESSMA is designed to be played on a shared screen — a laptop, tablet, or TV works best. The Guesser should sit with their back to the screen, facing the rest of the group. The Hinter sits or stands facing the screen. Everyone else sits facing the screen too — they can see the prompts but cannot speak or give clues.</p>
        <p style={s.p}>This setup mirrors the format of classic TV gameshows like the $10,000 Pyramid — one player in the hot seat, one player giving clues, and an audience watching it all unfold.</p>

        <div style={{
          background: '#1a2e1a',
          border: '1px dashed #2a4a2a',
          borderRadius: '12px',
          height: '280px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#4a7a4a',
          fontSize: '0.9rem',
          margin: '1.5rem 0',
        }}>
          Setup diagram coming soon
        </div>
      </section>

      <section style={s.sec}>
        <h2 style={s.h2}>Playing on a TV</h2>
        <p style={s.p}>For the best experience, cast or connect your laptop to a TV or large monitor. This makes the prompts easier to read from across the room and adds to the gameshow atmosphere.</p>
        <p style={s.p}>See our connection guide for step-by-step instructions on how to connect your device.</p>
        <Link href="/connect" style={{ color: '#22c55e', textDecoration: 'underline', fontWeight: 600 }}>
          → How to connect your device
        </Link>
      </section>

      <section style={s.sec}>
        <h2 style={s.h2}>Device Roles</h2>
        <p style={s.p}>One device runs the game — usually the host&apos;s laptop. The host controls the screen and manages the flow of the game. Other players do not need their own devices unless they want to log in and track their stats.</p>
      </section>
    </div>
  )
}
