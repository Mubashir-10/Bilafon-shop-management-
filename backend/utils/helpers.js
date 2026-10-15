import mongoose from 'mongoose';

// Wraps async route handlers so thrown errors reach the error middleware.
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Error carrying an HTTP status code.
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

export const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const pad = (n) => String(n).padStart(2, '0');

// Local (server-time) 'YYYY-MM-DD'
export const formatDay = (d = new Date()) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// Local 'YYYY-MM-DD hh:mm AM'
export const formatDateTime = (d = new Date()) => {
  const h = d.getHours();
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${formatDay(d)} ${pad(h12)}:${pad(d.getMinutes())} ${h >= 12 ? 'PM' : 'AM'}`;
};

export const isNonNegNumber = (v) =>
  v !== '' && v !== null && v !== undefined && Number.isFinite(Number(v)) && Number(v) >= 0;

const DAY_RX = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_RX = /^\d{4}-(0[1-9]|1[0-2])$/;

// True only for real calendar dates in 'YYYY-MM-DD' form (rejects 2026-02-31).
export const isValidDay = (s) => {
  if (typeof s !== 'string' || !DAY_RX.test(s)) return false;
  const [y, m, d] = s.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
};

export const isValidMonth = (s) => typeof s === 'string' && MONTH_RX.test(s);

// 'YYYY-MM-DD' for (today + n days), server local time.
export const shiftDay = (n, from = new Date()) => {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + n);
  return formatDay(d);
};

// First and last day of a 'YYYY-MM' month.
export const monthBounds = (month) => {
  const [y, m] = month.split('-').map(Number);
  const last = new Date(y, m, 0).getDate();
  return { from: `${month}-01`, to: `${month}-${pad(last)}` };
};
