import { FaHistory } from 'react-icons/fa';
import { BiSolidFoodMenu } from 'react-icons/bi';
import { FaHome } from 'react-icons/fa';

export default function Navbar({
  onHistory,
  onHome,
  onOpenManage,
}: {
  onHistory: () => void;
  onOpenManage: () => void;
  onHome: () => void;
}) {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-white z-30 flex items-center justify-center gap-3 sm:gap-4 p-2 sm:p-2 shadow-[0_-2px_8px_0_rgba(0,0,0,0.08)]">
      <button
        className="flex flex-col items-center w-24 sm:w-24 hover:opacity-70 transition-opacity cursor-pointer"
        onClick={onHistory}
      >
        <FaHistory size={24} color="black" />
        <p className="text-sm sm:text-sm">History</p>
      </button>
      <button
        className="flex flex-col items-center w-24 sm:w-24 hover:opacity-70 transition-opacity cursor-pointer"
        onClick={onHome}
      >
        <FaHome size={24} color="black" />
        <p className="text-sm sm:text-sm">Home</p>
      </button>
      <button
        className="flex flex-col items-center w-24 sm:w-24 hover:opacity-70 transition-opacity cursor-pointer"
        onClick={onOpenManage}
      >
        <BiSolidFoodMenu size={24} color="black" />
        <p className="text-sm sm:text-sm">Manage Meals</p>
      </button>
    </div>
  );
}
