const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minLength: 1,
    unique: true,
    validate: {
      //Weird. Using parentheses after isEmail() threw an error.
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email.'
    }
  },
  password: {
    type: String,
    required: true,
    //All lowercase. Also weird.
    minlength: 6
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});

//Overriding the built-in .toJSON method.
UserSchema.methods.toJSON = function () {
  //Turns the Mongoose model instance into a regular JS object.
  let userObject = this.toObject();
  //Now, when a user Model instance is turned into JSON, only this properties will get sent.
  return {
    email: userObject.email,
    _id: userObject._id
  };
};

//Adding an instance method.
UserSchema.methods.generateAuthToken = function () {
  let access = 'auth';
  let token = jwt.sign({_id: this._id.toHexString(), access}, process.env.jwt_secret).toString();
  //I had .concat here on Andrew's advice, but push fixed my issue of the response body not having anything set to the newUser's tokens array.
  this.tokens.push({access, token});
  return this.save().then(() => {
    return token;
  });
};
  //Add returns here so we can chain thens on both ends of this method call in server.js.
  //The first return ensures that this method returns a promise.
  //The second return ensures that this promise, once resolved, will pass on a value.
  //This value will continue down the chain to the next .then().

UserSchema.methods.removeToken = function (token) {
  //Makes this method chainable with Promises.
  return this.update({
    //Any object with a token property equal to token will get pulled from the array.
    $pull: {
      tokens: {
        token
      }
    }
  });
};

//Adding a static method.
UserSchema.statics.findByToken = function (token) {
  let decoded;
  try {
    //jwt.verify will thrown an error if not valid which the catch block will process.
    decoded = jwt.verify(token, process.env.jwt_secret);
  } catch (e) {
    //Ensures that this function will return a rejected Promise, not a fulfilled one as below.
    //A simpler way to write this is return Promise.reject();.
    return new Promise((resolve, reject) => (
      reject('Invalid authentication.')
    ));
  }
  //Returning what should be a fulfilled Promise.
  return this.findOne({
    //Remember, the payload (and thus the decoded version too) contains the user _id.
    '_id': decoded._id,
    //The '' marks are necessary for using dot notation in key name to query a nested value.
    //OK syntax for Mongoose even though nested in an array.
    'tokens.token': token,
    'tokens.access': 'auth'
  });
};

//With this design, we ensure that this function is chainable.
//It returns a Promise that returns another Promise, either resolved or rejected, whichever way it goes.
UserSchema.statics.findByCredentials = function (email, password) {
  return this.findOne({email}).then((user) => {
    if (!user) {
      return Promise.reject('No user with that email address exists.');
    }
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        if (res === true) {
          resolve(user);
        } else {
          reject('Invalid password.');
        }
      });
    });
  });
};

//For the longest time this wasn't working unless I typed let user = this then proceeded.
//It has something to do with function declarations vs. arrow syntax.
//Arrow syntax means the this retains the value of its enclosing lexical content.
//Which makes since for the bcrypt block.
//But if I use arrow syntax with pre(), it doesn't work.
//That's because in that case, this is simply the global object ('window').
UserSchema.pre('save', function (next) {
  if (this.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(this.password, salt, (err, hash) => {
        //Must be next within this block since it's async.
        //Otherwise, next will run before the hash is set.
        this.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

//This file holds our User model.
const User = mongoose.model('User', UserSchema);

module.exports = {User};
