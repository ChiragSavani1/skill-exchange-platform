const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const GitHubStrategy = require('passport-github2').Strategy;

module.exports = function(passport) {

  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL,
    scope: ['user:email']
  },
  async function(accessToken, refreshToken, profile, done) {
    try {
      // Check if the user already exists
      let user = await User.findOne({ githubId: profile.id });
  
      if (!user) {
        // Check if email already exists
        const existingEmailUser = await User.findOne({ email: profile.emails[0].value });
  
        if (existingEmailUser) {
          // Attach GitHub ID to existing email-based user
          existingEmailUser.githubId = profile.id;
          user = await existingEmailUser.save();
        } else {
          // New user
          user = await User.create({
            name: profile.displayName || profile.username,
            email: profile.emails[0].value,
            githubId: profile.id
          });
        }
      }
  
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }));

  passport.use(new LocalStrategy({ usernameField: 'email' }, 
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email }).select('+password');
        if (!user) return done(null, false, { message: 'Email not registered' });
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return done(null, false, { message: 'Incorrect password' });
        
        // Return user without password field
        const userWithoutPassword = user.toObject();
        delete userWithoutPassword.password;
        done(null, userWithoutPassword);
      } catch (err) {
        done(err);
      }
    }
  ));

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id).populate('skills');
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};