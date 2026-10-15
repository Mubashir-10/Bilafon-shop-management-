import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    console.error('JWT_SECRET must be set in production. Aborting.');
    process.exit(1);
  }
  process.env.JWT_SECRET = crypto.randomBytes(32).toString('hex');
  console.warn('[warn] JWT_SECRET not set: using a temporary one (logins reset on restart). See backend/.env.example');
}

// App is imported AFTER env is ready (it reads env at import time).
const { default: app } = await import('./app.js');

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bilafon';

try {
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
  console.log(`MongoDB connected: ${MONGO_URI}`);
} catch (err) {
  console.error(`Could not connect to MongoDB at ${MONGO_URI}\n  -> ${err.message}\n  Is MongoDB running? (see README step 1)`);
  process.exit(1);
}

const { ensureDefaultAdmin } = await import('./controllers/authController.js');
if (await ensureDefaultAdmin()) {
  console.log('No user found -> default admin created: admin@bilafon.com / admin (change it in Settings)');
}

app.listen(PORT, () => console.log(`Bilafon API running on http://localhost:${PORT}/api`));
