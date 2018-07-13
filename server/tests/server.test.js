const expect = require('expect');
const request = require('supertest');
const {ObjectId} = require('mongodb');

//.. means "back one folder in the directory."
const {app} = require('./../server');
const {ToDo} = require('./../models/todo');
//Mocha and nodemon don't need to be required.

//Our dummy array.
//Add ObjectIDs for GET /todos/:id req test to work.
const todos = [
  {
    _id: new ObjectId(),
    text: 'Check one'
  }, {
    _id: new ObjectId(),
    text: 'Check two'
  }
];

beforeEach((done) => {
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
        ToDo.find({text}).then((todos) => {
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
          //The length of the dummy array.
          expect(todos.length).toBe(2);
          done();
        }).catch((err) => done(err));
      });
  });
});

describe('GET /todos', () => {
  it('should return an object of all todos', (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect((res) => {
        //These weren't working until I downgraded expect to v. 1.20.2 from v.21...
        expect(res.body.todos.length).toBe(2);
        expect(res.body.msg).toBe('Notes successfully retrieved');
        expect(res.body.todos[0]).toInclude({text: 'Check one'});
        expect(res.body.todos).toBeA('array');
      })
      .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('should return an object in case of valid, matching ID', (done) => {
    //So the ID is converted to a string, appendable to the URL.
    let id = todos[0]._id.toHexString();
    request(app)
    //I kept getting an error because I left the : in there. Stupid!
      .get(`/todos/${id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBe(id)
        expect(res.body.message).toBe('Todo located')
      })
      .end(done);
  });

  it('should return a 400 in case of invalid ID format', (done) => {
    request(app)
      .get('/todos/123')
      .expect(400)
      .expect((res) => {
        expect(res.body.errorMessage).toBe('Invalid ID.');
      })
      .end(done);
  });

  it('should return a 404 in case of valid ID with no matching todo', (done) => {
    request(app)
      .get(`/todos/${new ObjectId().toHexString()}`)
      .expect(404)
      .expect((res) => {
        expect(res.body.errorMessage).toBe('Unable to find todo by that ID.');
      })
      .end(done);
  });
});
