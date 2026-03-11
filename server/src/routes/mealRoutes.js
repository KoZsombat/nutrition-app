import express from 'express';
import { body, validationResult } from 'express-validator';
import con from '../db.js';

const router = express.Router();

router.post(
  '/meal',
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

    const sqlMeal = 'INSERT INTO meal (username, name) VALUES (?, ?)';
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
        const sqlFood =
          'INSERT INTO meal_food (username, meal, food, grams) VALUES ?';
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

router.put(
  '/meal',
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
    const sqlUpdate = 'UPDATE meal SET name = ? WHERE username = ? AND id = ?';
    con.query(sqlUpdate, [name, user, id], (err) => {
      if (err) {
        console.error('Meal edit error');
        return res
          .status(500)
          .json({ error: 'Could not update meal. Please try again later.' });
      }
      const sqlDelete =
        'DELETE FROM meal_food WHERE username = ? AND meal_id = ?';
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
          const sqlInsert =
            'INSERT INTO meal_food (username, meal_id, food, grams) VALUES ?';
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

router.delete(
  '/meal',
  [body('id').isInt().withMessage('Id is required')],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = req.username;
    const { id } = req.body;
    const sqlMeal = 'DELETE FROM meal WHERE username = ? AND id = ?';
    con.query(sqlMeal, [user, id], (err) => {
      if (err) {
        console.error('Meal delete error');
        return res
          .status(500)
          .json({ error: 'Could not delete meal. Please try again later.' });
      }
      const sqlFood =
        'DELETE FROM meal_food WHERE username = ? AND meal_id = ?';
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

export default router;
