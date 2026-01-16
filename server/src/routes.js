import express from 'express';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import con from './db.js';
import { verifyToken } from './auth.js';

const router = express.Router();

const reqLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later',
});

router.use(reqLimiter);
router.use(verifyToken);

const sanitizeInput = (req, res, next) => {
  const { user } = req.body;
  if (user && user !== req.username) {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
};

router.use(sanitizeInput);

router.post('/getData', (req, res) => {
  const user = req.username;

  const sql2 = `SELECT * FROM user WHERE username = ?`;
  con.query(sql2, [user], (err, result) => {
    if (err) {
      console.error('Email query error');
      return res.status(500).json({
        error:
          "Sorry, we couldn't retrieve your account data. Please try again later.",
      });
    }

    if (result.length === 0) {
      return res.status(404).json({
        error: 'User not found. Please check your login details or register.',
      });
    }

    const email = result[0].email;
    const nationality = result[0].nationality;
    const sql = `SELECT * FROM nut_values WHERE username = ?`;
    con.query(sql, [user], (err, result) => {
      if (err) {
        console.error('Data query error');
        return res.status(500).json({
          error:
            "Sorry, we couldn't load your nutrition data. Please try again later.",
        });
      }

      if (result.length === 0) {
        return res.status(404).json({
          error: 'No nutrition data found. Please set up your profile.',
        });
      }

      return res.json({
        calories: result[0].calories,
        protein: result[0].protein,
        carbs: result[0].carbs,
        fat: result[0].fat,
        email: email,
        nationality: nationality,
      });
    });
  });
});

router.post(
  '/updateData',
  [
    body('email').isEmail().withMessage('Must be a valid email'),
    body('calories')
      .isFloat({ min: 0, max: 100000 })
      .withMessage('Calories must be between 0 and 100000'),
    body('protein')
      .isFloat({ min: 0, max: 100000 })
      .withMessage('Protein must be between 0 and 100000'),
    body('carbs')
      .isFloat({ min: 0, max: 100000 })
      .withMessage('Carbs must be between 0 and 100000'),
    body('fat')
      .isFloat({ min: 0, max: 100000 })
      .withMessage('Fat must be between 0 and 100000'),
    body('nationality').notEmpty().withMessage('Nationality is required'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: errors
          .array()
          .map((e) => e.msg)
          .join(' '),
      });
    }

    const user = req.username;
    const { email, nationality, calories, protein, carbs, fat } = req.body;

    const updateNutrition = () => {
      return new Promise((resolve, reject) => {
        const sql = `UPDATE nut_values SET calories = ?, protein = ?, carbs = ?, fat = ? WHERE username = ?`;
        con.query(sql, [calories, protein, carbs, fat, user], (err) => {
          if (err)
            return reject(
              'Failed to update nutrition values. Please try again later.'
            );
          resolve();
        });
      });
    };

    const updateEmail = () => {
      return new Promise((resolve, reject) => {
        const sql2 = `UPDATE user SET email = ?, nationality = ? WHERE username = ?`;
        con.query(sql2, [email, nationality, user], (err) => {
          if (err)
            return reject(
              'Failed to update email or nationality. Please try again later.'
            );
          resolve();
        });
      });
    };

    Promise.all([updateNutrition(), updateEmail()])
      .then(() => res.json({ success: true }))
      .catch((error) => {
        console.error('Update error');
        return res.status(500).json({
          error:
            typeof error === 'string'
              ? error
              : 'Sorry, something went wrong. Please try again.',
        });
      });
  }
);

router.post('/getFood', (req, res) => {
  const user = req.username;

  const getIngredients = () =>
    new Promise((resolve, reject) => {
      const sql = `SELECT * FROM food WHERE username = ?`;
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
      const sql2 = `SELECT * FROM meal WHERE username = ?`;
      con.query(sql2, [user], (err, mealRows) => {
        if (err)
          return reject('Could not load your meals. Please try again later.');
        const sql3 = `SELECT * FROM meal_food WHERE username = ?`;
        con.query(sql3, [user], (err, mealFoodRows) => {
          if (err)
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
      const sql = `SELECT meal, gram FROM eaten_meal WHERE username = ?`;
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

router.post(
  '/ingredientCreate',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('calories')
      .isFloat({ min: 0 })
      .withMessage('Calories must be a positive number'),
    body('protein')
      .isFloat({ min: 0 })
      .withMessage('Protein must be a positive number'),
    body('carbs')
      .isFloat({ min: 0 })
      .withMessage('Carbs must be a positive number'),
    body('fat')
      .isFloat({ min: 0 })
      .withMessage('Fat must be a positive number'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = req.username;
    const { name, calories, protein, carbs, fat } = req.body;

    const sql = `INSERT INTO food (username, name, calories, protein, carbs, fat) VALUES (?, ?, ?, ?, ?, ?)`;
    con.query(sql, [user, name, calories, protein, carbs, fat], (err) => {
      if (err) {
        console.error('Ingredient creation error');
        return res
          .status(500)
          .json({ error: 'Could not add ingredient. Please try again later.' });
      }
      return res.json({ success: true });
    });
  }
);

router.post(
  '/ingredientEdit',
  [
    body('id').isInt().withMessage('Id is required'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('calories')
      .isFloat({ min: 0 })
      .withMessage('Calories must be a positive number'),
    body('protein')
      .isFloat({ min: 0 })
      .withMessage('Protein must be a positive number'),
    body('carbs')
      .isFloat({ min: 0 })
      .withMessage('Carbs must be a positive number'),
    body('fat')
      .isFloat({ min: 0 })
      .withMessage('Fat must be a positive number'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = req.username;
    const { id, name, calories, protein, carbs, fat } = req.body;
    const sql = `UPDATE food SET name = ?, calories = ?, protein = ?, carbs = ?, fat = ? WHERE username = ? AND id = ?`;
    con.query(sql, [name, calories, protein, carbs, fat, user, id], (err) => {
      if (err) {
        console.error('Ingredient edit error');
        return res.status(500).json({
          error: 'Could not update ingredient. Please try again later.',
        });
      }
      return res.json({ success: true });
    });
  }
);

router.post(
  '/ingredientDelete',
  [body('id').isInt().withMessage('Id is required')],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = req.username;
    const { id } = req.body;

    const sql = `SELECT name FROM food WHERE username = ? AND id = ?`;
    con.query(sql, [user, id], (err, result) => {
      if (err || result.length === 0) {
        console.error('Ingredient fetch error');
        return res.status(500).json({
          error: 'Could not find ingredient. Please try again later.',
        });
      }
      const ingredientName = result[0].name;

      const sql2 = `SELECT id FROM meal_food WHERE food = ?`;
      con.query(sql2, [ingredientName], (err2, result2) => {
        if (err2) {
          console.error('Meal food fetch error');
          return res.status(500).json({
            error: 'Could not verify ingredient usage. Please try again later.',
          });
        }
        const mealIds = result2.map((r) => r.id);
        if (mealIds.length > 0) {
          const sql3 = `DELETE FROM meal WHERE username = ? AND id IN (?)`;
          con.query(sql3, [user, mealIds], (err3) => {
            if (err3) {
              console.error('Meal delete error');
              return res.status(500).json({
                error:
                  'Could not delete associated meals. Please try again later.',
              });
            }
            deleteIngredient();
          });
        } else {
          deleteIngredient();
        }
      });
    });

    function deleteIngredient() {
      const sql4 = `DELETE FROM food WHERE username = ? AND id = ?`;
      con.query(sql4, [user, id], (err) => {
        if (err) {
          console.error('Ingredient delete error');
          return res.status(500).json({
            error: 'Could not delete ingredient. Please try again later.',
          });
        }
        return res.json({ success: true });
      });
    }
  }
);

router.post(
  '/mealCreate',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('food').isArray().withMessage('Food must be an array'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = req.username;
    const { name, food } = req.body;

    const sqlMeal = `INSERT INTO meal (username, name) VALUES (?, ?)`;
    con.query(sqlMeal, [user, name], (err) => {
      if (err) {
        console.error('Meal creation error');
        return res
          .status(500)
          .json({ error: 'Could not create meal. Please try again later.' });
      }

      if (Array.isArray(food) && food.length > 0) {
        const values = food.map((f) => {
          const [foodName, grams] = f.split(':');
          return [user, name, foodName, grams ?? '0'];
        });
        const sqlFood = `INSERT INTO meal_food (username, meal, food, grams) VALUES ?`;
        con.query(sqlFood, [values], (err2) => {
          if (err2) {
            console.error('Meal food insert error');
            return res.status(500).json({
              error: 'Could not add foods to meal. Please try again later.',
            });
          }
          return res.json({ success: true });
        });
      } else {
        return res.json({ success: true });
      }
    });
  }
);

router.post(
  '/mealEdit',
  [
    body('id').isInt().withMessage('Id is required'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('food').isArray().withMessage('Food must be an array'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = req.username;
    const { id, name, food } = req.body;
    const sqlUpdate = `UPDATE meal SET name = ? WHERE username = ? AND id = ?`;
    con.query(sqlUpdate, [name, user, id], (err) => {
      if (err) {
        console.error('Meal edit error');
        return res
          .status(500)
          .json({ error: 'Could not update meal. Please try again later.' });
      }
      const sqlDelete = `DELETE FROM meal_food WHERE username = ? AND meal_id = ?`;
      con.query(sqlDelete, [user, id], (err2) => {
        if (err2) {
          console.error('Meal food delete error');
          return res.status(500).json({
            error: 'Could not update foods in meal. Please try again later.',
          });
        }
        if (Array.isArray(food) && food.length > 0) {
          const values = food.map((f) => {
            const [foodName, grams] = f.split(':');
            return [user, id, foodName, grams ?? '0'];
          });
          const sqlInsert = `INSERT INTO meal_food (username, meal_id, food, grams) VALUES ?`;
          con.query(sqlInsert, [values], (err3) => {
            if (err3) {
              console.error('Meal food insert error');
              return res.status(500).json({
                error: 'Could not add foods to meal. Please try again later.',
              });
            }
            return res.json({ success: true });
          });
        } else {
          return res.json({ success: true });
        }
      });
    });
  }
);

router.post(
  '/mealDelete',
  [body('id').isInt().withMessage('Id is required')],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = req.username;
    const { id } = req.body;
    const sqlMeal = `DELETE FROM meal WHERE username = ? AND id = ?`;
    con.query(sqlMeal, [user, id], (err) => {
      if (err) {
        console.error('Meal delete error');
        return res
          .status(500)
          .json({ error: 'Could not delete meal. Please try again later.' });
      }
      const sqlFood = `DELETE FROM meal_food WHERE username = ? AND meal_id = ?`;
      con.query(sqlFood, [user, id], (err2) => {
        if (err2) {
          console.error('Meal food delete error');
          return res.status(500).json({
            error: 'Could not delete foods from meal. Please try again later.',
          });
        }
        return res.json({ success: true });
      });
    });
  }
);

router.post(
  '/eatenAdd',
  [
    body('meal').trim().notEmpty().withMessage('Meal name is required'),
    body('gram')
      .isFloat({ min: 0 })
      .withMessage('Grams must be a positive number'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = req.username;
    const { meal, gram } = req.body;

    const sql = `INSERT INTO eaten_meal (username, meal, gram) VALUES (?, ?, ?)`;
    con.query(sql, [user, meal, gram], (err) => {
      if (err) {
        console.error('Eaten add error');
        return res
          .status(500)
          .json({ error: 'Could not add eaten meal. Please try again later.' });
      }
      return res.json({ success: true });
    });
  }
);

router.post('/deleteEaten', (req, res) => {
  const user = req.username;
  const { meal } = req.body;

  const sql = `DELETE FROM eaten_meal WHERE username = ? AND meal = ?`;
  con.query(sql, [user, meal], (err) => {
    if (err) {
      console.error('Clear eaten error');
      return res.status(500).json({
        error: 'Could not delete eaten meal. Please try again later.',
      });
    }
    return res.json({ success: true });
  });
});

router.post('/clearEaten', (req, res) => {
  const user = req.username;

  const sql = `DELETE FROM eaten_meal WHERE username = ?`;
  con.query(sql, [user], (err) => {
    if (err) {
      console.error('Clear eaten error');
      return res.status(500).json({
        error: 'Could not clear eaten meals. Please try again later.',
      });
    }
    return res.json({ success: true });
  });
});

router.post(
  '/HistoryAdd',
  [
    body('calories')
      .isFloat({ min: 0 })
      .withMessage('Calories must be a positive number'),
    body('protein')
      .isFloat({ min: 0 })
      .withMessage('Protein must be a positive number'),
    body('carbs')
      .isFloat({ min: 0 })
      .withMessage('Carbs must be a positive number'),
    body('fat')
      .isFloat({ min: 0 })
      .withMessage('Fat must be a positive number'),
    body('date').isISO8601().withMessage('Date must be a valid ISO 8601 date'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const user = req.username;
    const { calories, protein, carbs, fat, date } = req.body;
    const sql = `INSERT INTO eaten_history (username, date, calories, protein, carbs, fat) VALUES (?, ?, ?, ?, ?, ?)`;
    con.query(sql, [user, date, calories, protein, carbs, fat], (err) => {
      if (err) {
        console.error('History add error');
        return res
          .status(500)
          .json({ error: 'Could not save history. Please try again later.' });
      }
      return res.json({ success: true });
    });
  }
);

router.post('/HistoryGet', (req, res) => {
  const user = req.username;
  const sql = `SELECT * FROM eaten_history WHERE username = ? ORDER BY date DESC`;
  con.query(sql, [user], (err, result) => {
    if (err) {
      console.error('History get error');
      return res
        .status(500)
        .json({ error: 'Could not load history. Please try again later.' });
    }
    const history = result.map((r) => ({
      date: r.date,
      calories: r.calories,
      protein: r.protein,
      carbs: r.carbs,
      fat: r.fat,
    }));
    return res.json({ history });
  });
});

router.post(
  '/ProductSearch',
  [body('query').trim().notEmpty().withMessage('Search query is required')],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { query } = req.body;
    const sql = `SELECT * FROM products WHERE name LIKE ? LIMIT 50; `;
    con.query(sql, [`%${query}%`], (err, result) => {
      if (err) {
        console.error('Product search error');
        return res.status(500).json({
          error: 'Could not search products. Please try again later.',
        });
      }
      const products = result.map((p) => ({
        name: p.name,
        calories: p.calories,
        protein: p.protein,
        carbs: p.carbs,
        fat: p.fat,
      }));
      return res.json({ products });
    });
  }
);

router.post(
  '/ProductBarcodeSearch',
  [body('query').trim().notEmpty().withMessage('Search query is required')],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { query } = req.body;
    const sql = `SELECT * FROM products WHERE barcode = ? LIMIT 1; `;
    con.query(sql, [query], (err, result) => {
      if (err) {
        console.error('Product search error');
        return res.status(500).json({
          error: 'Could not search products. Please try again later.',
        });
      }
      const products = result.map((p) => ({
        name: p.name,
        calories: p.calories,
        protein: p.protein,
        carbs: p.carbs,
        fat: p.fat,
      }));
      return res.json({ products });
    });
  }
);

export default router;
