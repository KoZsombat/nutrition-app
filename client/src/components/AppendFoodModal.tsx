import { useState } from 'react';
import { IoCloseOutline } from 'react-icons/io5';
import type { CalEntry } from '../types/types';
import Alert from './Alert';

export default function AppendFoodModal({
  visible,
  onClose,
  cals,
  mealGrams,
  setMealGrams,
  activeItem,
  setActiveItem,
  onAddEaten,
}: {
  visible: boolean;
  onClose: () => void;
  cals: CalEntry[];
  mealGrams: string;
  setMealGrams: (v: string) => void;
  activeItem: string;
  setActiveItem: (v: string) => void;
  onAddEaten: (name: string) => void;
}) {
  const [search, setSearch] = useState('');
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<'success' | 'error'>('error');

  if (!visible) return null;

  const isValidPositiveNumber = (v: string) => {
    const num = parseFloat(v);
    return Number.isFinite(num) && num > 0;
  };

  const validateAppend = (name: string): string | null => {
    if (activeItem !== name) return 'Enter grams for this meal before adding.';
    if (!isValidPositiveNumber(mealGrams)) return 'Grams must be a positive number.';
    if (parseFloat(mealGrams) > 100000) return 'Grams must be less than or equal to 100000.';
    return null;
  };

  return (
    <div className="overflow-y-auto pb-[10vh] fixed pt-5 inset-0 bg-white z-20 overflow-hidden flex flex-col">
      <div className="flex flex-row justify-between items-center px-3 sm:px-6 py-2 sm:py-4 border-b border-gray-200 bg-white flex-shrink-0">
        <p className="text-3xl sm:text-4xl font-bold text-gray-900">Add Meal</p>
        <button
          className="hover:bg-gray-100 rounded-lg p-2 transition-colors cursor-pointer"
          onClick={onClose}
          aria-label="Close"
        >
          <IoCloseOutline size={28} color="#000" />
        </button>
      </div>
      <div className="overflow-y-auto flex-1 p-3 sm:p-6 max-w-2xl mx-auto w-full">
        {alertMsg && (
          <Alert message={alertMsg} type={alertType} onClose={() => setAlertMsg(null)} />
        )}
        <input
          placeholder="Search for meals..."
          className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2 sm:p-2.5 mb-4 sm:mb-6 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="space-y-2 sm:space-y-3">
          {cals
            .filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
            .map((f, i) => (
              <div
                className="flex flex-row items-center gap-2 sm:gap-3 p-2 sm:p-4 bg-gray-50 rounded-lg border border-gray-200"
                key={i}
              >
                <span className="flex-1 font-medium text-gray-700 text-sm">{f.name}</span>
                <input
                  type="numeric"
                  placeholder="grams"
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg w-16 sm:w-24 p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  defaultValue={0}
                  onFocus={() => setActiveItem(f.name)}
                  onChange={(e) => setMealGrams(e.target.value.replace(/[^0-9]/g, ''))}
                />
                <button
                  className="px-2 sm:px-4 py-1 sm:py-2 rounded-lg bg-[#3a3a3cff] text-white text-sm font-medium hover:bg-[#4a4a4cff] transition-all active:scale-95 cursor-pointer"
                  onClick={() => {
                    const err = validateAppend(f.name);
                    if (err) {
                      setAlertMsg(err);
                      setAlertType('error');
                      return;
                    }
                    setAlertMsg('Meal added successfully!');
                    setAlertType('success');
                    setMealGrams('');
                    setActiveItem('');
                    onAddEaten(f.name);
                  }}
                >
                  Add
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
