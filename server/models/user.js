const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken')

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
  let token = jwt.sign({_id: this._id.toHexString(), access}, 'abc123').toString();
  //I had .concat here on Andrew's advice, but push fixed my issue of the response body not having anything set to the newUser's tokens array.
  this.tokens.push({access, token});
  //Add returns here so we can chain thens on both ends of this method call in server.js.
  //The first return ensures that this method returns a promise.
  //The second return ensures that this promise, once resolved, will pass on a value.
  //This value will continue down the chain to the next .then().
  return this.save().then(() => {
    return token;
  });
};

//Adding a static method.
UserSchema.statics.findByToken = function (token) {
  let decoded;
  try {
    //jwt.verify will thrown an error if not valid which the catch block will process.
    decoded = jwt.verify(token, 'abc123');
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

//This file holds our User model.
const User = mongoose.model('User', UserSchema);

module.exports = {User};
