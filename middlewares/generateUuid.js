import { v4 as uuidv4 } from 'uuid';

/**
 * Middleware to generate or reuse a UUID for cart/order
 * - If visitor has a cookie, use that UUID
 * - Otherwise, generate a new UUID and set it in a cookie
 */
export const generateUuid = (req, res, next) => {
  let uuid = req.cookies?.uuid;

  if (!uuid) {
    uuid = uuidv4();

    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('uuid', uuid, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
    });
  }

  // Ensure req.body exists
  if (!req.body) req.body = {};
  req.body.uuid = uuid;

  next();
};
