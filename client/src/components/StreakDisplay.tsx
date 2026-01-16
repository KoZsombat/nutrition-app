import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

export default function StreakDisplay({ streak }: { streak: number }) {
  const maxStreak = 365;
  const percent = Math.min((streak / maxStreak) * 100, 100);
  // Match StatsDisplay color logic, but use orange instead of red
  let pathColor = 'rgb(48, 48, 50)';
  if (streak === 0) pathColor = 'rgb(229, 231, 235)';
  else if (percent > 100) pathColor = '#f59e42'; // orange-400

  return (
    <div className="flex flex-row items-center justify-center mx-3 my-2 sm:m-5 p-2 sm:p-3 shadow-sm rounded-xl bg-white gap-3 max-w-6xl mx-auto w-auto">
      {/* <div
        className="relative flex flex-col text-center justify-center"
        style={{ width: 150, height: 150 }}
      >
        <div className="absolute" style={{ top: 0, left: 0 }}>
          <div style={{ width: 150, height: 150, borderRadius: 20 }}>
            <CircularProgressbar
              value={percent}
              strokeWidth={12}
              styles={buildStyles({
                pathColor,
                trailColor: 'rgb(229, 231, 235)',
                strokeLinecap: 'round',
              })}
            />
          </div>
        </div>
        <p className="text-center text-sm mt-1">{percent.toFixed(1)}%</p>
      </div> */}
      <div className="rounded overflow-hidden flex-1 left-0 flex flex-col justify-center items-center px-2">
        <p className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Your Streak:</p>
        <p className="text-3xl sm:text-4xl font-extrabold text-orange-400 mb-1">{streak}</p>
      </div>
    </div>
  );
}
