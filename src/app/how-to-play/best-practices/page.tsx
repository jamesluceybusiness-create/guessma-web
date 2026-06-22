import * as s from '../_styles'

const TIPS = [
  {
    label: 'Follow the rules as written',
    body: 'The game is self-governed and only as good as the people playing it. Stick to the rules — especially the ones about forbidden words and valid hints.',
  },
  {
    label: 'Play honestly',
    body: 'No peeking, no coaching from the audience, no hinting with forbidden words. The steal mechanic exists to punish bad rounds — use it.',
  },
  {
    label: 'Set up correctly',
    body: 'Guesser sits with their back to the screen, facing the room. Hinter faces the screen. Everyone else can see everything. Do not skip this step — the whole game depends on it.',
  },
  {
    label: 'Cast to a TV if you can',
    body: 'The bigger the screen, the better the experience. A TV makes prompts easier to read and adds to the gameshow feel. See the setup guide for how to connect.',
  },
  {
    label: 'Log in before you play',
    body: 'Karma, streaks, and stats only track for logged-in players. Make sure at least the host is signed in before the game starts. Partners should link their accounts in team setup.',
  },
  {
    label: 'Agree on house rules for Act It Out',
    body: 'Act It Out allows sounds and actions — no words. Agree with your group on what counts as a valid hint before the round starts to avoid disputes.',
  },
  {
    label: 'Respect the timer',
    body: "The 60-second timer is the rule, not a suggestion. When it hits zero, the round ends — no exceptions.",
  },
]

export default function BestPractices() {
  return (
    <div>
      <span style={s.tag}>TIPS</span>
      <h1 style={s.h1}>Best Practices</h1>

      <p style={{ ...s.p, marginBottom: '1.75rem' }}>Get the most out of every session with these guidelines.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {TIPS.map(tip => (
          <div key={tip.label} style={{ display: 'flex', gap: '0.75rem' }}>
            <span style={{ color: '#29afd4', fontWeight: 900, fontSize: '1.1rem', flexShrink: 0, lineHeight: 1.8 }}>✓</span>
            <p style={{ ...s.p, margin: 0 }}>
              <strong style={{ color: 'white', fontFamily: 'inherit' }}>{tip.label}</strong>
              {' '}{tip.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
