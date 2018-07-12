const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client)=> {
  if (err) {
    return console.log('Unable to connect to MongoDB server.');
  }
  console.log('Connected to MongoDB server–Todo collection.');
  const db = client.db('TodoApp');

//Filter, update operators, and options.
//Using the upsert option creates the doc if it doesn't exist.
  db.collection('Todos').findOneAndUpdate({urgency: false}, {
    $rename: {
      urgency: 'urgent',
    },
    $set: {
      text: 'Eat dinner',
      completed: false
    }
  }, {
    returnOriginal: false,
    upsert: true
  }).then((result) => {
    console.log(result);
  }).catch((e)=> {
    console.log(e);
  });

  db.collection('Users').findOneAndUpdate({name: 'Sarah Hill'}, {
    $inc: {
      age: 2
    },
    $set: {
      name: 'Ryan Hill',
      dbAdmin: true
    }
  }, {
    returnOriginal: false
  }).then((result) => {
    console.log(result);
  }).catch((e)=> {
    console.log(e);
  });
});
