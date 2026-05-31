'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '../lib/supabase'
import type { GameState } from './types'
import NoGame from './components/NoGame'
import SetupFlow from './components/SetupFlow'
import IcebreakerPhase from './components/IcebreakerPhase'
import IcebreakerResults from './components/IcebreakerResults'
import CoreRules from './components/CoreRules'
import CoreGame from './components/CoreGame'
import RoundResults from './components/RoundResults'
import FinalResults from './components/FinalResults'
import IcebreakerRules from './components/IcebreakerRules'

const INITIAL: GameState = {
  phase: 'loading',
  schedule: null,
  corePrompts: [],
  icebreakerPrompt: null,
  hostUser: null,
  hostAccount: null,
  partnerAccount: null,
  partnerType: 'guest',
  hinterRole: 'host',
  icebreakerFirstPlayer: 'host',
  hostScore: 0,
  partnerScore: 0,
  icebreakerWinner: null,
  dotStates: Array(6).fill(null),
  sessionComplete: false,
  karmaEarned: 0,
  promptTimings: [],
}

export default function DailyPage() {
  const supabase = createClient()
  const [gs, setGs] = useState<GameState>(INITIAL)

  const update = useCallback((partial: Partial<GameState>) => {
    setGs(prev => ({ ...prev, ...partial }))
  }, [])

  useEffect(() => {
    loadGame()
  }, [])

  async function loadGame() {
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data: row } = await supabase
        .from('daily_schedule')
        .select('date, core_category_id, core_difficulty, core_prompt_ids, icebreaker_prompt_id_resolved, published')
        .eq('date', today)
        .eq('published', true)
        .single()

      if (!row) {
        update({ phase: 'no-game' })
        return
      }

      const [{ data: coreRaw }, ibRes] = await Promise.all([
        supabase
          .from('prompts')
          .select('prompt_id, payload, difficulty, category_id')
          .in('prompt_id', row.core_prompt_ids),
        row.icebreaker_prompt_id_resolved
          ? supabase
              .from('prompts')
              .select('prompt_id, payload')
              .eq('prompt_id', row.icebreaker_prompt_id_resolved)
              .single()
          : Promise.resolve({ data: null }),
      ])

      console.log('[loadGame] icebreaker raw:', JSON.stringify((ibRes as any).data))
      console.log('[loadGame] schedule row:', JSON.stringify(row))

      const sorted = (row.core_prompt_ids as string[])
        .map(id => coreRaw?.find((p: any) => p.prompt_id === id))
        .filter(Boolean) as any[]

      update({
        phase: 'setup1',
        schedule: row,
        corePrompts: sorted,
        icebreakerPrompt: (ibRes as any).data ?? null,
      })
    } catch {
      update({ phase: 'no-game' })
    }
  }

  const { phase } = gs

  if (phase === 'loading') {
    return (
      <div style={{ width: '100vw', height: '100vh', background: '#09090b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#52525b', fontSize: '0.9rem' }}>Loading today&apos;s game…</div>
      </div>
    )
  }

  if (phase === 'no-game') return <NoGame />

  if (['setup1', 'setup2', 'setup3', 'setup4'].includes(phase)) {
    return <SetupFlow gs={gs} supabase={supabase} update={update} />
  }

  if (phase === 'icebreakerRules') {
    return <IcebreakerRules gs={gs} update={update} />
  }

  if (phase === 'icebreaker') {
    return <IcebreakerPhase gs={gs} update={update} />
  }

  if (phase === 'icebreakerResults') {
    return <IcebreakerResults gs={gs} update={update} />
  }

  if (phase === 'coreRules') {
    return <CoreRules gs={gs} update={update} />
  }

  if (phase === 'coreGame') {
    return <CoreGame gs={gs} update={update} />
  }

  if (phase === 'roundResults') {
    return <RoundResults gs={gs} update={update} />
  }

  if (phase === 'finalResults') {
    return <FinalResults gs={gs} supabase={supabase} update={update} />
  }

  return null
}
