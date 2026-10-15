// backend/controllers/authController.js

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { HttpError } from '../utils/helpers.js';
import { getJwtSecret } from '../middleware/auth.js';

const DEFAULT_EMAIL = 'admin@bilafon.com';
const DEFAULT_PASSWORD = 'admin';
const SALT_ROUNDS = 10;
export const MIN_PASSWORD_LENGTH = 4;

const signToken = (user) =>
  jwt.sign({ id: String(user._id), email: user.email }, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });

export const ensureDefaultAdmin = async () => {
  if ((await User.countDocuments()) > 0) return false;
  try {
    await User.create({
      email: DEFAULT_EMAIL,
      password: await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS)
    });
    return true;
  } catch (err) {
    if (err.code === 11000) return false;
    throw err;
  }
};

export const login = async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');

  if (!email || !password) throw new HttpError(400, 'Email and password are required');

  await ensureDefaultAdmin();

  const user = await User.findOne({ email });
  const ok = user && (await bcrypt.compare(password, user.password));
  if (!ok) {
    throw new HttpError(401, 'Invalid email or password. Please check your details and try again.');
  }

  res.json({ token: signToken(user), user: user.toJSON() });
};

// PUT /api/auth/change-password
// Body: { currentPassword, newEmail, newPassword }
export const changePassword = async (req, res) => {
  const currentPassword = String(req.body?.currentPassword || '');
  const newPassword = String(req.body?.newPassword || '');
  const newEmail = String(req.body?.newEmail || '').trim().toLowerCase();

  if (!currentPassword) {
    throw new HttpError(400, 'Maujooda (Current) password dena zaroori hai.');
  }

  const user = await User.findById(req.user.id);
  if (!user) throw new HttpError(404, 'User account nahi mila');

  // Purana password verify karein
  if (!(await bcrypt.compare(currentPassword, user.password))) {
    throw new HttpError(400, 'Maujooda (Current) password galat hai');
  }

  // Agar naya Email diya gaya hai
  if (newEmail && newEmail !== user.email) {
    const existing = await User.findOne({ email: newEmail });
    if (existing) {
      throw new HttpError(400, 'Yeh Email pehle se kisi aur account me istemal ho raha hai');
    }
    user.email = newEmail;
  }

  // Agar naya Password diya gaya hai
  if (newPassword) {
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      throw new HttpError(400, `Naya password kam az kam ${MIN_PASSWORD_LENGTH} characters ka hona chahiye`);
    }
    if (currentPassword === newPassword) {
      throw new HttpError(400, 'Naya password purane password se mukhtalif hona chahiye');
    }
    user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
  }

  await user.save();

  res.json({ message: 'Credentials kamyabi se update ho gaye hain', user: user.toJSON() });
};

export const seedAdmin = async (req, res) => {
  if ((await User.countDocuments()) > 0) {
    return res.status(200).json({ message: 'Admin already exists. Nothing changed.' });
  }

  const email = String(req.body?.email || DEFAULT_EMAIL).trim().toLowerCase();
  const password = String(req.body?.password || DEFAULT_PASSWORD);

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ email, password: hashed });

  res.status(201).json({ message: 'Admin created', user: user.toJSON() });
};