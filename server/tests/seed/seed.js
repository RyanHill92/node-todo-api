const {ObjectId} = require('mongodb');
const jwt = require('jsonwebtoken')
const {ToDo} = require('./../../models/todo');
const {User} = require('./../../models/user');

//Our dummy array.
//Add ObjectIDs for GET /todos/:id req test to work.
const todos = [
  {
    _id: new ObjectId(),
    text: 'Check one'
  }, {
    _id: new ObjectId(),
    text: 'Check two',
    completed: true,
    completedAt: new Date().getTime()
  }
];

const populateTodos = done => {
  //This 'lifecycle' method will run before each test case.
  //We clear the database before each test to ensure length = 1.
  //Passing an empty object will remove all todos.
  //Runs before EACH it().
  //Inserting a dummy array of notes each time ensures the GET test will work.
  ToDo.remove({}).then(() => {
    //Return so we can chain a then.
    return ToDo.insertMany(todos);
  }).then(() => {
    done();
  });
};

let userOneId = new ObjectId();
let userTwoId = new ObjectId();
const users = [{
  email: 'ryan@example.com',
  password: 'strongPassword',
  _id: userOneId,
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userOneId.toHexString(), access: 'auth'}, 'abc123').toString()
  }]
}, {
  email: 'anna@example.com',
  password: 'strongerPassword',
  _id: userTwoId
}];

//If we wrote this function with .insertMany(), then the passwords wouldn't get hashed.
//In other words, we'd "skip over" our essential middleware.
const populateUsers = done => {
  User.remove({}).then(() => {
    //Both of these variables, because of save(), store Promises.
    let userOne = new User(users[0]).save();
    let userTwo = new User(users[1]).save();
    //This built in utility method fires a callback only once all Promises are resolved.
    return Promise.all([userOne, userTwo])
  }).then(() => done());
};

module.exports = {populateTodos, todos, populateUsers, users};
