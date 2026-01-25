import type { CareMood } from '../../types/partner';
import { moodConfig } from '../../types/partner';

interface MoodSelectorProps {
  value: CareMood;
  onChange: (mood: CareMood) => void;
}

export default function MoodSelector({ value, onChange }: MoodSelectorProps) {
  const moods: CareMood[] = ['happy', 'good', 'normal', 'tired', 'sick'];

  return (
    <div className="flex justify-between gap-2">
      {moods.map((mood) => {
        const config = moodConfig[mood];
        const isSelected = value === mood;

        return (
          <button
            key={mood}
            type="button"
            onClick={() => onChange(mood)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-xl transition-all ${
              isSelected
                ? 'ring-2 ring-offset-2'
                : 'hover:bg-gray-50 dark:hover:bg-slate-700'
            }`}
            style={{
              backgroundColor: isSelected ? `${config.color}15` : undefined,
              ringColor: isSelected ? config.color : undefined,
            }}
          >
            <span className="text-3xl">{config.emoji}</span>
            <span
              className={`text-xs font-medium ${
                isSelected ? '' : 'text-gray-500 dark:text-gray-400'
              }`}
              style={{ color: isSelected ? config.color : undefined }}
            >
              {config.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
