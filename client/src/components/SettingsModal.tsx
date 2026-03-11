import { IoCloseOutline } from 'react-icons/io5';
import Alert from './Alert';
import { useEffect, useState } from 'react';
import Select from 'react-select';
import { COUNTRIES } from '../countries/COUNTRIES';
import { useTranslation } from 'react-i18next';

const countryOptions = [...COUNTRIES].map((c) => ({
  value: c,
  label: c.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
}));

export default function SettingsModal({
  visible,
  onClose,
  email,
  calorieMax,
  proteinMax,
  carbsMax,
  fatMax,
  nationality,
  onUpdate,
}: {
  visible: boolean;
  onClose: () => void;
  email: string;
  calorieMax: string;
  proteinMax: string;
  carbsMax: string;
  fatMax: string;
  nationality: string;
  onUpdate: (payload: {
    email: string;
    calorieMax: string;
    proteinMax: string;
    carbsMax: string;
    fatMax: string;
    nationality: string;
  }) => Promise<void> | void;
}) {
  const { t } = useTranslation();
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<'success' | 'error'>('error');

  const [localEmail, setLocalEmail] = useState(email);
  const [localCalorieMax, setLocalCalorieMax] = useState(calorieMax);
  const [localProteinMax, setLocalProteinMax] = useState(proteinMax);
  const [localCarbsMax, setLocalCarbsMax] = useState(carbsMax);
  const [localFatMax, setLocalFatMax] = useState(fatMax);
  const [localNationality, setLocalNationality] = useState(nationality);

  useEffect(() => {
    if (visible) {
      setLocalEmail(email);
      setLocalCalorieMax(calorieMax);
      setLocalProteinMax(proteinMax);
      setLocalCarbsMax(carbsMax);
      setLocalFatMax(fatMax);
      setLocalNationality(nationality);
    }
  }, [visible, email, calorieMax, proteinMax, carbsMax, fatMax, nationality]);

  const isValidPositiveNumber = (value: string) => {
    const num = parseFloat(value.replace(',', '.'));
    return !isNaN(num) && num > 0;
  };

  const validateSettings = (): string | null => {
    if (localEmail.trim() === '') return t('settings.errorEmailRequired');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(localEmail)) return t('settings.errorEmailInvalid');
    if (!isValidPositiveNumber(localCalorieMax)) return t('settings.errorCaloriesPositive');
    if (parseInt(localCalorieMax) > 100000) return t('settings.errorCaloriesTooLarge');
    if (!isValidPositiveNumber(localProteinMax)) return t('settings.errorProteinPositive');
    if (parseInt(localProteinMax) > 100000) return t('settings.errorProteinTooLarge');
    if (!isValidPositiveNumber(localCarbsMax)) return t('settings.errorCarbsPositive');
    if (parseInt(localCarbsMax) > 100000) return t('settings.errorCarbsTooLarge');
    if (!isValidPositiveNumber(localFatMax)) return t('settings.errorFatPositive');
    if (parseInt(localFatMax) > 100000) return t('settings.errorFatTooLarge');
    if (localNationality.trim() === '') return t('settings.errorNationalityRequired');
    return null;
  };

  if (!visible) return null;

  return (
    <div className="overflow-y-auto pb-[10vh] fixed pt-5 inset-0 bg-white z-20 overflow-hidden flex flex-col">
      <div className="flex flex-row justify-between items-center px-3 sm:px-6 py-2 sm:py-4 border-b border-gray-200 bg-white flex-shrink-0">
        <p className="text-3xl sm:text-4xl font-bold text-gray-900">{t('settings.title')}</p>
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
        <div className="mb-4 sm:mb-8">
          <h2 className="text-base text-2xl font-semibold text-gray-900 mb-2 sm:mb-4">
            {t('settings.personalInfo')}
          </h2>
          <div className="pl-4 sm:pl-8">
            <label className="block mb-2 text-sm font-medium text-gray-900">
              {t('settings.email')}
            </label>
            <input
              type="email-address"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-xs sm:text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent block w-full p-2 sm:p-2.5"
              value={localEmail}
              onChange={(e) => setLocalEmail(e.target.value)}
            />
          </div>
          <div className="pl-4 sm:pl-8 mt-4">
            <label className="block mb-2 text-sm font-medium text-gray-900">
              {t('settings.nationality')}
            </label>
            <div className="flex flex-row gap-2 items-center w-full">
              <div className="flex-1 min-w-0">
                <Select
                  classNamePrefix="react-select"
                  className="w-full text-xs sm:text-sm"
                  isClearable={true}
                  placeholder={t('settings.selectCountry')}
                  options={countryOptions}
                  value={
                    countryOptions.find(
                      (opt) => opt.label.toLowerCase() === localNationality.toLowerCase()
                    ) || null
                  }
                  onChange={(option) => {
                    setLocalNationality(option?.label || '');
                  }}
                  components={{
                    MenuList: (props) => <>{props.children}</>,
                  }}
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderRadius: '0.5rem',
                      minHeight: '32px',
                      borderColor: '#d1d5db',
                      boxShadow: 'none',
                      fontSize: '0.95rem',
                      padding: '0 2px',
                    }),
                    menu: (base) => ({
                      ...base,
                      borderRadius: '0.5rem',
                      zIndex: 50,
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isFocused ? '#e0e7ff' : 'white',
                      color: '#111827',
                      fontSize: '0.95rem',
                      padding: '8px 10px',
                    }),
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="mb-4 sm:mb-8">
          <h2 className="text-base text-2xl font-semibold text-gray-900 mb-2 sm:mb-4">
            {t('settings.dailyMacros')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-6 pl-4 sm:pl-8">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900">
                {t('settings.calorieGoal')}
              </label>
              <input
                type="decimal-pad"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs sm:text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent block w-full p-2 sm:p-2.5"
                value={localCalorieMax}
                onChange={(e) => setLocalCalorieMax(e.target.value.replace(/[^0-9]/g, ''))}
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900">
                {t('settings.proteinGoal')}
              </label>
              <input
                type="decimal-pad"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs sm:text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent block w-full p-2 sm:p-2.5"
                value={localProteinMax}
                onChange={(e) => setLocalProteinMax(e.target.value.replace(/[^0-9]/g, ''))}
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900">
                {t('settings.carbsGoal')}
              </label>
              <input
                type="decimal-pad"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs sm:text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent block w-full p-2 sm:p-2.5"
                value={localCarbsMax}
                onChange={(e) => setLocalCarbsMax(e.target.value.replace(/[^0-9]/g, ''))}
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900">
                {t('settings.fatGoal')}
              </label>
              <input
                type="decimal-pad"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs sm:text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent block w-full p-2 sm:p-2.5"
                value={localFatMax}
                onChange={(e) => setLocalFatMax(e.target.value.replace(/[^0-9]/g, ''))}
              />
            </div>
          </div>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <button
            className="flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-[#3a3a3cff] text-white font-medium text-sm sm:text-base hover:bg-[#4a4a4cff] transition-all active:scale-95 cursor-pointer"
            onClick={async () => {
              const err = validateSettings();
              if (err) {
                setAlertMsg(err);
                setAlertType('error');
                return;
              }
              setAlertMsg(null);

              await onUpdate({
                email: localEmail,
                calorieMax: localCalorieMax,
                proteinMax: localProteinMax,
                carbsMax: localCarbsMax,
                fatMax: localFatMax,
                nationality: localNationality,
              });

              onClose();
            }}
          >
            {t('settings.update')}
          </button>
          <button
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium bg-gray-200 hover:bg-gray-50 transition-all cursor-pointer"
            onClick={onClose}
          >
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}
