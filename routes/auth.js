const express = require('express');
const passport = require('passport');
const router = express.Router();

// GitHub OAuth Routes
router.get('/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

router.get('/github/callback',
  passport.authenticate('github', { 
    failureRedirect: '/auth/login',
    failureFlash: 'GitHub login failed'
  }),
  (req, res) => {
    // Successful authentication
    res.redirect('/skills');
  }
);

// Local Auth Routes
router.post('/login', passport.authenticate('local', {
  successRedirect: '/skills',
  failureRedirect: '/login'
}));
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.render('login', { 
        error: info.message,
        user: null,
        GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID
      });
    }
    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.redirect('/skills');
    });
  })(req, res, next);
});
router.get('/register', (req, res) => {
  res.render('register', { 
    user: req.user,
    error: null 
  });
});
router.get('/login', (req, res) => {
  res.render('login', { 
    error: null, // Pass error as null initially
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID
  });
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = new (require('../models/User'))({ name, email, password });
    await user.save();
    res.redirect('/auth/login');
  } catch (err) {
    res.render('register', { error: err.message });
  }
});

router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    
    req.session.destroy((err) => {
      if (err) return next(err);
      
      res.clearCookie('connect.sid'); 
      
      res.redirect('/?logout=success');
    });
  });
});

module.exports = router;