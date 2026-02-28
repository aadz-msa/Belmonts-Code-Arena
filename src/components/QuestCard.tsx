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
      className={`w-full text-left p-4 rounded-lg border transition-all ${
        isSelected
          ? 'border-gold bg-shadow ring-2 ring-gold'
          : 'border-stone bg-dark-surface hover:border-gold-light hover:bg-shadow'
      } ${isSolved ? 'opacity-75' : ''}`}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-lg font-serif font-bold text-parchment">
          {quest.title}
        </h3>
        {isSolved && <span className="text-green-400 text-xl">✓</span>}
      </div>

      <div className="flex items-center space-x-2 mb-3">
        <span
          className={`px-2 py-1 text-xs font-medium rounded ${
            DIFFICULTY_COLORS[quest.difficulty]
          }`}
        >
          {quest.difficulty}
        </span>
        <span className="text-sm text-gold font-medium">+{quest.base_xp} XP</span>
      </div>

      {/* Short description preview */}
      <p className="text-sm text-gray-300 line-clamp-2">
        {quest.description.split('\n')[0].replace(/^#+\s*/, '')}
      </p>
    </button>
  )
}
