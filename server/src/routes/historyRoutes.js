import express from 'express';
import { body, validationResult } from 'express-validator';
import con from '../db.js';

const router = express.Router();

router.post(
  '/history',
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
    const sql =
      'INSERT INTO eaten_history (username, date, calories, protein, carbs, fat) VALUES (?, ?, ?, ?, ?, ?)';
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

router.get('/history', (req, res) => {
  const user = req.username;
  const sql =
    'SELECT * FROM eaten_history WHERE username = ? ORDER BY date DESC';
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

export default router;
