import express from 'express';
import { body, validationResult } from 'express-validator';
import con from '../db.js';

const router = express.Router();

router.post(
  '/ingredient',
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

    const sql =
      'INSERT INTO food (username, name, calories, protein, carbs, fat) VALUES (?, ?, ?, ?, ?, ?)';
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

router.put(
  '/ingredient',
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
    const sql =
      'UPDATE food SET name = ?, calories = ?, protein = ?, carbs = ?, fat = ? WHERE username = ? AND id = ?';
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

router.delete(
  '/ingredient',
  [body('id').isInt().withMessage('Id is required')],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = req.username;
    const { id } = req.body;

    const sql = 'SELECT name FROM food WHERE username = ? AND id = ?';
    con.query(sql, [user, id], (err, result) => {
      if (err || result.length === 0) {
        console.error('Ingredient fetch error');
        return res.status(500).json({
          error: 'Could not find ingredient. Please try again later.',
        });
      }
      const ingredientName = result[0].name;

      const sql2 = 'SELECT id FROM meal_food WHERE food = ?';
      con.query(sql2, [ingredientName], (err2, result2) => {
        if (err2) {
          console.error('Meal food fetch error');
          return res.status(500).json({
            error: 'Could not verify ingredient usage. Please try again later.',
          });
        }
        const mealIds = result2.map((r) => r.id);
        if (mealIds.length > 0) {
          const sql3 = 'DELETE FROM meal WHERE username = ? AND id IN (?)';
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
      const sql4 = 'DELETE FROM food WHERE username = ? AND id = ?';
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

export default router;
