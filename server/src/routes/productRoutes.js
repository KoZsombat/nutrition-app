import express from 'express';
import { body, validationResult } from 'express-validator';
import con from '../db.js';

const router = express.Router();

router.post(
  '/product/search',
  [body('query').trim().notEmpty().withMessage('Search query is required')],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { query } = req.body;
    const sql = 'SELECT * FROM products WHERE name LIKE ? LIMIT 50';
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
  '/product/barcode',
  [body('query').trim().notEmpty().withMessage('Search query is required')],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { query } = req.body;
    const sql = 'SELECT * FROM products WHERE barcode = ? LIMIT 1';
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
