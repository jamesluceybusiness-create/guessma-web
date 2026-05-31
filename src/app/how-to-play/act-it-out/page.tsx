import * as s from '../_styles'

const DIFFICULTIES = [
  { tile: '25pt',  level: 'Easy',   examples: 'Bowling, Swimming, Brushing Teeth' },
  { tile: '50pt',  level: 'Medium', examples: 'Conducting an Orchestra, Parallel Parking' },
  { tile: '75pt',  level: 'Hard',   examples: 'Doing Yoga, Operating a Forklift' },
  { tile: '100pt', level: 'Expert', examples: 'Explaining WiFi Without Words, Speed Dating' },
]

export default function ActItOut() {
  return (
    <div>
      <span style={s.tag}>CORE CATEGORY</span>
      <h1 style={s.h1}>Act It Out</h1>

      <section style={s.sec}>
        <h2 style={s.h2}>How to Play</h2>
        <p style={s.p}>Act It Out is a physical category. The Hinter must communicate the prompt through movement, gestures, and expressions only — no words, no sounds. The Guesser watches and calls out what they think the answer is.</p>
      </section>

      <section style={s.sec}>
        <h2 style={s.h2}>Additional Rules</h2>
        <p style={s.p}>No words or sounds of any kind — not even mouth sounds to mimic an action. Props are allowed only if the group agrees to allow them before the game starts. By default, the Hinter uses their body alone.</p>
      </section>

      <section style={s.sec}>
        <h2 style={s.h2}>Valid Hints</h2>
        <p style={s.p}>Mime the action, show the setting, or embody the feeling. If the prompt is Bowling, roll an imaginary ball, watch it travel, react to the pins. You can point, gesture at your surroundings, or act out sequences — anything physical that helps the Guesser lock onto the right answer.</p>
      </section>

      <section style={s.sec}>
        <h2 style={s.h2}>Difficulty Levels</h2>
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
