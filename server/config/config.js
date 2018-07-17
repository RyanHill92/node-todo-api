//If we're just running the standard node server/server.js script,
//NODE_ENV won't be set yet.
var env = process.env.NODE_ENV || 'development';

//Aha. Now we can get rid of the || operators when assigning values to these env variables.
//The minute our test-watch script is run, the mongo URI will swap to our new Test DB.
//When deployed on Heroku, NODE_ENV will get set to 'production.'
//Heroku will also set its own PORT and mongo URI (heroku config), so we're good!
if (env === 'development' || env === 'test') {
  let config = require('./config.json');
  let envConfig = config[env];
  // We don't even want the variables themselves exposed.
  // process.env.PORT = envConfig.PORT;
  // process.env.MONGODB_URI = envConfig.MONGODB_URI;
  Object.keys(envConfig).forEach((key) => process.env[key] = envConfig[key]);
}
