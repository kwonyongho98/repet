import type { CareNoteActivity } from '../../types/partner';
import { activityConfig } from '../../types/partner';

interface ActivityChecklistProps {
  value: CareNoteActivity;
  onChange: (activities: CareNoteActivity) => void;
}

export default function ActivityChecklist({ value, onChange }: ActivityChecklistProps) {
  const activities = Object.keys(activityConfig) as (keyof CareNoteActivity)[];

  const handleToggle = (activity: keyof CareNoteActivity) => {
    onChange({
      ...value,
      [activity]: !value[activity],
    });
  };

  return (
    <div className="grid grid-cols-4 gap-2">
      {activities.map((activity) => {
        const config = activityConfig[activity];
        const isChecked = value[activity];

        return (
          <button
            key={activity}
            type="button"
            onClick={() => handleToggle(activity)}
            className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 transition-all ${
              isChecked
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                : 'border-gray-200 dark:border-slate-600 hover:border-gray-300'
            }`}
          >
            <span className="text-2xl">{config.emoji}</span>
            <span
              className={`text-xs font-medium ${
                isChecked
                  ? 'text-orange-600 dark:text-orange-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {config.label}
            </span>
            {isChecked && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
