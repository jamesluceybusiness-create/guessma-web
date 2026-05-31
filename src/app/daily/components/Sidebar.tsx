'use client'

interface Props {
  hostName: string
  partnerName: string
  hostScore: number
  partnerScore: number
  activePlayer: 'host' | 'partner' | null
  timer: number
  timerColor: string
  showTimer?: boolean
}

export default function Sidebar({
  hostName, partnerName, hostScore, partnerScore,
  activePlayer, timer, timerColor, showTimer = true,
}: Props) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', minHeight: 0,
      borderLeft: '1px solid #27272a',
    }}>
      {/* Scores */}
      <div style={{ padding: '0.75rem 0.75rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        {([['host', hostName, hostScore], ['partner', partnerName, partnerScore]] as const).map(([role, name, score]) => {
          const isActive = activePlayer === role
          return (
            <div
              key={role}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 0.65rem', borderRadius: '0.4rem', minHeight: '2.2rem',
                fontSize: '0.9rem',
                background: isActive ? '#facc15' : '#27272a',
                color: isActive ? '#000' : '#d4d4d8',
                fontWeight: isActive ? 900 : 600,
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '110px' }}>{name}</span>
              <span style={{ flexShrink: 0 }}>{score}</span>
            </div>
          )
        })}
      </div>

      {/* Timer */}
      {showTimer && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem 0.75rem' }}>
          <div style={{
            width: '90px', height: '90px', borderRadius: '50%',
            border: `3px solid ${timerColor}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: '2.2rem', color: timerColor, fontWeight: 900, lineHeight: 1 }}>
              {timer}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
