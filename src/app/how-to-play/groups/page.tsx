import * as s from '../_styles'

const DIFFICULTIES = [
  { tile: '25pt',  level: 'Easy',   examples: 'A Flock of Birds, A Pack of Wolves' },
  { tile: '50pt',  level: 'Medium', examples: 'A Murder of Crows, A Parliament of Owls' },
  { tile: '75pt',  level: 'Hard',   examples: 'A Bloat of Hippos, A Tower of Giraffes' },
  { tile: '100pt', level: 'Expert', examples: 'A Conspiracy of Lemurs, A Prickle of Porcupines' },
]

export default function Groups() {
  return (
    <div>
      <span style={s.tag}>CORE CATEGORY</span>
      <h1 style={s.h1}>Groups</h1>

      <section style={s.sec}>
        <h2 style={s.h2}>How to Play</h2>
        <p style={s.p}>Groups is a text-based category where every prompt is a type of group, collection, or collective. The Hinter describes what kind of group it is without naming it directly.</p>
      </section>

      <section style={s.sec}>
        <h2 style={s.h2}>Additional Rule</h2>
        <p style={s.p}>Answers should be formatted to cater towards the topic. For example, if the prompt is A Pack of Wolves, the Guesser should answer using the collective noun format — not just say wolves.</p>
      </section>

      <section style={s.sec}>
        <h2 style={s.h2}>Valid Hints</h2>
        <p style={s.p}>Describe the members of the group, what they do, where they&apos;re found, or what they&apos;re known for. The Guesser needs to identify the specific collective term, not just the subject.</p>
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
