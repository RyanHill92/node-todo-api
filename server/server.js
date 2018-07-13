const express = require('express');
const bodyParser = require('body-parser');
const {ObjectId} = require('mongodb');

//Loading in mongoose here is all we need to do.
//The reason .save() works on line 22.
const mongoose = require('./db/mongoose');
const {User} = require('./models/user');
const {ToDo} = require('./models/todo');

//This file will only be used to configure routes.
const app = express();
const port = process.env.PORT || 3000;
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

app.get('/todos', (req, res) => {
  ToDo.find().then((todos)=>{
    //Wrap the array of objects in an object for future flexibility.
    res.send({msg: 'Notes successfully retrieved', todos});
  }, (err)=> {
    res.status(400).send(err);
  });
});

//URL params! String together multiple params with &.
// app.get('/todos/:fruit&:friend', (req, res) => {
//   res.send(req.params);
// });

//Some cool experimentation here with ternary op. It works!
app.get('/todos/:id', (req, res) => {
  let id = req.params.id;
  !ObjectId.isValid(id) ? res.status(400).send({errorMessage: 'Invalid ID.'}) :
  ToDo.findById(id).then((todo) => {
    !todo ? res.status(404).send({errorMessage: 'Unable to find todo by that ID.'}) :
    res.send({message: 'Todo located', todo});
  }).catch((err)=> {
    res.status(404).send(err);
  });
});

//Add a DELETE / route.
app.delete('/todos/:id', (req, res) => {
  let id = req.params.id;
  !ObjectId.isValid(id) ? res.status(400).send({errorMessage: 'Invalid ID.'}) :
  ToDo.findByIdAndRemove(id).then((todo) => {
    !todo ? res.status(404).send({errorMessage: 'Unable to find todo by that ID.'}) :
    res.send({message: 'Todo deleted', todo});
  }).catch((err)=> {
    res.status(404).send(err);
  });
});

app.listen(port, () => {
  console.log(`Server started on ${port}.`);
});

module.exports = {app};
