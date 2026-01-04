import { useEffect, useState } from 'react';
import { IoCloseOutline } from 'react-icons/io5';
import type { FoodEntry } from '../types/types';
import Alert from './Alert';

export default function AddMealModal({
  visible,
  onClose,
  food,
  onAdd,
  editMode = false,
  initialMealName = '',
  initialIngredients = [],
}: {
  visible: boolean;
  onClose: () => void;
  food: FoodEntry[];
  onAdd: (name: string, ingredients: { name: string; grams: string }[]) => void;
  editMode?: boolean;
  initialMealName?: string;
  initialIngredients?: { name: string; grams: string }[];
}) {
  const [search, setSearch] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [localMealName, setLocalMealName] = useState(initialMealName);
  const [localSelectedIngredients, setLocalSelectedIngredients] =
    useState<{ name: string; grams: string }[]>(initialIngredients);

  const isValidPositiveNumber = (v: string) => {
    const num = parseFloat(v);
    return Number.isFinite(num) && num > 0;
  };

  useEffect(() => {
    if (visible) {
      setLocalMealName(initialMealName);
      setLocalSelectedIngredients(initialIngredients);
    }
  }, [visible, initialMealName, initialIngredients]);

  if (!visible) return null;

  const validateMeal = (): string | null => {
    if (localMealName.trim() === '') return 'Meal name is required.';
    if (localSelectedIngredients.length === 0) return 'Add at least one ingredient to the meal.';
    const invalid = localSelectedIngredients.find((si) => !isValidPositiveNumber(si.grams));
    if (invalid) return `Grams for '${invalid.name}' must be a positive number.`;
    const tooLarge = localSelectedIngredients.find((si) => parseFloat(si.grams) > 100000);
    if (tooLarge) return `Grams for '${tooLarge.name}' must be less than or equal to 100000.`;
    return null;
  };

  return (
    <div className="overflow-y-auto pb-[10vh] fixed pt-5 inset-0 bg-white z-20 overflow-hidden flex flex-col">
      <div className="flex flex-row justify-between items-center px-3 sm:px-6 py-2 sm:py-4 border-b border-gray-200 bg-white flex-shrink-0">
        <p className="text-3xl sm:text-4xl font-bold text-gray-900">
          {editMode ? 'Edit' : 'Create'} Meal
        </p>
        <button
          className="hover:bg-gray-100 rounded-lg p-2 transition-colors cursor-pointer"
          onClick={onClose}
          aria-label="Close"
        >
          <IoCloseOutline size={28} color="#000" />
        </button>
      </div>
      <div className="overflow-y-auto flex-1 p-3 sm:p-6 max-w-2xl mx-auto w-full">
        {errorMsg && <Alert message={errorMsg} onClose={() => setErrorMsg(null)} />}
        <div className="mb-4 sm:mb-6">
          <p className="block mb-2 text-sm font-medium text-gray-900">Meal name:</p>
          <input
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={localMealName}
            onChange={(e) => setLocalMealName(e.target.value)}
          />
        </div>
        <input
          placeholder="Search for ingredients..."
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 mb-4 sm:mb-6 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
          {food
            .filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
            .map((ingredient, idx) => {
              const selected = localSelectedIngredients.find((i) => i.name === ingredient.name);
              return (
                <div
                  key={idx}
                  className="flex flex-row items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <span className="flex-1 font-medium text-gray-700 text-sm">
                    {ingredient.name}
                  </span>
                  <input
                    type="numeric"
                    placeholder="grams"
                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg w-20 sm:w-24 p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={selected?.grams ?? ''}
                    onChange={(e) => {
                      const numeric = e.target.value.replace(/[^0-9]/g, '');
                      setLocalSelectedIngredients((prev: { name: string; grams: string }[]) => {
                        const exists = prev.find((i) => i.name === ingredient.name);
                        if (exists)
                          return prev.map((i) =>
                            i.name === ingredient.name ? { ...i, grams: numeric } : i
                          );
                        return [...prev, { name: ingredient.name, grams: numeric }];
                      });
                    }}
                  />
                </div>
              );
            })}
        </div>
        <div className="flex gap-2 sm:gap-3">
          <button
            className={`flex-1 px-4 py-3 rounded-lg ${editMode ? 'bg-[#5a5a5cff] hover:bg-[#6a6a6cff]' : 'bg-[#3a3a3cff] hover:bg-[#4a4a4cff]'} text-white font-medium transition-all active:scale-95 cursor-pointer`}
            onClick={() => {
              const err = validateMeal();
              if (err) {
                setErrorMsg(err);
                return;
              }
              setErrorMsg(null);
              onAdd(localMealName, localSelectedIngredients);
            }}
          >
            {editMode ? 'Save Changes' : 'Create Meal'}
          </button>
          <button
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium bg-gray-200 hover:bg-gray-50 transition-all cursor-pointer"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
