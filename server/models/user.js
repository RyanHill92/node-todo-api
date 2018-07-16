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
}

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
}

//This file holds our User model.
const User = mongoose.model('User', UserSchema);

module.exports = {User};
