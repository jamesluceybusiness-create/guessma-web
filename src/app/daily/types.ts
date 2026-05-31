export type Phase =
  | 'loading' | 'no-game'
  | 'setup1' | 'setup2' | 'setup3' | 'setup4'
  | 'icebreakerRules' | 'icebreaker' | 'icebreakerResults'
  | 'coreRules' | 'coreGame' | 'roundResults' | 'finalResults'

export type DotState = null | 'blue' | 'green' | 'red' | 'yellow' | 'gray'

export interface ScheduleRow {
  date: string
  core_category_id: string
  core_difficulty: number
  core_prompt_ids: string[]
  icebreaker_prompt_id_resolved: string | null
  published: boolean
}

export interface CorePrompt {
  prompt_id: string
  payload: { text: string }
  difficulty: number
  category_id: string
}

export interface IcebreakerPrompt {
  prompt_id: string
  payload: { text?: string; answer?: string; image_ref?: string }
}

export interface Account {
  id: string | null
  display_name: string
  username: string | null
  karma_lifetime: number
  karma_balance: number
}

export interface GameState {
  phase: Phase
  schedule: ScheduleRow | null
  corePrompts: CorePrompt[]
  icebreakerPrompt: IcebreakerPrompt | null
  hostUser: any | null
  hostAccount: Account | null
  partnerAccount: Account | null
  partnerType: 'guest' | 'linked'
  hinterRole: 'host' | 'partner'
  icebreakerFirstPlayer: 'host' | 'partner'
  hostScore: number
  partnerScore: number
  icebreakerWinner: 'host' | 'partner' | 'none' | null
  dotStates: DotState[]
  sessionComplete: boolean
  karmaEarned: number
  promptTimings: Array<{
    promptId: string
    timeMs: number
    wasCorrect: boolean
    wasSkipped: boolean
    slot: number
  }>
}

export const CATEGORY_LABELS: Record<string, string> = {
  core_sports: 'Sports',
  core_food: 'Food',
  core_groups: 'Groups',
  core_wabws: 'WABWS',
  core_actitout: 'Act It Out',
}

export const CATEGORY_RULES: Record<string, string> = {
  core_sports: 'Describe the sports term using words only. No spelling, no using the word itself.',
  core_food: 'Describe the food item using words only.',
  core_groups: 'Describe the group. Answers should follow the collective noun format.',
  core_wabws: 'Give examples of what this type of person would say. Answers should identify the person type.',
  core_actitout: 'No words — sounds and actions only. Props allowed if group agrees.',
}

export const DIFFICULTY_LABELS = ['Easy', 'Medium', 'Hard', 'Expert']

export function diffPts(difficulty: number) { return (difficulty + 1) * 5 }
export function diffBonus(difficulty: number) { return (difficulty + 1) * 25 }
