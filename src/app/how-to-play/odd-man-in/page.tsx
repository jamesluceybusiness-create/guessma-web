import * as s from '../_styles'

export default function OddManIn() {
  return (
    <div>
      <span style={s.tag}>GAME MODE</span>
      <span style={s.tagComingSoon}>COMING SOON</span>
      <h1 style={s.h1}>Odd Man In</h1>

      <section style={s.sec}>
        <p style={s.p}>Odd Man In is an asymmetric team mode supporting 2v3. The larger team must coordinate their guesses while the smaller team has the advantage of tighter communication.</p>
        <p style={s.p}>This mode is currently in development. Full rules and guidelines will be published here when it launches.</p>
      </section>
    </div>
  )
}
