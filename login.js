const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const app = express();

// Set up session middleware
app.use(session({
  secret: 'mysecret', // Replace with a secret key of your choice
  resave: false,
  saveUninitialized: false
}));

// Set up Passport.js middleware
app.use(passport.initialize());
app.use(passport.session());

// Set up a local strategy for Passport.js to use
passport.use(new LocalStrategy(
  function(username, password, done) {
    // Look up the user in your database
    User.findOne({ username: username }, function(err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      if (!user.verifyPassword(password)) { return done(null, false); }
      return done(null, user);
    });
  }
));

// Serialize and deserialize the user for session management
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

// Handle the login request
app.post('/login',
  passport.authenticate('local'),
  function(req, res) {
    // If this function gets called, authentication was successful
    res.redirect('/profile');
  }
);

// Handle the logout request
app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

// A protected route that requires authentication
app.get('/profile', function(req, res) {
  // If the user is authenticated, req.user will contain their user object
  if (req.isAuthenticated()) {
    res.send(`Welcome, ${req.user.username}!`);
  } else {
    res.redirect('/');
  }
});

// Start the server
app.listen(3000, function() {
  console.log('Server started on port 3000');
});
