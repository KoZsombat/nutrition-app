export default function MacroBar({
  label,
  current,
  max,
}: {
  label: string;
  current: number;
  max: string;
}) {
  const percentage = Math.min((current / Number(max)) * 100, 100);
  const isOver = current / Number(max) > 1;

  return (
    <div className="flex flex-row justify-center items-center p-3 pt-0 w-[100%] first:pt-3">
      <div className="w-[50%]">
        <p className="font-bold text-center text-sm">{label}</p>
        <p className="text-center text-sm">
          {current}g / {max}g
        </p>
      </div>
      <div className="w-[50%] h-2 bg-gray-200 rounded-xl">
        <div
          style={{
            height: '100%',
            width: `${percentage}%`,
            backgroundColor: isOver ? (label == 'protein' ? 'green' : 'red') : 'rgb(48, 48, 50)',
            borderRadius: 5,
          }}
        />
      </div>
    </div>
  );
}
