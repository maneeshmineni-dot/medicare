const { verifyToken: verifyJwtToken, JWT_SECRET } = require('../utils/cryptoUtils');
const { getSupabaseClient } = require('../config/supabase');

async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Authorization token missing or malformed.'
    });
  }

  const token = authHeader.split(' ')[1];

  // 1. Try local JWT token verification
  try {
    const decoded = verifyJwtToken(token);
    req.user = decoded;
    return next();
  } catch (error) {
    // 2. Fallback to Supabase Auth token verification
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data: { user }, error: supaErr } = await supabase.auth.getUser(token);
        if (user && !supaErr) {
          req.user = {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User'
          };
          return next();
        }
      } catch (supaErr) {
        // Fallback failed
      }
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authorization token.'
    });
  }
}

async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = verifyJwtToken(token);
      req.user = decoded;
    } catch (error) {
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          const { data: { user } } = await supabase.auth.getUser(token);
          if (user) {
            req.user = {
              id: user.id,
              email: user.email,
              name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User'
            };
          }
        } catch (e) {}
      }
    }
  }
  next();
}

module.exports = {
  verifyToken,
  optionalAuth,
  JWT_SECRET
};


