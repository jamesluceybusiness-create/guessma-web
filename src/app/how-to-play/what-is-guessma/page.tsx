import * as s from '../_styles'

export default function WhatIsGuessma() {
  return (
    <div>
      <span style={s.tag}>OVERVIEW</span>
      <h1 style={s.h1}>What is GUESSMA?</h1>

      <section style={s.sec}>
        <p style={s.p}>GUESSMA is an at-home gameshow-style party game built for the people you love most. One player hints, one player guesses, and everyone else watches — or steals. With rotating roles, a steal mechanic that keeps every round alive, an icebreaker before every game, and a growing library of categories spanning sports, food, pop culture, and more, no two sessions ever feel the same.</p>
        <p style={s.p}>GUESSMA is built for variety — whether you&apos;re playing a quick daily game with a friend or running a full board game night with the family. And with new game modes, categories, and expansions on the way, the best version of GUESSMA hasn&apos;t been built yet.</p>
      </section>

      <hr style={s.hr} />

      <section style={s.sec}>
        <h2 style={s.h2}>The Basic Format</h2>
        <p style={s.p}>Every session starts with an Icebreaker round — one image, both teams, first to answer wins 50 points. Then comes the Core round: one Hinter, one Guesser, 60 seconds on the clock, and 5 prompts to get through. Answer all 5 correctly and you unlock the Bonus prompt — worth the full tile value. Miss any and the other team gets a chance to Steal.</p>
      </section>

      <section style={s.sec}>
        <h2 style={s.h2}>Roles</h2>
        <p style={s.p}>Every round has two roles: the Hinter and the Guesser. The Hinter sees the prompt and describes it — using words, sounds, or actions depending on the category. The Guesser sits with their back to the screen and tries to answer based on the Hinter&apos;s clues. Roles rotate every round so everyone gets a turn at both.</p>
      </section>

      <section style={s.sec}>
        <h2 style={s.h2}>Scoring</h2>
        <p style={s.p}>Tiles are worth 25, 50, 75, or 100 points. Each correct answer in a round earns points equal to the tile value divided by 5. The Bonus prompt is worth the full tile value. Stolen prompts are also worth the full tile value — so a steal on a 100-point tile is worth 100 points.</p>
      </section>
    </div>
  )
}
