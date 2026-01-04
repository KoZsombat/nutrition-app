import { IoCloseOutline } from 'react-icons/io5';
import StreakDisplay from './StreakDisplay';
import type { EatenHistory } from '../types/types';

export default function History({
  visible,
  onClose,
  eatenData = [],
  calorieMax,
  proteinMax,
  carbsMax,
  fatMax,
}: {
  visible: boolean;
  onClose: () => void;
  eatenData: EatenHistory[];
  calorieMax: string;
  proteinMax: string;
  carbsMax: string;
  fatMax: string;
}) {
  if (!visible) return null;

  // Group entries by date and sum macros for each day
  function groupByDate(entries: EatenHistory[]) {
    const grouped: { [date: string]: EatenHistory } = {};
    for (const entry of entries) {
      const dateKey = new Date(entry.date).toISOString().slice(0, 10); // YYYY-MM-DD
      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          name: '',
          date: dateKey,
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
        };
      }
      grouped[dateKey].calories += entry.calories;
      grouped[dateKey].protein += entry.protein;
      grouped[dateKey].carbs += entry.carbs;
      grouped[dateKey].fat += entry.fat;
    }
    // Return as array, sorted descending by date
    return Object.values(grouped).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  const groupedEatenData = groupByDate(eatenData || []);

  // Streak logic: use grouped days
  function calculateStreak(entries: EatenHistory[]) {
    if (!entries || entries.length === 0) return 0;
    let streak = 0;
    let prevDate: Date | null = null;
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const entryDate = new Date(entry.date);
      if (prevDate) {
        const diff = (prevDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24);
        if (diff > 1) break; // missed a day
      }
      // Check macro limits
      let withinLimits = true;
      if (calorieMax && entry.calories > Number(calorieMax)) withinLimits = false;
      if (carbsMax && entry.carbs > Number(carbsMax)) withinLimits = false;
      if (fatMax && entry.fat > Number(fatMax)) withinLimits = false;
      if (proteinMax && entry.protein < Number(proteinMax)) withinLimits = false;
      if (!withinLimits) break;
      streak++;
      prevDate = entryDate;
    }
    return streak;
  }

  const streak = calculateStreak(groupedEatenData);

  return (
    <div className="overflow-y-auto overflow-x-hidden pb-[10vh] fixed inset-0 bg-gray-200 z-20 flex flex-col">
      <div className="flex flex-row justify-between items-center px-3 sm:px-6 bg-white py-2 sm:py-4 border-b border-gray-200 flex-shrink-0">
        <p className="text-3xl sm:text-4xl pt-5 font-bold text-gray-900">History</p>
        <button
          className="hover:bg-gray-100 rounded-lg p-2 transition-colors cursor-pointer"
          onClick={onClose}
          aria-label="Close"
        >
          <IoCloseOutline size={28} color="#000" />
        </button>
      </div>
      <div className="overflow-y-auto flex-1 p-4 sm:p-8 max-w-6xl mx-auto w-full">
        <StreakDisplay streak={streak} />
        {groupedEatenData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-lg text-gray-400 font-semibold">No history yet</p>
          </div>
        ) : (
          <div className="space-y-5">
            {groupedEatenData.map((entry, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl shadow border border-gray-200 bg-white p-5 sm:p-7 flex flex-col gap-2"
              >
                <div className="flex flex-row items-center gap-2 mb-2">
                  <span className="text-base font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded-full uppercase tracking-wide shadow-sm">
                    {new Date(entry.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex flex-row flex-wrap gap-4 text-base text-gray-900 font-medium">
                  <span>
                    Calories: <span className="font-extrabold text-gray-900">{entry.calories}</span>
                  </span>
                  <span>
                    Protein: <span className="font-extrabold text-gray-900">{entry.protein}g</span>
                  </span>
                  <span>
                    Carbs: <span className="font-extrabold text-gray-900">{entry.carbs}g</span>
                  </span>
                  <span>
                    Fat: <span className="font-extrabold text-gray-900">{entry.fat}g</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
