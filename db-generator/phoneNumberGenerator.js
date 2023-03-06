const fs = require('fs');

let phoneNumbers = [];

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

for (var i = 0; i < 100; i++) {
    let intGen = getRandomInt(1000000000, 9999999999);
    phoneNumbers.push(intGen.toString());
}

// writes phoneNumbers to phone-numbers.txt file
const file = './raw-data/phone-numbers.txt';

fs.writeFile(file, phoneNumbers.toString(), (err) => {
    if (err) throw err;
    console.log('Data has been written to file: ', file);
});

module.exports = phoneNumbers;
