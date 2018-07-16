const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');

let data = {
  id: 1,
  alpha: 'A'
};

let token = {
  data,
  //This function returns an object.
  hash: SHA256(JSON.stringify(data) + 'secret').toString(),
}

let resultingHash = SHA256(JSON.stringify(token.data)).toString();
console.log(resultingHash);

resultingHash === token.hash ? console.log('User authenticated.') :
console.log('User token manipulated. Do not trust!');

let token1 = jwt.sign(data, 'secretsalt');
//Type this in on jwt.io for breakdown.
console.log(token1);
