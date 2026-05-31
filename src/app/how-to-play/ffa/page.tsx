import * as s from '../_styles'

export default function FFA() {
  return (
    <div>
      <span style={s.tag}>GAME MODE</span>
      <span style={s.tagComingSoon}>COMING SOON</span>
      <h1 style={s.h1}>Free For All</h1>

      <section style={s.sec}>
        <p style={s.p}>Free For All is a 1v1v1 game mode where every player competes individually. One player hints while the others race to guess. The fastest correct answer earns the points.</p>
        <p style={s.p}>This mode is currently in development. Full rules and guidelines will be published here when it launches.</p>
      </section>
    </div>
  )
}
