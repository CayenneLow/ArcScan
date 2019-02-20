const key = require('./config/keys.js');
let connectionURL = `mongodb://${key.mongodb.username}:${key.mongodb.password}@ds331135.mlab.com:31135/arcscan`
const Agenda = require('agenda');
const agenda = new Agenda({db:{address: connectionURL, options:{useNewUrlParser: true}}});


(async function() { // IIFE to give access to async/await
  await agenda.start();

    let i = 0;
    while (i < 5) {
        agenda.define(`logging ${i}`, (job, done) => {
            console.log("this is" + job.attrs.data.data);
        });
        let yes = await agenda.now(`logging ${i}`, {data: i});
        if (yes) {
            i += 1;
        }
    }
})();
