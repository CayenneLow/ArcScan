const router = require('express').Router();
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({extended: true});
let randomNumber = require('../functions/RNG.js');
let convertToCron = require('../functions/convertToCron.js');
let moment = require('moment');
let key = require('../config/keys.js');
let connectionURL = `mongodb://${key.mongodb.username}:${key.mongodb.password}@ds331135.mlab.com:31135/arcscan`
const Agenda = require('agenda');
const agenda = new Agenda({db:{address: connectionURL, options:{useNewUrlParser: true}}});

// Database
const db = require('../models/database.js');
const event = db.event;
const user = db.user;
const org = db.org;
const jobColl = db.job;

// functions
async function buildEvent(form, org) {
    let newEvent = new event({
        type: 'event',
        name: form.name,
        startDateTime: form.startDateTime,
        endDateTime: form.endDateTime,
        recurring: form.recurring,
        daySelection: form.daySelection,
        recurrFrom: form.recurrFrom,
        recurrTo: form.recurrTo,
        org: org
    });
    return newEvent;
};

// agenda
agenda.define('start code', (job,done) => {
    // gen code
    let id = job.attrs.data.id;
    randomNumber().then(code => {
        event.findOneAndUpdate({_id: id}, {$set:{code:code}}).then(result => {
            console.log(`${result.name} has started`);
        });
        done();
    });
});

agenda.define('remove code', (job,done) => {
    // gen code
    let id = job.attrs.data.id;
    event.findOneAndUpdate({_id: id}, {$set:{code:''}}).then(result => {
        console.log(`${result.name} has ended`);
    });
    done();
});

(async function() {
    await agenda.start();
})();

router.get('/id/:id', (req,res) => {
    if (!req.user || req.user.type === 'user') {
        res.redirect('/');
    } else {
        // need name and code
        event.findOne({_id: req.params.id.toString()}).then((result) => {
            if (result) {
                let currEvent = {
                    name:result.name, 
                    code:result.code
                };
                let signedUsers = [];
                result.signed.forEach((user) => {
                    signedUsers.push(user);
                })
                res.render('event', {event:currEvent, users:signedUsers});
            } else {
                res.redirect('/org/dashboard');
            }
        });
    }
});

router.get('/createEvent', (req, res) => { res.render('createEvent'); }); 

router.post('/createEvent', urlencodedParser, async (req, res) => {
    // extract event details, build event model
    let newEvent = await buildEvent(req.body, req.user);
    newEvent = await newEvent.save();
    res.redirect('/org/dashboard');
    // scheduling
    // if recurring, every day within a range of dates
    // activate code at the event start time and deactivate at event end time
    let startDateTime = moment(newEvent.startDateTime).format();
    let endDateTime = moment(newEvent.endDateTime).format();
    if (newEvent.recurring === 'on') {
        console.log("not yet implemented");
    } else {
    // if not recurring, activate code at start of date, deactivate at end
        agenda.schedule(startDateTime, 'start code', {id: newEvent.id});
        agenda.schedule(endDateTime, 'remove code', {id: newEvent.id});
    }
    
});

router.get('/id/:id/delete', (req,res) => {
    let eventID = req.params.id;
    console.log(eventID);
    event.findOneAndDelete({_id:eventID}).then((result) => {
        console.log(`deleted ${result}`);
        res.redirect('/org/dashboard');
    }, (error) => {
        console.log(error);
        res.redirect('/org/dashboard');
    });
});

module.exports = router;

/*
async function buildJob(rule, action) {
    console.log(action);
    let newJob = new jobColl({
        rule: rule,
        action: action,
        pending: true
    })
    let jobObj = await newJob.save();
    // return id
    return jobObj.id;
}
*/
