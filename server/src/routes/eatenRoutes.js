import express from 'express';
import { body, validationResult } from 'express-validator';
import con from '../db.js';

const router = express.Router();

router.post(
  '/eaten',
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

    const sql =
      'INSERT INTO eaten_meal (username, meal, gram) VALUES (?, ?, ?)';
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

router.delete('/eaten', (req, res) => {
  const user = req.username;
  const { meal } = req.body;

  const sql = 'DELETE FROM eaten_meal WHERE username = ? AND meal = ?';
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

router.delete('/eaten/all', (req, res) => {
  const user = req.username;

  const sql = 'DELETE FROM eaten_meal WHERE username = ?';
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

export default router;
