import Header from '../components/Header';
import SettingsModal from '../components/SettingsModal';
import StatsDisplay from '../components/StatsDisplay';
import TodaysCuisine from '../components/TodaysCuisine';
import AppendFoodModal from '../components/AppendFoodModal';
import AddFoodModal from '../components/AddFoodModal';
import AddIngredientModal from '../components/AddIngredientModal';
import AddMealModal from '../components/AddMealModal';
import Navbar from '../components/Navbar';
import History from '../components/HistoryModal';
import type { CalEntry, FoodEntry, EatenEntry, EatenHistory } from '../types/types';
import { useState, useEffect, useCallback } from 'react';

export default function App({ onLogout }: { onLogout: () => void }) {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [username, setUsername] = useState<string>('');

  const [visibleTabs, setVisibleTabs] = useState<{ [key: string]: boolean }>({
    appendFood: false,
    settingsTab: false,
    addFood: false,
    addIngredient: false,
    addMeal: false,
    historyTab: false,
  });

  const toggleTab = (tab: string) => () => {
    setVisibleTabs((prev) => ({ ...prev, [tab]: !prev[tab] }));
  };

  const activeTab = Object.keys(visibleTabs).find((key) => visibleTabs[key]);

  // Settings state
  const [email, setEmail] = useState('');
  const [calorieMax, setMaxCalories] = useState('0');
  const [proteinMax, setMaxProtein] = useState('0');
  const [carbsMax, setMaxCarbs] = useState('0');
  const [fatMax, setMaxFat] = useState('0');
  const [userNationality, setUserNationality] = useState('');
  // Stats state
  const [calories, setCalories] = useState(0);
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fat, setFat] = useState(0);

  // Food data
  const [cals, setCals] = useState<CalEntry[]>([]);
  const [food, setFood] = useState<FoodEntry[]>([]);
  const [Eaten, setEaten] = useState<EatenEntry[]>([]);
  const [eatenHistory, setEatenHistory] = useState<EatenHistory[]>([]);

  // Ingredient state
  const [ingredientName, setIngredientName] = useState('name');
  const [ingredientCalories, setIngredientCalories] = useState('0');
  const [ingredientProtein, setIngredientProtein] = useState('0');
  const [ingredientCarbs, setIngredientCarbs] = useState('0');
  const [ingredientFat, setIngredientFat] = useState('0');
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState<string | number | null>(null);

  // Meal state
  const [mealName, setMealName] = useState('');
  const [activeItem, setActiveItem] = useState('');
  const [mealGrams, setMealGrams] = useState('0');
  const [selectedIngredients, setSelectedIngredients] = useState<{ name: string; grams: string }[]>(
    []
  );
  const [editMealOldName, setEditMealOldName] = useState<string | null>(null);
  const [editMealMode, setEditMealMode] = useState(false);
  const [editMealName, setEditMealName] = useState('');
  const [editMealIngredients, setEditMealIngredients] = useState<{ name: string; grams: string }[]>(
    []
  );

  const Start = async () => {
    try {
      const userData = localStorage.getItem('token');

      const response = await fetch(`${apiUrl}/auth/verifyToken`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userData}`,
        },
        body: JSON.stringify({
          token: userData,
        }),
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        onLogout();
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setUsername(data.username);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const Load = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/getData`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user: username }),
      });
      if (response.status === 401) {
        localStorage.removeItem('token');
        onLogout();
        return;
      }
      const data = await response.json();
      setEmail(data.email);
      setMaxCalories(String(data.calories));
      setMaxProtein(String(data.protein));
      setMaxCarbs(String(data.carbs));
      setMaxFat(String(data.fat));
      setUserNationality(data.nationality);
    } catch (e) {
      console.error('Failed to fetch user data', e);
    }
  }, [apiUrl, username, onLogout]);

  const Update = async (next: {
    email: string;
    calorieMax: string;
    proteinMax: string;
    carbsMax: string;
    fatMax: string;
    nationality: string;
  }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/updateData`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user: username,
          email: next.email,
          calories: parseFloat(next.calorieMax),
          protein: parseFloat(next.proteinMax),
          carbs: parseFloat(next.carbsMax),
          fat: parseFloat(next.fatMax),
          nationality: next.nationality,
        }),
      });
      if (response.status === 401) {
        localStorage.removeItem('token');
        onLogout();
        return;
      }
      if (!response.ok) {
        const error = await response.json();
        console.error('Update failed:', error);
        return;
      }
      const result = await response.json();
      if (result.success) {
        setEmail(next.email);
        setMaxCalories(next.calorieMax);
        setMaxProtein(next.proteinMax);
        setMaxCarbs(next.carbsMax);
        setMaxFat(next.fatMax);
        setUserNationality(next.nationality);
      }
    } catch (e) {
      console.error('Failed to update user data', e);
    }
  };

  const LoadFood = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/getFood`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user: username }),
      });
      if (response.status === 401) {
        localStorage.removeItem('token');
        onLogout();
        return;
      }
      const data = await response.json();
      setFood(data.ingredients);
      setCals(data.meals);
      setEaten(data.eaten);

      try {
        const historyResponse = await fetch(`${apiUrl}/api/HistoryGet`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ user: username }),
        });
        if (historyResponse.status === 401) {
          localStorage.removeItem('token');
          onLogout();
          return;
        }
        const historyData = await historyResponse.json();
        setEatenHistory(historyData.history);
      } catch (e) {
        console.error('Failed to fetch history data', e);
      }
    } catch (e) {
      console.error('Failed to fetch food data', e);
    }
  }, [apiUrl, username, onLogout]);

  const AddIngredient = async (ingredient: {
    name: string;
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
  }) => {
    const isValidNumber = (value: string) => /^[0-9]*\.?[0-9]+$/.test(value.trim());

    if (
      ingredient.name &&
      isValidNumber(ingredient.calories) &&
      isValidNumber(ingredient.protein) &&
      isValidNumber(ingredient.carbs) &&
      isValidNumber(ingredient.fat)
    ) {
      try {
        const token = localStorage.getItem('token');
        await fetch(`${apiUrl}/api/ingredientCreate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user: username,
            name: ingredient.name,
            calories: parseFloat(ingredient.calories),
            protein: parseFloat(ingredient.protein),
            carbs: parseFloat(ingredient.carbs),
            fat: parseFloat(ingredient.fat),
          }),
        });
        setIngredientName('name');
        setIngredientCalories('0');
        setIngredientProtein('0');
        setIngredientCarbs('0');
        setIngredientFat('0');
        LoadFood();
      } catch (e) {
        console.error('Failed to add ingredient', e);
      }
    }
  };

  const handleEditIngredient = (id: number) => {
    const selected = food.find((f) => f.id === id);
    if (selected) {
      setEditMode(true);
      setEditName(id);
      setIngredientName(selected.name);
      setIngredientCalories(String(selected.cal));
      setIngredientProtein(String(selected.protein));
      setIngredientCarbs(String(selected.carbs));
      setIngredientFat(String(selected.fat));
      setVisibleTabs((prev) => ({ ...prev, addFood: false, addIngredient: true }));
    }
  };

  const EditIngerdient = async (
    id: number,
    ingredient: { name: string; calories: string; protein: string; carbs: string; fat: string }
  ) => {
    const isValidNumber = (value: string) => /^[0-9]*\.?[0-9]+$/.test(value.trim());

    if (
      ingredient.name &&
      isValidNumber(ingredient.calories) &&
      isValidNumber(ingredient.protein) &&
      isValidNumber(ingredient.carbs) &&
      isValidNumber(ingredient.fat)
    ) {
      try {
        const token = localStorage.getItem('token');
        await fetch(`${apiUrl}/api/ingredientEdit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user: username,
            id,
            name: ingredient.name,
            calories: parseFloat(ingredient.calories),
            protein: parseFloat(ingredient.protein),
            carbs: parseFloat(ingredient.carbs),
            fat: parseFloat(ingredient.fat),
          }),
        });
        setIngredientName('name');
        setIngredientCalories('0');
        setIngredientProtein('0');
        setIngredientCarbs('0');
        setIngredientFat('0');
        LoadFood();
      } catch (e) {
        console.error('Failed to edit ingredient', e);
      }
    }
  };

  const DeleteIngerdient = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${apiUrl}/api/ingredientDelete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user: username, id }),
      });
      LoadFood();
    } catch (e) {
      console.error('Failed to delete ingredient', e);
    }
  };

  const handleMealAddOrEdit = async (
    name: string,
    ingredients: { name: string; grams: string }[]
  ) => {
    const filtered = ingredients.filter((i) => parseFloat(i.grams) > 0);
    if (editMealMode && editMealOldName !== null) {
      const mealId =
        typeof editMealOldName === 'string' ? parseInt(editMealOldName, 10) : editMealOldName;
      await EditMeal(
        mealId,
        name,
        filtered.map((i) => `${i.name}:${i.grams}`)
      );
    } else {
      await AddMeal(
        name,
        filtered.map((i) => `${i.name}:${i.grams}`)
      );
    }
    setMealName('');
    setSelectedIngredients([]);
    setEditMealMode(false);
    setEditMealOldName(null);
    setEditMealName('');
    setEditMealIngredients([]);
    toggleTab('addMeal')();
  };

  const handleAddIngredientModalClose = () => {
    toggleTab('addIngredient')();
    setEditMode(false);
    setEditName(null);
  };

  const handleAddIngredientModalAdd = (ingredient: {
    name: string;
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
  }) => {
    if (editMode && editName !== null) {
      const id = typeof editName === 'string' ? parseInt(editName, 10) : editName;
      EditIngerdient(id, ingredient);
      setEditMode(false);
      setEditName(null);
    } else {
      AddIngredient(ingredient);
    }
    toggleTab('addIngredient')();
  };

  const handleAddMealModalClose = () => {
    toggleTab('addMeal')();
    setEditMealMode(false);
    setEditMealOldName(null);
    setEditMealName('');
    setEditMealIngredients([]);
  };

  const handleAddFoodModalOpenMeal = () => {
    toggleTab('addMeal')();
    setEditMealMode(false);
    setMealName('');
    setSelectedIngredients([]);
  };

  const handleAddFoodModalEditMeal = (meal: CalEntry) => {
    setEditMealOldName(meal.id.toString());
    setEditMealName(meal.name);
    setEditMealIngredients(
      meal.food.map((name, index) => ({ name, grams: meal.grams[index] ?? '' }))
    );
    setEditMealMode(true);
    setVisibleTabs((prev) => ({ ...prev, addFood: false, addMeal: true }));
  };

  const AddMeal = async (mealName: string, foodList: string[]) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${apiUrl}/api/mealCreate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user: username, name: mealName, food: foodList }),
      });
      LoadFood();
    } catch (e) {
      console.error('Failed to add meal', e);
    }
  };

  const EditMeal = async (id: number, newName: string, foodList: string[]) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${apiUrl}/api/mealEdit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user: username, id, name: newName, food: foodList }),
      });
      LoadFood();
    } catch (e) {
      console.error('Failed to edit meal', e);
    }
  };

  const DeleteMeal = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${apiUrl}/api/mealDelete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user: username, id }),
      });
      LoadFood();
    } catch (e) {
      console.error('Failed to delete meal', e);
    }
  };

  const AddEaten = async (mealName: string) => {
    try {
      if (mealGrams === '0' || mealName === '') return;
      const token = localStorage.getItem('token');
      await fetch(`${apiUrl}/api/eatenAdd`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user: username, meal: mealName, gram: mealGrams }),
      });
      setMealGrams('100');
      LoadFood();
      toggleTab('appendFood')();
    } catch (e) {
      console.error('Failed to add eaten meal', e);
    }
  };

  const handleDeleteEaten = async (name: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${apiUrl}/api/deleteEaten`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user: username, meal: name }),
      });
      LoadFood();
    } catch (e) {
      console.error('Failed to delete eaten meal', e);
    }
  };

  const Clear = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${apiUrl}/api/clearEaten`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user: username }),
      });
      await fetch(`${apiUrl}/api/HistoryAdd`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user: username,
          calories,
          protein,
          carbs,
          fat,
          date: new Date().toISOString(),
        }),
      });
      LoadFood();
      setCalories(0);
      setProtein(0);
      setCarbs(0);
      setFat(0);
    } catch (e) {
      console.error('Failed to clear eaten', e);
    }
  };

  const openExclusiveTab = (tab: string) => () => {
    setVisibleTabs((prev) => {
      const newTabs = Object.fromEntries(Object.keys(prev).map((k) => [k, false]));
      newTabs[tab] = !prev[tab];
      return newTabs;
    });
  };

  useEffect(() => {
    Start();
  }, [Start]);

  useEffect(() => {
    if (username) {
      Load();
      LoadFood();
    }
  }, [Load, LoadFood, username]);

  useEffect(() => {
    if (!Eaten || !food || !cals) return;

    let totalCals = 0,
      totalProtein = 0,
      totalCarbs = 0,
      totalFat = 0;

    Eaten.forEach((e) => {
      const meal = cals.find((c) => c.name === e.name);
      if (!meal) return;

      meal.food.forEach((item) => {
        const foodItem = food.find((f) => f.name === item);
        if (foodItem) {
          const factor = parseFloat(e.grams) / 100;
          totalCals += foodItem.cal * factor;
          totalProtein += foodItem.protein * factor;
          totalCarbs += foodItem.carbs * factor;
          totalFat += foodItem.fat * factor;
        }
      });
    });

    setCalories(parseFloat(totalCals.toFixed(2)));
    setProtein(parseFloat(totalProtein.toFixed(2)));
    setCarbs(parseFloat(totalCarbs.toFixed(2)));
    setFat(parseFloat(totalFat.toFixed(2)));
  }, [Eaten, food, cals]);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden pb-[10vh]">
      <Header onOpenSettings={toggleTab('settingsTab')} onLogout={onLogout} />
      <SettingsModal
        visible={visibleTabs['settingsTab']}
        onClose={toggleTab('settingsTab')}
        email={email}
        calorieMax={calorieMax}
        proteinMax={proteinMax}
        carbsMax={carbsMax}
        fatMax={fatMax}
        nationality={userNationality}
        onUpdate={Update}
      />
      <StatsDisplay
        calories={calories}
        protein={protein}
        carbs={carbs}
        fat={fat}
        calorieMax={calorieMax}
        proteinMax={proteinMax}
        carbsMax={carbsMax}
        fatMax={fatMax}
      />
      <TodaysCuisine
        eaten={Eaten}
        cals={cals}
        food={food}
        Clear={Clear}
        onOpenAppend={toggleTab('appendFood')}
        onDeleteEaten={handleDeleteEaten}
      />
      <AppendFoodModal
        visible={visibleTabs['appendFood']}
        onClose={toggleTab('appendFood')}
        cals={cals}
        mealGrams={mealGrams}
        setMealGrams={setMealGrams}
        activeItem={activeItem}
        setActiveItem={setActiveItem}
        onAddEaten={AddEaten}
      />
      <AddFoodModal
        visible={visibleTabs['addFood']}
        onClose={toggleTab('addFood')}
        food={food}
        cals={cals}
        onOpenIngredient={toggleTab('addIngredient')}
        onOpenMeal={handleAddFoodModalOpenMeal}
        onEditIngredient={handleEditIngredient}
        onDeleteIngredient={DeleteIngerdient}
        onEditMeal={handleAddFoodModalEditMeal}
        onDeleteMeal={DeleteMeal}
      />
      <AddIngredientModal
        visible={visibleTabs['addIngredient']}
        onClose={handleAddIngredientModalClose}
        name={ingredientName}
        calories={ingredientCalories}
        protein={ingredientProtein}
        carbs={ingredientCarbs}
        fat={ingredientFat}
        nationality={userNationality}
        onAdd={handleAddIngredientModalAdd}
        editMode={editMode}
        apiUrl={apiUrl}
        token={localStorage.getItem('token') || ''}
      />
      <AddMealModal
        visible={visibleTabs['addMeal']}
        onClose={handleAddMealModalClose}
        food={food}
        editMode={editMealMode}
        initialMealName={editMealMode ? editMealName : mealName}
        initialIngredients={editMealMode ? editMealIngredients : selectedIngredients}
        onAdd={handleMealAddOrEdit}
      />
      <History
        visible={visibleTabs['historyTab']}
        onClose={toggleTab('historyTab')}
        eatenData={eatenHistory}
        calorieMax={calorieMax}
        proteinMax={proteinMax}
        carbsMax={carbsMax}
        fatMax={fatMax}
      />
      <Navbar
        onHistory={openExclusiveTab('historyTab')}
        onHome={toggleTab(activeTab ?? '')}
        onOpenManage={openExclusiveTab('addFood')}
      />
    </div>
  );
}
