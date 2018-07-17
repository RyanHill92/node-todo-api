//Didn't work when I used this syntax: const adder = function () {...}.
function adder (c, d) {
  return this.a + this.b + c + d;
}

let myNums = {
  a: 20,
  b: 30,
  c: 40
};

console.log(adder.call(myNums, 4, 5));

//Only uses first two numbers in the array.
console.log(adder.apply(myNums, [6, 7, 8, 9]));

function adder2 (d, e, f) {
  return this.a + this.b + this.c + d + e + f;
}

console.log(adder2.apply(myNums, [100, 200, 300]));

function hobby (city) {
  return `${this.name} enjoys ${this.activity} in ${city}.`
}

let anna = {
  name: 'Anna',
  activity: 'running'
};

let jonas = {
  name: 'Jonas',
  activity: 'painting'
};

console.log(hobby.call(anna, 'Charlotte'));

console.log(hobby.call(jonas, 'Maui'));
