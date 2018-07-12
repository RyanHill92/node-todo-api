const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/TodoApp');

//The mongoose object is exported after it's modified.
module.exports = {mongoose};
