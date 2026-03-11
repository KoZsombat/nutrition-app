import express from 'express';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import con from './db.js';
import { verifyToken } from './middleware/verifyToken.js';
dotenv.config();

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 30 * 1000, // 30 seconds
  max: 5, // 5 login attempts
  message: 'Too many login attempts, please try again later',
});

const registerLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 registration attempts
  message: 'Too many registration attempts, please try again later',
});

router.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

router.use(passport.initialize());
router.use(passport.session());

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const [rows] = await con
          .promise()
          .query('SELECT * FROM user WHERE google_id = ?', [profile.id]);
        let user;
        if (rows.length > 0) {
          user = rows[0];
        } else {
          const [result] = await con.promise().query(
            'INSERT INTO user (username, email, nationality, password, google_id) VALUES (?, ?, ?, ?, ?)',

            [
              profile.displayName,
              profile.emails?.[0]?.value || '',
              'United States',
              null,
              profile.id,
            ]
          );
          user = {
            id: result.insertId,
            google_id: profile.id,
            email: profile.emails?.[0]?.value,
            username: profile.displayName,
          };
        }
        await con
          .promise()
          .query(
            'INSERT IGNORE INTO nut_values (username, calories, protein, carbs, fat) VALUES (?, ?, ?, ?, ?)',
            [user.username, 2000, 100, 300, 70]
          );
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const [rows] = await con
      .promise()
      .query('SELECT * FROM user WHERE id = ?', [id]);
    done(null, rows[0]);
  } catch (err) {
    done(err, null);
  }
});

// Routes
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL}/`,
  }),
  async (req, res) => {
    try {
      const [results] = await con
        .promise()
        .query('SELECT * FROM user WHERE google_id = ?', [req.user.google_id]);
      if (!results || results.length === 0) {
        return res.redirect(`${process.env.FRONTEND_URL}/`);
      }
      const user = results[0];
      const token = generateToken(user);
      res.redirect(`${process.env.FRONTEND_URL}/?token=${token}`);
    } catch (err) {
      console.error('Google auth query error:', err);
      return res.redirect(`${process.env.FRONTEND_URL}/`);
    }
  }
);

router.get('/logout', (req, res) => {
  req.logout(() => res.redirect(`${process.env.FRONTEND_URL}/`));
});

const saltRounds = 10;

const hashPassword = async (password) => {
  return await bcrypt.hash(password, saltRounds);
};

const checkPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

const generateToken = (user) => {
  return jwt.sign(
    { userId: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

router.post(
  '/register',
  registerLimiter,
  [
    body('name')
      .isLength({ min: 3 })
      .withMessage('Username must be at least 3 characters'),
    body('email').isEmail().withMessage('Must be a valid email'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ response: -1, errors: errors.array() });
    }

    const { name, email, password } = req.body;
    const nationality = 'United States';

    try {
      const hashedPassword = await hashPassword(password);

      const sql1 = `SELECT * FROM user WHERE username = ? OR email = ?`;
      con.query(sql1, [name, email], async (err, result) => {
        if (err) {
          console.error('Register query error:', err);
          return res.status(500).json({
            response: -1,
            message: 'Username or email already in use',
          });
        }

        if (result.length > 0) {
          return res.json({ response: 0 });
        }

        const sql2 = `INSERT INTO user (username, email, nationality, password, google_id) VALUES (?, ?, ?, ?, ?)`;
        con.query(
          sql2,
          [name, email, nationality, hashedPassword, null],
          (err, result) => {
            if (err) {
              console.error('User creation error:', err);
              return res
                .status(500)
                .json({ response: -1, message: 'Server error' });
            }

            const userId = result.insertId;

            const sql3 = `INSERT INTO nut_values (username, calories, protein, carbs, fat) VALUES (?, ?, ?, ?, ?)`;
            con.query(sql3, [name, 2000, 100, 300, 70], (err) => {
              if (err) {
                console.error('Nutrition values creation error:', err);
                return res
                  .status(500)
                  .json({ response: -1, message: 'Server error' });
              }

              const token = generateToken({ id: userId, username: name });
              return res.json({ response: 1, token });
            });
          }
        );
      });
    } catch (error) {
      console.error('Password hashing error:', error);
      return res.status(500).json({ response: -1, message: 'Server error' });
    }
  }
);

router.post('/login', loginLimiter, async (req, res) => {
  const { name, password } = req.body;

  if (!name || !password) {
    return res
      .status(400)
      .json({ response: 0, message: 'Missing credentials' });
  }

  const sql = `SELECT * FROM user WHERE BINARY username = ?`;
  con.query(sql, [name], async (err, result) => {
    if (err) {
      console.error('Login query error:', err);
      return res.status(500).json({ response: 0, message: 'Server error' });
    }

    if (result.length === 0) {
      return res.json({ response: 0 });
    }

    const user = result[0];
    const isValid = await checkPassword(password, user.password);

    if (isValid) {
      const token = generateToken({ id: user.id, username: user.username });
      return res.json({ response: 1, token });
    } else {
      return res.json({ response: 0 });
    }
  });
});

router.post('/verifyToken', verifyToken, (req, res) => {
  res.json({ userId: req.id, username: req.username });
});

router.post('/userInDb', verifyToken, (req, res) => {
  // User already verified by verifyToken middleware
  // If we reach here, user exists and token is valid
  return res.json({ exists: true });
});

export default router;
