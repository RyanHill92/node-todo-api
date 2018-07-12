const expect = require('expect');
const request = require('supertest');

//.. means "back one folder in the directory."
const {app} = require('./../server');
const {ToDo} = require('./../models/todo');
//Mocha and nodemon don't need to be required.

beforeEach((done) => {
  //This 'lifecycle' method will run before each test case.
  //We clear the database before each test to ensure length = 1.
  //Passing an empty object will remove all todos.
  //Runs before EACH it().
  ToDo.remove({}).then(() => done());
});

describe('POST /todos', () => {
//Remember, must specify 'done' for async testing.
  it('should create a new todo', (done) => {
    let text = 'Test todo text';
//Supertest begins here with 'request.'
    request(app)
      .post('/todos')
      .send({text})
      .expect(200)
      //Have to pass in res as arg for expect() to work.
      .expect((res) => {
      //Expect (vs. supertest's .expect()).
      //UGH. This wasn't working for the longest time.
      //Because I had res set not to the doc itself...
      //But rather to a string with interpolation.
      //Stupid.
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) return done(err);
        //This is Mongoose syntax, rather than native Mongo.
        //Because models ARE collections,
        //ToDo points to the same place as db.collections('Todos').
        ToDo.find().then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        //Following promise syntax, if no second callback,
        //we must use .catch(). Otherwise, the test would pass,
        //even in the case of an error.
      }).catch((err) => done(err));
      });
  });

  it('should not store a note for bad request', (done) => {
    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) return done(err);
        ToDo.find().then((todos) => {
          expect(todos.length).toBe(0);
          done();
        }).catch((err) => done(err));
      });
  });
});
