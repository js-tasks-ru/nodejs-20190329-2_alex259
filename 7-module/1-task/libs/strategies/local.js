const LocalStrategy = require('passport-local').Strategy;
const User = require('../../models/User');

module.exports = new LocalStrategy(
  { usernameField: 'email', session: false, },
  async function(email, password, done) {
    try {
      let user = await User.findOne({email});

      if (!user) {
        return done(null, false, 'Нет такого пользователя');
      } 
      
      if (! await user.checkPassword(password)) {
        return done(null, false, 'Невереный пароль');
      }

      return done(null, user);

    } catch (err) {
      done(err);
    }
  }
);
