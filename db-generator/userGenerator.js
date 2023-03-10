const fs = require('fs');
const phoneNumbers = require('./phoneNumberGenerator');

let firstNamesString = [];
let lastNamesString = [];
let users = [];
let domainEnds = ["com", "org", "net", "edu"];

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

fs.readFile('./raw-data/last-names.txt', 'utf8', (err, lastNamesData) => {
    if (err) {
      return console.log(err);
    }

    lastNamesString = lastNamesData;
    let lastNames = lastNamesString.split(",");

    fs.readFile('./raw-data/first-names.txt', 'utf8', (err, firstNamesData) => {
        if (err) {
          return console.log(err);
        }

        // takes first-names.txt and turns it into an array of first names
        firstNamesString = firstNamesData;
        let firstNames = firstNamesString.split(",");

        // makes fake user objects
        for (var i = 0; i < 100; i++) {

            // gets a random first name
            let random = getRandomInt(0, firstNames.length);
            let firstName = firstNames[random];

            // gets a random last name
            let random2 = getRandomInt(0, lastNames.length);
            let lastName = lastNames[random2];

            // gets a random email ending
            let random3 = getRandomInt(0, domainEnds.length);

            let user = {
                firstName: firstName,
                lastName: lastName,
                email: firstName.toLowerCase() + lastName.toLowerCase() + "@example." + domainEnds[random3],
                phoneNumber: phoneNumbers[i]
            };
            users.push(user);
        }

        // writes users to users.json file
        const file = 'users.json';
        
        fs.writeFile(file, JSON.stringify(users), (err) => {
            if (err) throw err;
            console.log('Data has been written to file: ', file);
        });
    });
});

module.exports = JSON.stringify(users);
