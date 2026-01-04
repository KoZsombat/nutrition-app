import { IoAddCircleOutline } from 'react-icons/io5';
import { MdSaveAs } from 'react-icons/md';
import type { CalEntry, FoodEntry, EatenEntry } from '../types/types';

export default function TodaysCuisine({
  eaten,
  cals,
  food,
  Clear,
  onOpenAppend,
  onDeleteEaten,
}: {
  eaten: EatenEntry[];
  cals: CalEntry[];
  food: FoodEntry[];
  Clear: () => void;
  onOpenAppend: () => void;
  onDeleteEaten: (name: string) => void;
}) {
  return (
    <div className="bg-white mx-3 my-2 sm:m-5 p-2 shadow-sm rounded-xl min-h-[30vh] max-h-[45vh] flex flex-col">
      <div className="flex flex-row justify-between items-center">
        <p className="text-lg sm:text-2xl relative m-2">Today's Cousine</p>
        <div className="flex flex-row justify-between gap-2 sm:gap-3 mr-2 sm:mr-3">
          <button
            className="bg-[#f2f2f2ff] rounded-lg p-1.5 sm:p-2 hover:bg-gray-300 transition-colors cursor-pointer"
            onClick={onOpenAppend}
          >
            <IoAddCircleOutline size={28} color="black" />
          </button>
          <button
            className="bg-[#f2f2f2ff] rounded-lg p-1.5 sm:p-2 hover:bg-gray-300 transition-colors cursor-pointer"
            onClick={Clear}
          >
            <MdSaveAs size={28} color="black" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto min-h-[32vh] p-2 flex flex-col">
        {eaten.length === 0 ? (
          <div className="flex relative justify-center items-center h-full">
            <p className="text-base absolute top-[12.5vh] text-center font-bold">
              Nothing here yet
            </p>
          </div>
        ) : (
          eaten.map((e, i) => {
            const meal = cals.find((c) => c.name === e.name);
            if (!meal) return null;

            let allCals = 0,
              allProtein = 0,
              allCarbs = 0,
              allFat = 0;
            meal.food.forEach((item) => {
              const foodItem = food.find((f) => f.name === item);
              if (foodItem) {
                const factor = parseFloat(e.grams) / 100;
                allCals += foodItem.cal * factor;
                allProtein += foodItem.protein * factor;
                allCarbs += foodItem.carbs * factor;
                allFat += foodItem.fat * factor;
              }
            });

            //CAN EDIT OR DELETE HERE
            return (
              <div key={i} className="flex rounded-xl m-1.5 p-2 bg-[#f2f2f2ff] items-center">
                <div className="flex-1">
                  <p className="text-sm sm:text-md font-bold uppercase">{meal.name}</p>
                  <p className="text-xs sm:text-sm">
                    Calories: {parseFloat(allCals.toFixed(2))}, Protein:{' '}
                    {parseFloat(allProtein.toFixed(2))}, Carbs: {parseFloat(allCarbs.toFixed(2))},
                    Fat: {parseFloat(allFat.toFixed(2))}
                  </p>
                </div>
                <button
                  className={
                    'px-3 py-2 rounded-lg bg-[#3a3a3cff] hover:bg-[#4a4a4cff] text-white font-medium transition-all active:scale-95 cursor-pointer text-sm'
                  }
                  onClick={() => onDeleteEaten(meal.name)}
                >
                  Delete
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
