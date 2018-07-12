//const MongoClient = require('mongodb').MongoClient;

//Object destructuring. A new variable gender = 'male'.
var ryan = {gender: 'male', build: 'thin'}
var {gender} = ryan;
console.log(gender);

//Using destructuring, we extract not only the same as above...
//...but also the constructor function for generating IDs!
const {MongoClient, ObjectID} = require('mongodb');
let sampleID = new ObjectID();
//Will be different each time the script runs.
console.log(sampleID);

//Here we give not a URL but a local address.
//Important to use the mongodb:// prefix.
//Since the TodoApp doesn't yet exist, this command will create it.
MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client)=> {
  if (err) {
//Using return before console.log ensures that the function will
//stop before getting to the success case console.log.
//As soon as a function returns, it stops. Cool!
    return console.log('Unable to connect to MongoDB server.')
  }
  console.log('Connected to MongoDB server–Todo collection.');
//Necessary to enable syntax below.
//Note: here TodoApp is the database.
  const db = client.db('TodoApp');

//Two arguments: a document to insert and a callback.
//Note: here TodoApp is the collection.
  db.collection('Todos').insertOne({
    text: 'Pray for the Barbers',
    completed: true
  }, (err, result) => {
    if (err) {
      return console.log('Unable to insert todo.')
    }
//results.ops carries the document data.
//The stringified ops property is an object inside an array.
//Just printing result with JSON.stringify yields only the very first pair.
//{n: 1, ok: 1}.
//Just printing result sans stringify yields a giant object, with ops at the bottom.
    console.log(JSON.stringify(result.ops, undefined, 2));
  })

//Closes the connection to the server.
  client.close();
});

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
  if (err) {
    return console.log('Unable to access MongoDB server.');
  }
  console.log('Connected to MongoDB server–Users collection.');
//Note: here TodoApp is the database.
  const db = client.db('TodoApp');

//Note: here Users is the new collection.
  db.collection('Users').insertOne({
    name: 'Sarah Hill',
    age: 23,
    location: 'Charlotte'
  }, (err, result) => {
    if (err) {
      return console.log('Unable to insert user.')
    }
    console.log(JSON.stringify(result.ops[0]._id.getTimestamp(), undefined, 2));
  })
})
