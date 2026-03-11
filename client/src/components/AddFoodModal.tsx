import { useState } from 'react';
import { IoCloseOutline } from 'react-icons/io5';
import type { CalEntry, FoodEntry } from '../types/types';
import { useTranslation } from 'react-i18next';

export default function AddFoodModal({
  visible,
  onClose,
  food,
  cals,
  onOpenIngredient,
  onOpenMeal,
  onEditIngredient,
  onDeleteIngredient,
  onEditMeal,
  onDeleteMeal,
}: {
  visible: boolean;
  onClose: () => void;
  food: FoodEntry[];
  cals: CalEntry[];
  onOpenIngredient: () => void;
  onOpenMeal: () => void;
  onEditIngredient: (id: number) => void;
  onDeleteIngredient: (id: number) => void;
  onEditMeal: (meal: CalEntry) => void;
  onDeleteMeal: (id: number) => void;
}) {
  const { t } = useTranslation();
  const [list, setList] = useState(false);

  if (!visible) return null;

  return (
    <div className="overflow-y-auto pb-[10vh] fixed pt-5 inset-0 bg-white z-20 overflow-hidden flex flex-col">
      <div className="flex flex-row justify-between items-center px-3 sm:px-6 py-2 sm:py-4 border-b border-gray-200 bg-white flex-shrink-0">
        <p className="text-3xl sm:text-4xl font-bold text-gray-900">{t('manageFood.title')}</p>
        <button
          className="hover:bg-gray-100 rounded-lg p-2 transition-colors cursor-pointer"
          onClick={onClose}
          aria-label="Close"
        >
          <IoCloseOutline size={28} color="#000" />
        </button>
      </div>

      <div className="overflow-y-auto flex-1 p-3 sm:p-6 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-8">
          <button
            className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-[#5a5a5cff] text-white font-medium text-sm sm:text-base hover:bg-[#6a6a6cff] transition-all active:scale-95 shadow-md"
            onClick={onOpenIngredient}
          >
            {t('manageFood.addIngredient')}
          </button>
          <button
            className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-[#3a3a3cff] text-white font-medium text-sm sm:text-base hover:bg-[#4a4a4cff] transition-all active:scale-95 shadow-md"
            onClick={onOpenMeal}
          >
            {t('manageFood.createMeal')}
          </button>
        </div>

        <div className="flex gap-2 border-b border-gray-200 mb-4 sm:mb-6">
          <button
            onClick={() => setList(false)}
            className={`px-2 sm:px-4 py-2 sm:py-3 font-medium text-sm transition-colors border-b-2 ${
              !list
                ? 'text-gray-600 border-gray-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            {t('manageFood.ingredients')}
          </button>
          <button
            onClick={() => setList(true)}
            className={`px-2 sm:px-4 py-2 sm:py-3 font-medium text-sm transition-colors border-b-2 ${
              list
                ? 'text-gray-600 border-gray-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            {t('manageFood.meals')}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {!list ? (
            <>
              {food.length === 0 ? (
                <p className="text-center text-gray-400 py-8 col-span-full">
                  {t('manageFood.noIngredients')}
                </p>
              ) : (
                food.map((f) => (
                  <div
                    key={f.id}
                    className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors flex flex-col gap-3"
                  >
                    <span className="font-medium text-gray-800 text-lg">{f.name}</span>
                    <div className="flex gap-2">
                      <button
                        className="flex-1 px-3 py-2 rounded-lg bg-[#3a3a3cff] text-white text-xs font-medium hover:bg-[#4a4a4cff] transition-colors"
                        onClick={() => onEditIngredient(f.id)}
                      >
                        {t('common.edit')}
                      </button>
                      <button
                        className="flex-1 px-3 py-2 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition-colors"
                        onClick={() => onDeleteIngredient(f.id)}
                      >
                        {t('common.delete')}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </>
          ) : (
            <>
              {cals.length === 0 ? (
                <p className="text-center text-gray-400 py-8 col-span-full">
                  {t('manageFood.noMeals')}
                </p>
              ) : (
                cals.map((f) => (
                  <div
                    key={f.id}
                    className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors flex flex-col gap-3"
                  >
                    <span className="font-medium text-gray-800 text-lg">{f.name}</span>
                    <div className="flex gap-2">
                      <button
                        className="flex-1 px-3 py-2 rounded-lg bg-[#3a3a3cff] text-white text-xs font-medium hover:bg-[#4a4a4cff] transition-colors"
                        onClick={() => onEditMeal(f)}
                      >
                        {t('common.edit')}
                      </button>
                      <button
                        className="flex-1 px-3 py-2 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition-colors"
                        onClick={() => onDeleteMeal(f.id)}
                      >
                        {t('common.delete')}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
