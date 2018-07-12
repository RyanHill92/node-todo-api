const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client)=> {
  if (err) {
    return console.log('Unable to connect to MongoDB server.');
  }
  console.log('Connected to MongoDB server–Todo collection.');
  const db = client.db('TodoApp');

  db.collection('Todos').deleteMany({text: 'Task'}).then((result) => {
  //Result is another massive object.
  //Its first property, result, holds an n(# deleted) and binary (OK?) value.
    console.log(`Successfully deleted ${result.result['n']} items from ${result.connection.options.dbName} database.`);
  }).catch((err)=> {
    console.log(err);
  });

//One also need not chain a .then() at all...
  db.collection('Todos').deleteOne({text: 'Pray for Rob'});

//This third method returns the document itself, so no need to parse the result object.
  db.collection('Todos').findOneAndDelete({_id: new ObjectID("5b46463a35654ae2108dae0b")}).then((document) => {
    console.log(`Successfully deleted todo: ${JSON.stringify(document.value, undefined, 2)}`);
  }).catch((err) => {
    console.log(err);
  });
});
