import { IoCloseOutline } from 'react-icons/io5';
import { HiCamera } from 'react-icons/hi';
import { FaClipboardList } from 'react-icons/fa';
import Alert from './Alert';
import { useEffect, useState } from 'react';
import Select from 'react-select';
import BarcodeNumberScanner from './BarcodeNumberScanner';

export default function AddIngredientModal({
  visible,
  onClose,
  name,
  calories,
  protein,
  carbs,
  fat,
  nationality,
  onAdd,
  editMode,
  apiUrl,
  token,
}: {
  visible: boolean;
  onClose: () => void;
  name: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  nationality: string;
  onAdd: (ingredient: {
    name: string;
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
  }) => void;
  editMode: boolean;
  apiUrl: string;
  token: string;
}) {
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<'success' | 'error'>('error');
  const [localName, setLocalName] = useState(name);
  const [localCalories, setLocalCalories] = useState(calories);
  const [localProtein, setLocalProtein] = useState(protein);
  const [localCarbs, setLocalCarbs] = useState(carbs);
  const [localFat, setLocalFat] = useState(fat);
  const [viewMode, setViewMode] = useState<'create' | 'database'>('create');
  const [dbAll, setDbAll] = useState<
    Array<{
      id: string;
      name: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    }>
  >([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<{ value: string; label: string } | null>(
    null
  );
  const [isBarcode, setIsBarcode] = useState<boolean>(false);
  const [isNutTable, setIsNutTable] = useState<boolean>(false);

  const isMobile = () => {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  };

  const fetchBarcodeProduct = async (barcode: string) => {
    try {
      const response = await fetch(`${apiUrl}/api/ProductBarcodeSearch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ query: barcode }),
      });
      const json = await response.json();
      if (json.products && json.products.length > 0) {
        const product = json.products[0];
        setLocalName(product.name ?? '');
        setLocalCalories(product.calories?.toString() ?? '0');
        setLocalProtein(product.protein?.toString() ?? '0');
        setLocalCarbs(product.carbs?.toString() ?? '0');
        setLocalFat(product.fat?.toString() ?? '0');
        setAlertMsg('Product found from barcode!');
        setAlertType('success');
      } else {
        setAlertMsg('Product not found in database');
        setAlertType('error');
      }
    } catch (error) {
      setAlertMsg('Failed to fetch product data from barcode.');
      setAlertType('error');
      console.error(error);
    }
  };

  const fetchProducts = async (search: string) => {
    if (search.length < 3) return;
    if (!nationality) {
      setAlertMsg('Please select your nationality first.');
      setAlertType('error');
      return;
    }

    setLoading(true);
    let allProducts: {
      name: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    }[] = [];

    try {
      const response = await fetch(`${apiUrl}/api/ProductSearch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ query: search }),
      });
      const json = await response.json();

      let filtered = json.products.map(
        (product: {
          name?: string;
          calories?: number;
          protein?: number;
          carbs?: number;
          fat?: number;
        }) => ({
          name: product.name ?? 'Unknown',
          calories: product.calories ?? 0,
          protein: product.protein ?? 0,
          carbs: product.carbs ?? 0,
          fat: product.fat ?? 0,
        })
      );

      filtered = filtered.filter(
        (
          item: { name: string; calories: number; protein: number; carbs: number; fat: number },
          index: number,
          self: { name: string; calories: number; protein: number; carbs: number; fat: number }[]
        ) => index === self.findIndex((t: { name: string }) => t.name === item.name)
      );

      filtered = filtered.filter(
        (item: { name: string; calories: number; protein: number; carbs: number; fat: number }) =>
          item.name !== 'Unknown' &&
          !(item.calories === 0 && item.protein === 0 && item.carbs === 0 && item.fat === 0)
      );

      // Add a fake id for compatibility, since API doesn't provide it
      const filteredWithId = filtered.map(
        (
          item: { name: string; calories: number; protein: number; carbs: number; fat: number },
          idx: number
        ) => ({ ...item, id: `${item.name}-${idx}` })
      );
      allProducts = allProducts.concat(filteredWithId);

      // Ensure allProducts only contains objects with id field
      setDbAll(
        allProducts as {
          id: string;
          name: string;
          calories: number;
          protein: number;
          carbs: number;
          fat: number;
        }[]
      );
    } catch (error) {
      console.error(error);
      setDbAll([]);
    } finally {
      setLoading(false);
    }
  };

  const isValidPositiveNumber = (v: string) => {
    const num = parseFloat(v);
    return Number.isFinite(num) && num >= 0;
  };

  useEffect(() => {
    if (visible) {
      setLocalName(name);
      setLocalCalories(calories);
      setLocalProtein(protein);
      setLocalCarbs(carbs);
      setLocalFat(fat);
    }
  }, [visible, name, calories, protein, carbs, fat]);

  if (!visible) return null;

  const validateIngredient = (): string | null => {
    if (localName.trim() === '') return 'Ingredient name is required.';
    if (!isValidPositiveNumber(localCalories)) return 'Calories must be a positive number.';
    if (parseFloat(localCalories) > 100000) return 'Calories must be less than or equal to 100000.';
    if (!isValidPositiveNumber(localProtein)) return 'Protein must be a positive number.';
    if (parseFloat(localProtein) > 100000) return 'Protein must be less than or equal to 100000.';
    if (!isValidPositiveNumber(localCarbs)) return 'Carbs must be a positive number.';
    if (parseFloat(localCarbs) > 100000) return 'Carbs must be less than or equal to 100000.';
    if (!isValidPositiveNumber(localFat)) return 'Fat must be a positive number.';
    if (parseFloat(localFat) > 100000) return 'Fat must be less than or equal to 100000.';
    return null;
  };

  const handleNumberInput = (value: string, setter: (v: string) => void) => {
    let cleaned = value.replace(/[^0-9.,]/g, '');
    const firstDot = cleaned.indexOf('.') !== -1 ? cleaned.indexOf('.') : cleaned.indexOf(',');
    if (firstDot !== -1) {
      const before = cleaned.slice(0, firstDot + 1);
      const after = cleaned.slice(firstDot + 1).replace(/[.,]/g, '');
      cleaned = before + after;
    }
    setter(cleaned.replace(',', '.'));
  };

  if (!visible) return null;
  return (
    <div className="fixed pt-5 inset-0 bg-white z-20 overflow-hidden flex flex-col">
      {isBarcode && (
        <BarcodeNumberScanner
          onDetected={(barcode) => {
            console.log('OCR Barcode:', barcode);
            fetchBarcodeProduct(String(barcode));
            setIsBarcode(false);
          }}
          onClose={() => setIsBarcode(false)}
        />
      )}
      {isNutTable && <h1>asd</h1>}
      <div className="flex flex-row justify-between items-center px-3 sm:px-6 py-2 sm:py-4 border-b border-gray-200 bg-white flex-shrink-0">
        <p className="text-3xl sm:text-4xl font-bold text-gray-900">
          {editMode ? 'Edit' : 'Add'} Ingredient
        </p>
        <button
          className="hover:bg-gray-100 rounded-lg p-2 transition-colors cursor-pointer"
          onClick={onClose}
          aria-label="Close"
        >
          <IoCloseOutline size={28} color="#000" />
        </button>
      </div>
      <div className="overflow-y-auto pb-[10vh] flex-1 p-3 sm:p-6 max-w-2xl mx-auto w-full">
        <div className="flex gap-4 mb-6 sm:mb-10 justify-center">
          <button
            onClick={() => setViewMode('create')}
            className={`px-3 sm:px-5 py-1 sm:py-2 font-medium text-xs sm:text-sm transition-colors border-b-2 rounded-t-lg focus:outline-none ${
              viewMode === 'create'
                ? 'text-gray-900 border-gray-900 bg-gray-100'
                : 'text-gray-500 border-transparent hover:text-gray-700 bg-transparent'
            }`}
          >
            Create Own Ingredient
          </button>
          <button
            onClick={() => setViewMode('database')}
            className={`px-3 sm:px-5 py-1 sm:py-2 font-medium text-xs sm:text-sm transition-colors border-b-2 rounded-t-lg focus:outline-none ${
              viewMode === 'database'
                ? 'text-gray-900 border-gray-900 bg-gray-100'
                : 'text-gray-500 border-transparent hover:text-gray-700 bg-transparent'
            }`}
          >
            Select from Database
          </button>
        </div>
        {alertMsg && (
          <Alert message={alertMsg} type={alertType} onClose={() => setAlertMsg(null)} />
        )}
        <div className="gap-3 sm:gap-6 w-full">
          <div className="col-span-1 md:col-span-2 flex flex-col gap-2 mb-2">
            {viewMode === 'database' && (
              <>
                <label
                  className="block w-full text-sm md:text-xs font-medium text-gray-900 mb-1"
                  htmlFor="ingredient-search"
                >
                  Search for an ingredient in the public food database:
                </label>
                <div className="flex w-full gap-2 items-center mb-2">
                  <input
                    id="ingredient-search"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm md:text-xs rounded-lg block w-full p-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    type="text"
                    placeholder="e.g. chicken breast, apple, rice..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      fetchProducts(e.target.value);
                      setSelectedOption(null);
                      setLocalName('');
                      setLocalCalories('');
                      setLocalProtein('');
                      setLocalCarbs('');
                      setLocalFat('');
                    }}
                  />
                </div>
                <label
                  className="block w-full text-sm md:text-xs font-medium text-gray-900 mb-1"
                  htmlFor="ingredient-select"
                >
                  Select a product to autofill the fields:
                </label>
                <Select
                  inputId="ingredient-select"
                  classNamePrefix="react-select"
                  className="w-full text-sm md:text-xs"
                  isDisabled={searchTerm.length < 3 || loading}
                  isLoading={loading}
                  placeholder={
                    searchTerm.length < 3
                      ? 'Type at least 3 characters to search'
                      : loading
                        ? 'Loading...'
                        : dbAll.length === 0
                          ? 'No results found'
                          : 'Select a product...'
                  }
                  options={dbAll.map((item) => ({
                    value: item.id,
                    label: `${item.name} - ${item.calories} kcal, ${item.protein}g P, ${item.carbs}g C, ${item.fat}g F per 100g`,
                  }))}
                  onChange={(option) => {
                    setSelectedOption(option);
                    const selected = dbAll.find((item) => item.id === option?.value);
                    if (selected) {
                      setLocalName(selected.name);
                      setLocalCalories(selected.calories.toString());
                      setLocalProtein(selected.protein.toString());
                      setLocalCarbs(selected.carbs.toString());
                      setLocalFat(selected.fat.toString());
                    }
                  }}
                  value={selectedOption}
                  isClearable={true}
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderRadius: '0.5rem',
                      minHeight: '32px',
                      borderColor: '#d1d5db',
                      boxShadow: 'none',
                      fontSize: '0.85rem',
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
                      fontSize: '0.85rem',
                      padding: '8px 10px',
                    }),
                  }}
                />
                <p className="text-right text-sm text-gray-600">Data: Open Food Facts, ODbL</p>
              </>
            )}
          </div>
          <div
            className={`grid grid-cols-1 gap-3 sm:gap-6 ${viewMode === 'database' ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}
          >
            {isMobile() && viewMode === 'create' ? (
              <div className="flex justify-center gap-2 mb-2">
                <button
                  className="flex flex-col items-center justify-center px-2 py-2 rounded-lg shadow bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 transition-all border border-gray-300 focus:outline-none group"
                  style={{ minWidth: 80 }}
                  onClick={() => setIsBarcode(true)}
                >
                  <span className="mb-0.5 flex items-center justify-center w-7 h-7 rounded-full bg-gray-200 group-hover:bg-gray-300 transition-all">
                    <HiCamera size={18} color="#111" />
                  </span>
                  <span className="text-[10px] font-semibold text-gray-900">Scan Barcode</span>
                </button>
                {/* <button
                  className="flex flex-col items-center justify-center px-2 py-2 rounded-lg shadow bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 transition-all border border-gray-300 focus:outline-none group"
                  style={{ minWidth: 80 }}
                  onClick={() => setIsNutTable(true)}
                >
                  <span className="mb-0.5 flex items-center justify-center w-7 h-7 rounded-full bg-gray-200 group-hover:bg-gray-300 transition-all">
                    <FaClipboardList size={18} color="#111" />
                  </span>
                  <span className="text-[10px] font-semibold text-gray-900">
                    Scan Nutrition Table
                  </span>
                </button> */}
              </div>
            ) : null}
            <div>
              <p className={`block mb-2 text-sm font-medium text-gray-900`}>Name:</p>
              <input
                className={
                  `bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent ` +
                  (viewMode === 'database' ? 'md:text-xs md:p-1.5 text-sm p-2.5' : 'text-sm p-2.5')
                }
                value={localName}
                onChange={(e) => setLocalName(e.target.value)}
              />
            </div>
            <div>
              <p className={`block mb-2 text-sm font-medium text-gray-900`}>Calories in 100g:</p>
              <input
                className={
                  `bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent ` +
                  (viewMode === 'database' ? 'md:text-xs md:p-1.5 text-sm p-2.5' : 'text-sm p-2.5')
                }
                value={localCalories}
                onChange={(e) => handleNumberInput(e.target.value, setLocalCalories)}
              />
            </div>
            <div>
              <p className={`block mb-2 text-sm font-medium text-gray-900`}>Protein in 100g:</p>
              <input
                className={
                  `bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent ` +
                  (viewMode === 'database' ? 'md:text-xs md:p-1.5 text-sm p-2.5' : 'text-sm p-2.5')
                }
                value={localProtein}
                onChange={(e) => handleNumberInput(e.target.value, setLocalProtein)}
              />
            </div>
            <div>
              <p className={`block mb-2 text-sm font-medium text-gray-900`}>Carbs in 100g:</p>
              <input
                className={
                  `bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent ` +
                  (viewMode === 'database' ? 'md:text-xs md:p-1.5 text-sm p-2.5' : 'text-sm p-2.5')
                }
                value={localCarbs}
                onChange={(e) => handleNumberInput(e.target.value, setLocalCarbs)}
              />
            </div>
            <div>
              <p className={`block mb-2 text-sm font-medium text-gray-900`}>Fat in 100g:</p>
              <input
                className={
                  `bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent ` +
                  (viewMode === 'database' ? 'md:text-xs md:p-1.5 text-sm p-2.5' : 'text-sm p-2.5')
                }
                value={localFat}
                onChange={(e) => handleNumberInput(e.target.value, setLocalFat)}
              />
            </div>
          </div>
        </div>
        <div className={`mt-4 sm:mt-8 flex gap-2 sm:gap-3 flex-col sm:flex-row justify-center`}>
          <button
            className={
              `flex-1 rounded-lg font-medium transition-all active:scale-95 cursor-pointer ` +
              (viewMode === 'database'
                ? 'px-2 py-2 text-base md:text-xs md:min-w-[80px] md:max-w-[120px] bg-[#5a5a5cff] text-white hover:bg-[#6a6a6cff]'
                : 'px-4 py-3 text-base bg-[#5a5a5cff] text-white hover:bg-[#6a6a6cff]')
            }
            onClick={() => {
              const err = validateIngredient();
              if (err) {
                setAlertMsg(err);
                setAlertType('error');
                return;
              }
              setAlertMsg(
                editMode ? 'Ingredient updated successfully!' : 'Ingredient added successfully!'
              );
              setAlertType('success');
              setTimeout(() => setAlertMsg(null), 1500);
              onAdd({
                name: localName,
                calories: localCalories,
                protein: localProtein,
                carbs: localCarbs,
                fat: localFat,
              });
            }}
          >
            {editMode ? 'Save Changes' : 'Add Ingredient'}
          </button>
          <button
            className={
              `flex-1 rounded-lg font-medium transition-all cursor-pointer ` +
              (viewMode === 'database'
                ? 'px-2 py-2 text-base md:text-xs md:min-w-[80px] md:max-w-[120px] border border-gray-300 text-gray-700 bg-gray-200 hover:bg-gray-50'
                : 'px-4 py-3 text-base border border-gray-300 text-gray-700 bg-gray-200 hover:bg-gray-50')
            }
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
