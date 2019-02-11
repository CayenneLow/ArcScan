function randomNumber(numbers) {
    // returns a random 4 digit number [ 1000, 10000)
    let number;
    while(1) {
        let duplicate = false;
        number = Math.floor(1000 + Math.random() * 9000);
        for(let entry in numbers) {
            if (entry === number) {
                duplicate = true;
                break;
            }
        }
        if (duplicate === true) {
            continue;
        }
        break;
    }

    return number;
}

module.exports = {randomNumber};

