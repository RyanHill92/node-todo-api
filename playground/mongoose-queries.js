const {ObjectId} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {ToDo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

//Querying with find.
let id = '5b4806922e979804676df3b3';

// //Mongoose automatically converts the ObjectID for us.
// ToDo.find({
//   _id: id
// }).then((todo) => {
//   console.log('Array', todo);
// });
//
// //This method returns not an array of objects but a single object.
// ToDo.findOne({
//   completed: false
// }).then((todo) => {
//   console.log('Object', todo);
// });


//Query a document by its id, passed straight in as a string arg.
ToDo.findById(id).then((todo) => {
  //In case a valid ID does not match an object in the DB.
  if (!todo) {
    return console.log('Unable to find ID.');
  }
  console.log('Todo by Id', todo);
  //In case an invalid ID is passed.
}).catch((e) => {
  console.log(e.message);
});

//To demonstrate an option for validation.
if (!ObjectId.isValid(id)) {
  console.log('Invalid ID.');
}

let id2 = '5b4792a2150125f7b6201aa1';

User.findById(id2).then((user)=> {
  //I think I prefer the non-JSON-stringified output.
  !user ? console.log('Unable to find user.') : console.log('User by ID', JSON.stringify(user, undefined, 2));
}).catch((err)=> {
  //Using ternary op to create simple response to invalid ID. Else print err.
  !ObjectId.isValid(id2) ? console.log('Invalid User ID.') : console.log(err.message);
});
