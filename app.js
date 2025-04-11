require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const hbs = require('express-handlebars');
const path = require('path');
const methodOverride = require('method-override');

const app = express();

// Database connection
require('./config/db')();

// Passport config
require('./config/passport')(passport);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Set res.locals.user before routes
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// Handlebars setup
app.engine('hbs', hbs.engine({
  extname: 'hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials'),
  helpers: {
    eq: (a, b) => a?.toString() === b?.toString(),
    json: (context) => JSON.stringify(context),
    and: (a, b) => a && b,
    or: (a, b) => a || b,
    isEqual: function (a, b, options) {
      const aStr = a?.toString();
      const bStr = b?.toString();
    
      // Inline helper
      if (!options || typeof options !== 'object' || typeof options.fn !== 'function') {
        return aStr === bStr;
      }
    
      // Block helper
      return aStr === bStr ? options.fn(this) : options.inverse(this);
    }
    
    
  },
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true
  }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/skills', require('./routes/skills'));

// 404 Not Found
app.use((req, res, next) => {
  res.status(404).render('404', {
    title: 'Page Not Found',
    user: req.user
  });
});

// 500 Server Error
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('500', {
    title: 'Server Error',
    user: req.user
  });
});

module.exports = app;
