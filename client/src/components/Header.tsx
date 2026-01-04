import { IoSettingsOutline } from 'react-icons/io5';
import { LuLogOut } from 'react-icons/lu';

export default function Header({
  onOpenSettings,
  onLogout,
}: { onOpenSettings: () => void } & { onLogout: () => void }) {
  return (
    <div className="pt-5 flex flex-row justify-between items-center mx-2 my-2 mb-5 sm:m-5 sm:mt-8 sm:mb-0 gap-2">
      <p className="text-3xl sm:text-4xl font-bold relative">Today</p>
      <div className="flex items-center gap-1 sm:gap-2">
        <div className="bg-white rounded-lg text-2 relative shadow-sm p-2 sm:p-2 flex items-center justify-center bg-[#f2f2f2ff] hover:bg-gray-300 transition-colors cursor-pointer">
          <button className="flex text-sm sm:text-base gap-1 sm:gap-2" onClick={onLogout}>
            <LuLogOut size={28} color="black" />
            <p className="hidden sm:block">Logout</p>
          </button>
        </div>
        <div className="bg-white rounded-lg text-2 relative shadow-sm p-2 sm:p-2 flex items-center justify-center bg-[#f2f2f2ff] hover:bg-gray-300 transition-colors cursor-pointer">
          <button onClick={onOpenSettings}>
            <IoSettingsOutline size={28} color="black" />
          </button>
        </div>
      </div>
    </div>
  );
}
