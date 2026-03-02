import { DIFFICULTY_COLORS } from '../lib/constants'
import type { QuestWithTestCases } from '../lib/types'

interface QuestCardProps {
  quest: QuestWithTestCases
  isSelected?: boolean
  onSelect: () => void
  isSolved?: boolean
}

export function QuestCard({
  quest,
  isSelected,
  onSelect,
  isSolved,
}: QuestCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-5 rounded-lg transition-all duration-300 relative overflow-hidden ${
        isSolved ? 'opacity-70' : ''
      }`}
      style={{
        background: isSelected 
          ? 'linear-gradient(135deg, #1a202c 0%, #111827 100%)'
          : 'linear-gradient(135deg, #111827 0%, #0b0f14 100%)',
        border: isSelected 
          ? '2px solid #d4af37' 
          : '1px solid rgba(212, 175, 55, 0.2)',
        boxShadow: isSelected
          ? '0 0 20px rgba(212, 175, 55, 0.3), 0 8px 24px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(212, 175, 55, 0.2)'
          : '0 4px 12px rgba(0, 0, 0, 0.4)',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = 'rgba(245, 210, 122, 0.5)'
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 0 15px rgba(212, 175, 55, 0.2), 0 6px 16px rgba(0, 0, 0, 0.5)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.2)'
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4)'
        }
      }}
    >
      {/* Top highlight line for selected cards */}
      {isSelected && (
        <div 
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{
            background: 'linear-gradient(90deg, transparent, #d4af37, transparent)',
          }}
        />
      )}

      <div className="flex items-start justify-between mb-3">
        <h3 
          className="text-lg font-bold pr-2"
          style={{
            fontFamily: "'Cinzel', serif",
            color: isSelected ? '#f5d27a' : '#f3f4f6',
            textShadow: isSelected ? '0 0 8px rgba(212, 175, 55, 0.3)' : 'none'
          }}
        >
          {quest.title}
        </h3>
        {isSolved && (
          <span 
            className="text-xl flex-shrink-0"
            style={{
              color: '#10b981',
              filter: 'drop-shadow(0 0 4px rgba(16, 185, 129, 0.5))'
            }}
          >
            ✓
          </span>
        )}
      </div>

      <div className="flex items-center space-x-3 mb-3">
        <span
          className={`px-2.5 py-1 text-xs font-semibold rounded uppercase tracking-wide ${
            DIFFICULTY_COLORS[quest.difficulty]
          }`}
          style={{
            fontFamily: "'Inter', sans-serif",
            letterSpacing: '0.05em'
          }}
        >
          {quest.difficulty}
        </span>
        <span 
          className="text-sm font-bold"
          style={{
            color: '#d4af37',
            fontFamily: "'Cinzel', serif"
          }}
        >
          +{quest.base_xp} XP
        </span>
      </div>

      {/* Short description preview */}
      <p 
        className="text-sm line-clamp-2"
        style={{ color: 'rgba(243, 244, 246, 0.7)' }}
      >
        {quest.description.split('\n')[0].replace(/^#+\s*/, '')}
      </p>
    </button>
  )
}
