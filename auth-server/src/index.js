require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5001;

// ============================================================================
// MIDDLEWARE
// ============================================================================
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false, // set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// ============================================================================
// PASSPORT CONFIGURATION
// ============================================================================

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  },
  (accessToken, refreshToken, profile, done) => {
    const user = {
      id: profile.id,
      email: profile.emails[0].value,
      name: profile.displayName,
      avatar: profile.photos[0]?.value,
      provider: 'google',
    };
    return done(null, user);
  }
  ));
}

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Generate JWT tokens
const generateTokens = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role || 'student',
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '24h',
  });

  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
  });

  return { token, refreshToken };
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
};

// Check if user is admin
const isAdminUser = (email) => {
  return email === process.env.ADMIN_EMAIL || email === process.env.TPC_EMAIL;
};

// Get role based on email
const getRole = (email) => {
  if (email === process.env.ADMIN_EMAIL) return 'admin';
  if (email === process.env.TPC_EMAIL) return 'organizer';
  return 'student';
};

// ============================================================================
// MIDDLEWARE: AUTH VERIFICATION
// ============================================================================

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }

  req.user = decoded;
  next();
};

// ============================================================================
// ROUTES: HEALTH CHECK
// ============================================================================

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Campus Connect Auth Server running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ============================================================================
// ROUTES: EMAIL/PASSWORD LOGIN
// ============================================================================

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password required',
      });
    }

    // Check against hardcoded admin credentials
    let user = null;
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      user = {
        id: `u-${process.env.ADMIN_EMAIL}`,
        email: process.env.ADMIN_EMAIL,
        name: 'Admin Dean',
        role: 'admin',
      };
    } else if (email === process.env.TPC_EMAIL && password === process.env.TPC_PASSWORD) {
      user = {
        id: `u-${process.env.TPC_EMAIL}`,
        email: process.env.TPC_EMAIL,
        name: 'Placement Faculty Coordinator',
        role: 'organizer',
      };
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate tokens
    const { token, refreshToken } = generateTokens(user);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('[Auth] Login error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message,
    });
  }
});

// ============================================================================
// ROUTES: GOOGLE OAUTH
// ============================================================================

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed` }),
  (req, res) => {
    try {
      const user = {
        id: uuidv4(),
        email: req.user.email,
        name: req.user.name,
        role: getRole(req.user.email),
        avatar: req.user.avatar,
      };

      const { token, refreshToken } = generateTokens(user);

      // Redirect to frontend with token
      res.redirect(
        `${process.env.FRONTEND_URL}/auth-callback?token=${token}&refreshToken=${refreshToken}&user=${encodeURIComponent(JSON.stringify(user))}`
      );
    } catch (error) {
      console.error('[Auth] Google callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=callback_failed`);
    }
  }
);

// ============================================================================
// ROUTES: TOKEN REFRESH
// ============================================================================

app.post('/auth/refresh', (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token required',
      });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }

    // Generate new access token
    const user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
    };

    const { token: newToken } = generateTokens(user);

    res.json({
      success: true,
      message: 'Token refreshed',
      data: {
        token: newToken,
      },
    });
  } catch (error) {
    console.error('[Auth] Token refresh error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Token refresh failed',
      error: error.message,
    });
  }
});

// ============================================================================
// ROUTES: VERIFY TOKEN
// ============================================================================

app.get('/auth/verify', authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    data: {
      user: req.user,
    },
  });
});

// ============================================================================
// ROUTES: LOGOUT
// ============================================================================

app.post('/auth/logout', (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Logout failed',
    });
  }
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log(`\n✅ Campus Connect Auth Server running on http://localhost:${PORT}`);
  console.log(`📧 Admin Login: ${process.env.ADMIN_EMAIL} / ${process.env.ADMIN_PASSWORD}`);
  console.log(`📧 TPC Login: ${process.env.TPC_EMAIL} / ${process.env.TPC_PASSWORD}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`\n🚀 Test: curl http://localhost:${PORT}\n`);
});

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
