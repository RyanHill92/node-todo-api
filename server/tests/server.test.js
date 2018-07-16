const expect = require('expect');
const request = require('supertest');
const {ObjectId} = require('mongodb');

//.. means "back one folder in the directory."
const {app} = require('./../server');
const {ToDo} = require('./../models/todo');
const {User} = require('./../models/user');
const {populateTodos, todos, populateUsers, users} = require('./seed/seed');
//Mocha and nodemon don't need to be required.

beforeEach(populateUsers);
beforeEach(populateTodos);

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

describe('DELETE /todos/:id', () => {
  it('should return the deleted note if fed a valid, matching ID', (done) => {
    let id = todos[0]._id.toHexString();
    request(app)
      .delete(`/todos/${id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toBeA('object');
        expect(res.body.message).toBe('Todo deleted');
        //Checking for the truthiness of the deleted note text, a required field for ToDo.
        expect(res.body.todo.text).toExist();
        //Make sure it deleted the right one!
        expect(res.body.todo._id).toBe(id);
      })
      .end((err, res) => {
        if (err) return done(err);
        ToDo.find().then((docs) => {
          //Returns an array of objects.
          expect(docs.length).toBe(1);
          expect(todos).toNotInclude({_id: id});
          done();
        }).catch((err) =>{
          done(err);
        });
      });
  });

// //An alternative for above.
//   ToDo.findById(id).then((doc) => {
//     //Returns an array of objects.
//     expect(doc).toNotExist;
//     done();
//   })

  it('should return no note and a 404 if fed valid, non-matching ID', (done) => {
    let id = new ObjectId().toHexString();
    request(app)
      .delete(`/todos/${id}`)
      .expect(404)
      .expect((res) => {
        //Shouldn't return any todos.
        expect(res.body.todo).toNotExist();
        expect(res.body.errorMessage).toBe('Unable to find todo by that ID.');
      })
      //Unnecessary I suppose; could just .end(done).
      .end((err, res) => {
        if (err) return done(err);
        ToDo.find().then((docs) => {
          //Array of docs inserted to DB before test case should be unchanged.
          expect(docs.length).toBe(2);
          done();
        }).catch((err) => {
          done(err);
        });
      });
  });

  it('should return no note and a 400 if fed invalid ID', (done) => {
    request(app)
      .delete('/todos/123')
      .expect(400)
      .expect((res) => {
        expect(res.body.todo).toNotExist();
        expect(res.body.errorMessage).toBe('Invalid ID.');
      })
      //Just like with last one, wanted to make sure DB unchanged.
      .end((err, res) => {
        if (err) return done(err);
        ToDo.find().then((docs) => {
          //Array of docs inserted to DB before test case should be unchanged.
          expect(docs.length).toBe(2);
          done();
        }).catch((err) => {
          done(err);
        });
      });
  });
});

describe('PATCH /todos/:id', () => {
  it('should update text and set timestamp when completed', (done) => {
    let id = todos[0]._id.toHexString();
    let text = 'Check one, son';
    request(app)
      .patch(`/todos/${id}`)
      .send({
        text,
        completed: true
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.message).toBe('Updated todo');
      })
      .end((err, res) => {
        if (err) return done(err);
        ToDo.findById(id).then((doc) => {
          expect(doc.text).toBe(text);
          expect(doc.completedAt).toBeA('number');
          expect(doc.completed).toBe(true);
          done();
        }).catch((err)=>{
          done(err);
        });
      });
  });

  it('should update text and set completedAt to null if completed is false', (done) => {
    let id = todos[1]._id.toHexString();
    let text = 'Check two, foo';
    request(app)
      .patch(`/todos/${id}`)
      .send({
        text,
        completed: false
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.message).toBe('Updated todo');
      })
      .end((err, res) => {
        if (err) return done(err);
        ToDo.findById(id).then((doc) => {
          expect(doc.text).toBe(text);
          expect(doc.completed).toBe(false);
          expect(doc.completedAt).toNotExist();
          done();
        }).catch((err) => {
          done(err);
        });
      });
  });

  it('should reject a request body either blank or containing invalid data even in case of valid, matching ID', (done) => {
    let id = todos[0]._id.toHexString();
    //This wasn't working for 20min...because I had app(request). Stoo. Pid.
    request(app)
      .patch(`/todos/${id}`)
      .send({
        text: '   ',
        completed: 'Yes'
      })
      .expect(400)
      .expect((res) => {
        expect(res.body.errorMessage).toBe('Please specify text update (string) and/or valid completion status (boolean).');
      })
      .end((err, res) => {
        if (err) return done(err);
        ToDo.find().then((docs) => {
          expect(docs.length).toBe(2);
          done();
        }).catch((err) => {
          done(err);
        });
      });
  });

  it('should send a 400 for an invalid ID', (done) => {
    request(app)
      .patch('/todos/123')
      .send({
        text: 'Test',
        completed: false
      })
      .expect(400)
      .expect((res) => {
        expect(res.body.errorMessage).toBe('Invalid ID.')
      })
      .end((err, res) => {
        if (err) return done(err);
        ToDo.find().then((docs) => {
          expect(docs.length).toBe(2);
          done();
        }).catch((err) => {
          done(err);
        });
      });
  });

  it('should send a 404 for a valid, unmatching ID', (done) => {
    let id = new ObjectId().toHexString();
    request(app)
      .patch(`/todos/${id}`)
      .send({
        text: 'Hi there',
        completed: false
      })
      .expect(404)
      .expect((res) => {
        expect(res.body.errorMessage).toBe('Unable to find and update note.');
      })
      .end((err, res) => {
        if (err) return done(err);
        ToDo.find().then((docs) => {
          expect(todos.length).toBe(2);
          done();
        }).catch((err) => {
          done(err);
        });
      });
  });
});

describe('GET /users/me', () => {
  it('should return a user object if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });

  it('should return a 401 with error message if no authentication', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect((res) => {
        expect(res.body.errorMessage).toBe('Authentication required.');
      })
      .end(done);
  });
});

describe('POST /users', () => {
  it('should create a new user', (done) => {
    let email = 'sarah@example.com';
    let password = 'veryStrongPassword';
    request(app)
      .post('/users')
      .send({
        email,
        password
      })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toExist();
        expect(res.body.user._id).toExist();
        expect(res.body.user.email).toBe('sarah@example.com');
      })
      //I suppose he didn't have us test the DB at first because the only way for the
      //above assertions to be true is for the save() Promises to have resolved.
      //Also, note here that only one arg is passed to end(). No need for res as before.
      .end((err) => {
        if (err) return done(err);
        User.findOne({email}).then((user) => {
          //Make sure SOMEONE comes back.
          expect(user).toExist();
          //Make sure password has been hashed.
          expect(user.password).toNotBe(password);
          done();
        });
      });
  });

  it('should send back an error if email or password invalid', (done) => {
    let badEmail = 'elephantears.com';
    let badPassword = '12345';
    request(app)
      .post('/users')
      .send({
        email: 'christopher123@gmail.com',
        password: badPassword
      })
      .expect(400)
      .expect((res) => {
        expect(res.body.user).toNotExist();
        expect(res.body.errorMessage).toExist();
      })
      .end(done);
  });

  it('should send back an error if email already exists in database', (done) => {
    request(app)
      .post('/users')
      .send({
        email: users[0].email,
        password: 'llama123'
      })
      .expect(400)
      .expect((res) => {
        expect(res.body.errorMessage).toBe('A profile with this email address already exists.');
        expect(res.body.user).toNotExist();
      })
      .end(done);
  });
})
