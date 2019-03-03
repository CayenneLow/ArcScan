const eventColl = require('../models/database.js').event;

async function randomNumber() {
    try {
        // returns a random 4 digit number [ 1000, 10000)
        let num = Math.floor(1000 + Math.random() * 9000);
        let duplicate = await eventColl.findOne({code:num});
        if (duplicate) {
            console.log("Duplicate code");
            randomNumber();
        } else {
            return num;
        }
    } catch(err) {
        console.log(err);
        return null;
    } 
}
module.exports = randomNumber;

