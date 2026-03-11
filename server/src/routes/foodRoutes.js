import express from 'express';
import con from '../db.js';

const router = express.Router();

router.get('/food', (req, res) => {
  const user = req.username;

  const getIngredients = () =>
    new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM food WHERE username = ?';
      con.query(sql, [user], (err, result) => {
        if (err)
          return reject(
            'Could not load your ingredients. Please try again later.'
          );
        const foods = result.map((f) => ({
          id: f.id,
          name: f.name,
          cal: f.calories,
          protein: f.protein,
          carbs: f.carbs,
          fat: f.fat,
        }));
        resolve(foods);
      });
    });

  const getMeals = () =>
    new Promise((resolve, reject) => {
      const sql2 = 'SELECT * FROM meal WHERE username = ?';
      con.query(sql2, [user], (err, mealRows) => {
        if (err)
          return reject('Could not load your meals. Please try again later.');
        const sql3 = 'SELECT * FROM meal_food WHERE username = ?';
        con.query(sql3, [user], (err2, mealFoodRows) => {
          if (err2)
            return reject(
              'Could not load foods for your meals. Please try again later.'
            );
          const meals = mealRows.map((meal) => ({
            id: meal.id,
            name: meal.name,
            food: mealFoodRows
              .filter((mf) => mf.meal === meal.name)
              .map((mf) => mf.food),
            grams: mealFoodRows
              .filter((mf) => mf.meal === meal.name)
              .map((mf) => mf.grams),
          }));
          resolve(meals);
        });
      });
    });

  const getEaten = () =>
    new Promise((resolve, reject) => {
      const sql = 'SELECT meal, gram FROM eaten_meal WHERE username = ?';
      con.query(sql, [user], (err, result) => {
        if (err)
          return reject(
            'Could not load your eaten meals. Please try again later.'
          );
        const eaten = result.map((r) => ({
          name: r.meal,
          grams: r.gram,
        }));
        resolve(eaten);
      });
    });

  Promise.all([getIngredients(), getMeals(), getEaten()])
    .then(([ingredients, meals, eaten]) => {
      return res.json({ ingredients, meals, eaten });
    })
    .catch((error) => {
      console.error('Get food error');
      return res.status(500).json({
        error:
          typeof error === 'string'
            ? error
            : 'Sorry, something went wrong. Please try again.',
      });
    });
});

export default router;
