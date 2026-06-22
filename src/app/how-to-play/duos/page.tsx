import * as s from '../_styles'

const ROUND_STEPS = [
  'Icebreaker — one image prompt shown to both teams. The active team goes first. If they answer correctly, they earn 50 points. If they don\'t, the opposing team gets a steal attempt.',
  'Core Game Rules — the rules screen is shown to the active team. Each team only sees rules once per game session per rule type.',
  'Core Round — 60 seconds, 5 prompts, roles assigned. Hinter describes, Guesser answers.',
  'Steal Phase — if any prompts were never shown to the active team, the opposing team gets a steal attempt.',
  'Round Results — host reviews all answers, can toggle correct/incorrect. Score updates live.',
  'Back to Board — the completed tile goes grey. The other team picks next.',
]

export default function Duos() {
  return (
    <div>
      <span style={s.tag}>GAME MODE</span>
      <h1 style={s.h1}>Duos</h1>
      <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.95rem', color: '#94a3b8', fontStyle: 'italic', margin: '0.25rem 0 2rem' }}>
        2 teams · 2 players per team · the base game
      </p>

      <section style={s.sec}>
        <h2 style={s.h2}>Overview</h2>
        <p style={s.p}>Duos is the base game mode. Two teams of two players compete across a shared game board, taking turns picking tiles and playing rounds. The team with the most points when all tiles are completed wins.</p>
      </section>

      <section style={s.sec}>
        <h2 style={s.h2}>Team Setup</h2>
        <p style={s.p}>4 players are split into 2 teams of 2. Each team has a name and two players. The host sets which team goes first — manually or by randomizing. Turn order is strict: Team 1 goes, then Team 2, then Team 1 again — regardless of the outcome of each round.</p>
      </section>

      <section style={s.sec}>
        <h2 style={s.h2}>Roles</h2>
        <p style={s.p}>Each round has two roles: Hinter and Guesser. Roles are determined by each team&apos;s play count and rotate every round — so if Player A hinted last round, Player B hints this round. The role rotation is automatic and tracked by the game.</p>
      </section>

      <section style={s.sec}>
        <h2 style={s.h2}>The Game Board</h2>
        <p style={s.p}>The game board is a grid of tiles organized by category and point value. Each category has 4 tiles: 25, 50, 75, and 100 points. The active team picks any available tile to start a round. Once a round is complete, that tile is greyed out. The game ends when all tiles are completed.</p>
      </section>

      <section style={s.sec}>
        <h2 style={s.h2}>Round Flow</h2>
        <p style={s.p}>Every tile pick triggers the following sequence:</p>
        <ol style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', lineHeight: 1.8, color: '#94a3b8', paddingLeft: '1.5rem', margin: 0 }}>
          {ROUND_STEPS.map((step, i) => (
            <li key={i} style={{ marginBottom: '0.75rem' }}>{step}</li>
          ))}
        </ol>
      </section>

      <section style={s.sec}>
        <h2 style={s.h2}>Scoring</h2>
        <p style={s.p}>Each correct answer in a core round earns points equal to the tile value divided by 5. A correct answer on a 100-point tile earns 20 points. The Bonus prompt is worth the full tile value. Stolen prompts are worth the full tile value per correct answer. The Icebreaker winner earns a flat 50 points.</p>
      </section>

      <section style={s.sec}>
        <h2 style={s.h2}>Winning</h2>
        <p style={s.p}>The game ends when all tiles on the board are completed. The team with the highest score wins. In the event of a tie, the result is declared a draw — a tiebreaker mode is coming in a future update.</p>
      </section>
    </div>
  )
}
