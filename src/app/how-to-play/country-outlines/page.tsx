import * as s from '../_styles'

export default function CountryOutlines() {
  return (
    <div>
      <span style={s.tag}>ICEBREAKER CATEGORY</span>
      <h1 style={s.h1}>Country Outlines</h1>

      <section style={s.sec}>
        <h2 style={s.h2}>How to Play</h2>
        <p style={s.p}>Country Outlines is a visual icebreaker category. Each player is shown the silhouette of a country — no labels, no borders, no context — and must identify it before time runs out. It&apos;s played individually, not in teams.</p>
      </section>

      <section style={s.sec}>
        <h2 style={s.h2}>Round Format</h2>
        <p style={s.p}>Every player sees the same outline at the same time. The first player to type the correct country name earns the point. Common alternate names and abbreviations are accepted.</p>
        <p style={s.p}>Each icebreaker round consists of three outlines. Points accumulate across all three before the round ends and scores are revealed.</p>
      </section>

      <section style={s.sec}>
        <h2 style={s.h2}>Scoring</h2>
        <p style={s.p}>Country Outlines uses flat scoring: each correct answer is worth 1 point regardless of which outline it is. The player with the most points at the end of the icebreaker round carries that score into the main game as a bonus.</p>
      </section>

      <section style={s.sec}>
        <h2 style={s.h2}>Available Countries</h2>
        <p style={s.p}>The Country Outlines library is updated regularly. New countries are added with each content update. The full list is not published here to keep the game fresh — part of the fun is not knowing what&apos;s coming.</p>
      </section>
    </div>
  )
}
