import * as s from '../_styles'

const DIFFICULTIES = [
  { tile: '25pt',  level: 'Easy',   examples: 'A Gym Bro, A Karen' },
  { tile: '50pt',  level: 'Medium', examples: 'A Life Coach, A Conspiracy Theorist' },
  { tile: '75pt',  level: 'Hard',   examples: 'A Method Actor, A Sommelier' },
  { tile: '100pt', level: 'Expert', examples: 'A Nihilist Philosopher, A Renaissance Fair Enthusiast' },
]

export default function WhatABlankWouldSay() {
  return (
    <div>
      <span style={s.tag}>CORE CATEGORY</span>
      <h1 style={s.h1}>What A Blank Would Say</h1>

      <section style={s.sec}>
        <h2 style={s.h2}>How to Play</h2>
        <p style={s.p}>What A Blank Would Say is a text-based category where every prompt is a type of person, persona, or archetype. The Hinter provides quotes, phrases, or statements that the character would plausibly say — without naming the character directly.</p>
      </section>

      <section style={s.sec}>
        <h2 style={s.h2}>Additional Rule</h2>
        <p style={s.p}>Hints must be written in first person, as if the character is speaking. You&apos;re not describing the character — you&apos;re voicing them. For example, if the prompt is A Gym Bro, you might say: &ldquo;Bro, have you tried creatine? I hit legs three times this week.&rdquo;</p>
      </section>

      <section style={s.sec}>
        <h2 style={s.h2}>Valid Hints</h2>
        <p style={s.p}>Say something the character would genuinely say. Lean into their vocabulary, priorities, obsessions, and blind spots. The more specific and authentic the voice, the easier it is for the Guesser to identify the archetype. Avoid generic statements that could apply to anyone.</p>
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
