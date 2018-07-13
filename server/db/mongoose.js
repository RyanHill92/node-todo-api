const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI, {useNewUrlParser: true});

//The mongoose object is exported after it's modified.
module.exports = {mongoose};
