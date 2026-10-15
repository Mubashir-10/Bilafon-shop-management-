import jwt from 'jsonwebtoken';

export const getJwtSecret = () => process.env.JWT_SECRET;

// Requires `Authorization: Bearer <token>`.
export default function protect(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Not authorized: login required' });
  }

  try {
    req.user = jwt.verify(token, getJwtSecret());
    next();
  } catch {
    res.status(401).json({ message: 'Not authorized: token invalid or expired' });
  }
}
