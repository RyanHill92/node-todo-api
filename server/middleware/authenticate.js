const {User} = require('./../models/user');

const authenticate = function (req, res, next) {
  let token = req.header('x-auth');

  if (!token) {
    return res.status(401).send({errorMessage: 'Authentication required.'});
  }
  User.findByToken(token).then((user) => {
    //Tried ternary op here but logged as unhandled Promise rejection.
    if (!user) {
      return Promise.reject('No user with that token exists.');
    }
    //User, thanks to our overridden toJSON method, contains just email and _id.
    req.user = user;
    req.token = token;
    //Lets the app know to keep running.
    //We don't call next() anywhere else, lest the route treat the req as valid.
    next();
  }).catch((err) => {
    return res.status(401).send({errorMessage: err});
  });
};

module.exports = {authenticate};
