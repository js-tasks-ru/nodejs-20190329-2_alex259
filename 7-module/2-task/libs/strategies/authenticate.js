const User = require('../../models/User');

module.exports = async function authenticate(strategy, email, displayName, done) {
  try {
    if (!email) {
      return done(null, false, `Не указан email`);
    }

    let user = await User.findOne({email});

    if (user) {
      return done(null, user);
    }

    return done(null, await User.create({email, displayName}));

  } catch (err) {
    done(err);
  }
};
