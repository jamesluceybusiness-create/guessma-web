import * as s from '../_styles'

const DIFFICULTIES = [
  { tile: '25pt',  level: 'Easy',   examples: 'Pizza, Sushi, Taco' },
  { tile: '50pt',  level: 'Medium', examples: 'Ratatouille, Ceviche, Baklava' },
  { tile: '75pt',  level: 'Hard',   examples: 'Béarnaise, Mole, Tagine' },
  { tile: '100pt', level: 'Expert', examples: 'Escabeche, Chawanmushi, Pissaladière' },
]

export default function Food() {
  return (
    <div>
      <span style={s.tag}>CORE CATEGORY</span>
      <h1 style={s.h1}>Food</h1>

      <section style={s.sec}>
        <h2 style={s.h2}>How to Play</h2>
        <p style={s.p}>Food is a text-based category. The Hinter describes a food item, dish, ingredient, cuisine, or cooking concept to the Guesser using words only.</p>
      </section>

      <section style={s.sec}>
        <h2 style={s.h2}>Valid Hints</h2>
        <p style={s.p}>Describe the taste, texture, origin, ingredients, or how it&apos;s prepared. For example, if the prompt is Croissant, you might say: French, buttery, flaky, pastry, breakfast. Anything that helps the Guesser identify the food without using the word itself.</p>
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
