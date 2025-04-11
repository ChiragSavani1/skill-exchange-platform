const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('home', { 
    user: req.user || null, // Ensures user is either the logged-in user or null
    logout: req.query.logout // Passes the logout success flag
  });
});
module.exports = router;