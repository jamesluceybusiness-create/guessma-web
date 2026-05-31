import * as s from '../_styles'

const DIFFICULTIES = [
  { tile: '25pt', level: 'Easy',   examples: 'Touchdown, Home Run, Penalty Kick' },
  { tile: '50pt', level: 'Medium', examples: 'Offside Trap, Triple Double, Grand Slam' },
  { tile: '75pt', level: 'Hard',   examples: 'Pick and Roll, Slap Shot, Birdie' },
  { tile: '100pt', level: 'Expert', examples: 'Cruyff Turn, Pythagorean Expectation, Libero' },
]

export default function Sports() {
  return (
    <div>
      <span style={s.tag}>CORE CATEGORY</span>
      <h1 style={s.h1}>Sports</h1>

      <section style={s.sec}>
        <h2 style={s.h2}>How to Play</h2>
        <p style={s.p}>Sports is a text-based category. The Hinter reads the prompt — a sports term, athlete, team, event, or concept — and describes it to the Guesser using words only. No spelling out letters, no using the prompt word or any forbidden words listed on the card.</p>
      </section>

      <section style={s.sec}>
        <h2 style={s.h2}>Valid Hints</h2>
        <p style={s.p}>Describe what it is, what it does, who does it, or when it happens. For example, if the prompt is Penalty Kick, you might say: soccer, foul, free shot, goalkeeper. Anything that gets the Guesser to the answer without using the word itself is fair.</p>
      </section>

      <section style={s.sec}>
        <h2 style={s.h2}>Difficulty Levels</h2>
        <p style={s.p}>Sports prompts are sorted into four difficulty tiers matching the tile values on the board:</p>
        <table style={s.tbl.table}>
          <thead>
            <tr>
              <th style={s.tbl.th}>Tile</th>
              <th style={s.tbl.th}>Difficulty</th>
              <th style={s.tbl.th}>Examples</th>
            </tr>
          </thead>
          <tbody>
            {DIFFICULTIES.map(row => (
              <tr key={row.tile}>
                <td style={s.tbl.td}>{row.tile}</td>
                <td style={s.tbl.td}>{row.level}</td>
                <td style={s.tbl.td}>{row.examples}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
