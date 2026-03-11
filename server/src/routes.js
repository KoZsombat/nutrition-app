import express from 'express';
import { reqLimiter } from './config/rateLimiters.js';
import { verifyToken } from './middleware/verifyToken.js';
import profileRoutes from './routes/profileRoutes.js';
import foodRoutes from './routes/foodRoutes.js';
import ingredientRoutes from './routes/ingredientRoutes.js';
import mealRoutes from './routes/mealRoutes.js';
import eatenRoutes from './routes/eatenRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import productRoutes from './routes/productRoutes.js';

const router = express.Router();

router.use(reqLimiter);
router.use(verifyToken);

router.use(profileRoutes);
router.use(foodRoutes);
router.use(ingredientRoutes);
router.use(mealRoutes);
router.use(eatenRoutes);
router.use(historyRoutes);
router.use(productRoutes);

export default router;
