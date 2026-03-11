import express from 'express';
import { body, validationResult } from 'express-validator';
import con from '../db.js';

const router = express.Router();

router.get('/data', (req, res) => {
  const user = req.username;

  const sql2 = 'SELECT * FROM user WHERE username = ?';
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
    const sql = 'SELECT * FROM nut_values WHERE username = ?';
    con.query(sql, [user], (err2, nutritionResult) => {
      if (err2) {
        console.error('Data query error');
        return res.status(500).json({
          error:
            "Sorry, we couldn't load your nutrition data. Please try again later.",
        });
      }

      if (nutritionResult.length === 0) {
        return res.status(404).json({
          error: 'No nutrition data found. Please set up your profile.',
        });
      }

      return res.json({
        calories: nutritionResult[0].calories,
        protein: nutritionResult[0].protein,
        carbs: nutritionResult[0].carbs,
        fat: nutritionResult[0].fat,
        email,
        nationality,
      });
    });
  });
});

router.put(
  '/data',
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

    const updateNutrition = () =>
      new Promise((resolve, reject) => {
        const sql =
          'UPDATE nut_values SET calories = ?, protein = ?, carbs = ?, fat = ? WHERE username = ?';
        con.query(sql, [calories, protein, carbs, fat, user], (err) => {
          if (err)
            return reject(
              'Failed to update nutrition values. Please try again later.'
            );
          resolve();
        });
      });

    const updateEmail = () =>
      new Promise((resolve, reject) => {
        const sql2 =
          'UPDATE user SET email = ?, nationality = ? WHERE username = ?';
        con.query(sql2, [email, nationality, user], (err) => {
          if (err)
            return reject(
              'Failed to update email or nationality. Please try again later.'
            );
          resolve();
        });
      });

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

export default router;
