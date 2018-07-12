const mongoose = require('mongoose');

//This file holds our User model. 
const User = mongoose.model('User', {
  email: {
    type: String,
    required: true,
    trim: true,
    minLength: 1
  },
  name: String
});

module.exports = {User};
