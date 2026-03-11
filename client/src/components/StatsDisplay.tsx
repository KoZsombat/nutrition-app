import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import MacroBar from './MacroBar';
import { useTranslation } from 'react-i18next';

export default function StatsDisplay({
  calories,
  protein,
  carbs,
  fat,
  calorieMax,
  proteinMax,
  carbsMax,
  fatMax,
}: {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  calorieMax: string;
  proteinMax: string;
  carbsMax: string;
  fatMax: string;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-row items-center justify-center bg-white mx-3 my-2 sm:m-5 p-2 sm:p-3 shadow-sm rounded-xl gap-3">
      <div
        className="relative flex flex-col text-center justify-center"
        style={{ width: 120, height: 120 }}
      >
        <div className="absolute" style={{ top: 0, left: 0 }}>
          <div style={{ width: 120, height: 120, borderRadius: 20 }}>
            <CircularProgressbar
              value={Number(calorieMax) === 0 ? 0 : (calories / Number(calorieMax)) * 100}
              strokeWidth={12}
              styles={buildStyles({
                pathColor:
                  Number(calorieMax) === 0
                    ? 'rgb(229, 231, 235)'
                    : (calories / Number(calorieMax)) * 100 > 100
                      ? 'red'
                      : 'rgb(48, 48, 50)',
                trailColor: 'rgb(229, 231, 235)',
                strokeLinecap: 'round',
              })}
            />
          </div>
        </div>
        <p className="font-bold text-center text-sm sm:text-xs">{t('stats.calories')}</p>
        <p className="text-center text-sm sm:text-xs">
          {calories} / {calorieMax}
        </p>
      </div>
      <div className="rounded overflow-hidden flex-1 left-0">
        <MacroBar label={t('stats.protein')} current={protein} max={proteinMax} />
        <MacroBar label={t('stats.carbs')} current={carbs} max={carbsMax} />
        <MacroBar label={t('stats.fat')} current={fat} max={fatMax} />
      </div>
    </div>
  );
}
