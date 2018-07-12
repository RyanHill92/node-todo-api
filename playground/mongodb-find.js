const {MongoClient, ObjectID} = require('mongodb');
let sampleID = new ObjectID();


//NB: Whether adding or fetching data, the .connect() contains everything.
MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client)=> {
  if (err) {
    return console.log('Unable to connect to MongoDB server.');
  }
  console.log('Connected to MongoDB server–Todo collection.');

  const db = client.db('TodoApp');

//The .find() method returns a "cursor" which points to all documents if given no args.
//One can call many methods on that cursor, like .toArray(), which returns a Promise.
//Feeding .find() a query object inside {} filters the fetching.
  db.collection('Todos').find({_id: new ObjectID('5b46463a35654ae2108dae0b')}).toArray().then((docs)=> {
    console.log(JSON.stringify(docs, undefined, 2));
  }, (err)=> {
    console.log('Unable to fetch documents from Todos.');
  });

  db.collection('Users').find({age: 23}).count().then((count)=> {
    console.log(`There are ${count} users 25 years old.`);
  }, (err)=> {
    console.log('Unable to count.');
  });

  db.collection('Todos').find({completed: false}).toArray().then((docs)=> {
    console.log(JSON.stringify(docs, undefined, 2));
  }, (err)=> {
    console.log('Unable to fetch documents from Todos.');
  });
});

//Don't call close() in the case of this method.
