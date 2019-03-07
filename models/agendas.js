let key = require('../config/keys.js');
let connectionURL = `mongodb://${key.mongodb.username}:${key.mongodb.password}@ds331135.mlab.com:31135/arcscan`
const Agenda = require('agenda');
//const agenda = new Agenda({db:{address: connectionURL, options:{useNewUrlParser: true}}});
const event = require('./database.js').event;

agenda.define('start code', (job,done) => {
    // gen code
    let id = job.attrs.data.id;
    let code = randomNumber();
    console.log("hello");
    event.findOneAndUpdate({_id: id}, {$set:{code:code}}).then(result => {
        console.log(`${result.name} has started`);
    });
    done();
});

agenda.define('remove code', (job,done) => {
    // gen code
    let id = job.attrs.data.id;
    let code = randomNumber();
    event.findOneAndUpdate({_id: id}, {$set:{code:''}}).then(result => {
        console.log(`${result.name} has ended`);
    });
    done();
});

/*
// scheduling
(async function() {
    let log = await agenda.start();
    console.log(log); 
})();
*/

module.exports = agenda;
