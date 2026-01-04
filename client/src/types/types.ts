export type CalEntry = {
  id: number;
  name: string;
  food: string[];
  grams: string[];
};

export type FoodEntry = {
  id: number;
  name: string;
  cal: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type EatenEntry = {
  name: string;
  grams: string;
};

export type EatenHistory = {
  name: string;
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};
