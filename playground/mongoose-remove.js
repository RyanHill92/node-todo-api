const {ObjectId} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {ToDo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

//Todo.remove({}) will remove everything in DB if obj is blank.
//Todo.findOneAndRemove({}) will return the doc it deletes.
//Todo.findByIdAndRemove(id) does the same; simpler arg.
//Again, none of these query methods will throw errors if nothing found.
//Must handle errors manually.

ToDo.findByIdAndRemove('5b48d32225ce2b10cebbc536', (err, result) => {
  if (!result) return console.log('Unable to delete note.');
  console.log('Note deleted: ' + result);
});
