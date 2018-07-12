const express = require('express');
const bodyParser = require('body-parser');

//Loading in mongoose here is all we need to do.
//The reason .save() works on line 22.
const mongoose = require('./db/mongoose');
const {User} = require('./models/user');
const {ToDo} = require('./models/todo');

//This file will only be used to configure routes.
const app = express();

//Setting up third-party middleware.
//We are "giving" this functionality to express.
app.use(bodyParser.json());

//Here we set up a route for receiving incoming data from the client.
//We'll take this data, push it to the DB, and return an object to the client.
app.post('/todos', (req, res) => {
//This will log the parsed JSON data from the client, thanks to bodyParser.
  let toDo = new ToDo({text: req.body.text});
  toDo.save().then((doc)=>{
    res.send(doc);
  }, (err)=>{
  //400 signifies a Bad Request.
    res.status(400).send(err);
  });
});

app.listen(3000, () => {
  console.log('Server started on Port 3000.');
});

module.exports = {app};
