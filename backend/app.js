import express from 'express';
import cors from 'cors';
import protect from './middleware/auth.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import expenseRoutes from './routes/expenses.js';
import saleRoutes from './routes/sales.js';
import dashboardRoutes from './routes/dashboard.js';
import purchaseRoutes from './routes/purchases.js';

const app = express();

const origins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',').map((s) => s.trim()).filter(Boolean);

app.use(cors({ origin: origins, methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);                       // public
app.use('/api/products', protect, productRoutes);       // everything below needs a JWT
app.use('/api/categories', protect, categoryRoutes);
app.use('/api/expenses', protect, expenseRoutes);
app.use('/api/sales', protect, saleRoutes);
app.use('/api/dashboard', protect, dashboardRoutes);
app.use('/api/purchases', protect, purchaseRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
