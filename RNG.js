function randomNumber() {
    // returns a random 4 digit number [ 1000, 10000)
    return  Math.floor(1000 + Math.random() * 9000);
}

module.exports = {randomNumber};

