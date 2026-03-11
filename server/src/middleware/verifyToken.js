import jwt from 'jsonwebtoken';
import con from '../db.js';
import { env } from '../config/env.js';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No bearer token provided' });
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const userId = decoded.userId;
    const username = decoded.username;

    const sql = 'SELECT * FROM user WHERE id = ? AND username = ?';
    con.query(sql, [userId, username], (err, result) => {
      if (err) {
        console.error('User verification error:', err);
        return res
          .status(500)
          .json({ error: 'Database error during authentication' });
      }

      if (result.length === 0) {
        return res
          .status(401)
          .json({ error: 'User not found or invalid token' });
      }

      req.id = userId;
      req.username = username;
      req.authUser = { id: userId, username };
      next();
    });
  } catch (error) {
    return res
      .status(401)
      .json({ error: 'Invalid token', details: error.message });
  }
};
