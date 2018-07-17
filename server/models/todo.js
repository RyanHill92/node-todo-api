const mongoose = require('mongoose');

//This file holds our ToDo model.
const ToDo = mongoose.model('ToDo', {
  text: {
    type: String,
    required: true,
    minLength: 1,
    //Cuts out any whitespace.
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Number,
    default: null
  },
  _creator: {
    required: true,
    type: mongoose.Schema.Types.ObjectId
  }
});

module.exports = {ToDo};
