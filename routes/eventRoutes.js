const router = require('express').Router();
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({extended: true});
let randomNumber = require('../functions/RNG.js');
let convertNumToDay = require('../functions/convertToCron.js').convertNumToDay;
let moment = require('moment'); 
let key = require('../config/keys.js');
let connectionURL = `mongodb://${key.mongodb.username}:${key.mongodb.password}@ds331135.mlab.com:31135/arcscan`
const Agenda = require('agenda');
const agenda = new Agenda({db:{address: connectionURL, options:{useNewUrlParser: true}}});
const QRCode = require('qrcode');

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
        recurrEnd: form.recurrEnd,
        org: org
    });
    return newEvent;
};

// agenda
agenda.define('recurrJob', async (job, done) => {
    let eventDeets = job.attrs.data.eventDeets;
    let userDeets = job.attrs.data.userDeets;
    // need to change eventDeets with new startdate and enddate
    // math for endDateTime
    // calculate time between startdatetime and enddatetime
    let startDateTime = eventDeets.startDateTime;
    let endDateTime = eventDeets.endDateTime;
    let difference = Date.parse(endDateTime) - Date.parse(startDateTime);
    // assigning new date for new event that's about to be created
    eventDeets.startDateTime = new Date();
    // math for endDateTime
    let newEnd = new Date(Date.parse(eventDeets.startDateTime) + difference);
    eventDeets.endDateTime = newEnd;
    eventDeets.startDateTime = moment.parseZone(eventDeets.startDateTime).format();
    eventDeets.endDateTime = moment.parseZone(eventDeets.endDateTime).format();
    let newEvent = await buildEvent(eventDeets, userDeets);
    newEvent = await newEvent.save();
    agenda.schedule(newEvent.startDateTime, 'start code', {id: newEvent.id});
    agenda.schedule(newEvent.endDateTime, 'remove code', {id: newEvent.id});
    done();
});

agenda.define('start code', (job,done) => {
    // gen code
    let id = job.attrs.data.id;
    randomNumber().then(code => {
        event.findOneAndUpdate({_id: id}, {$set:{code:code}}).then(result => {
            if (result == null) {
                console.log("start code encountered null event");
            } else {
                console.log(`${result.name} has started`);
            }
            done();
        });
    });
});

agenda.define('remove code', (job,done) => {
    // gen code
    let id = job.attrs.data.id;
    event.findOneAndUpdate({_id: id}, {$set:{code:''}}).then(result => {
        if (result == null) {
            console.log("remove code encountered null event");
        } else {
            console.log(`${result.name} has ended`);
        }
        done();
    });
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
                let startDateTime = moment(result.startDateTime).format('dddd MMMM Do YYYY, h:mm a')
                let endDateTime = moment(result.endDateTime).format('dddd MMMM Do YYYY, h:mm a')
                let printDate = moment(result.startDateTime).format('dddd MMMM Do YYYY')
                let currEvent = {
                    name:result.name, 
                    startDateTime: startDateTime,
                    endDateTime: endDateTime,
                    printDate: printDate,
                    org: result.org.name,
                    code:result.code
                };
                let signedUsers = [];
                result.signed.forEach((user) => {
                    signedUsers.push(user);
                })
                // render QR Code
                let partialURL = '/student/qrinput?eventID=' + result.id;
                let fullURL = req.protocol+'://'+req.get('host')+partialURL;
                QRCode.toDataURL(fullURL).then(url => {
                    res.render('event', {
                        event:currEvent, 
                        users:signedUsers,
                        url: url
                    });
                })
            } else {
                res.redirect('/org/dashboard');
            }
        });
    }
});

router.get('/createEvent', (req, res) => { 
    res.render('createEvent'); 
}); 

router.post('/createEvent', urlencodedParser, async (req, res) => {
    // extract event details, build event model
    // scheduling
    // if recurring, every day within a range of dates
    // activate code at the event start time and deactivate at event end time
    req.body.startDateTime = moment(req.body.startDateTime).format();
    req.body.endDateTime = moment(req.body.endDateTime).format();
    if (req.body.recurring === 'on') {
        // repeat weekly
        agenda.every('1 week', 'recurrJob', {
            eventDeets: req.body,
            userDeets: req.user
        }, {skipImmediate:true}); // skipImmediate doesn't seem to be working
    }else {
        let newEvent = await buildEvent(req.body, req.user);
        newEvent = await newEvent.save();
        // if not recurring, activate code at start of date, deactivate at end
        agenda.schedule(req.body.startDateTime, 'start code', {id: newEvent.id});
        agenda.schedule(req.body.endDateTime, 'remove code', {id: newEvent.id});
    }
    res.redirect('/org/dashboard');
});

router.get('/id/:id/delete', (req,res) => {
    let eventID = req.params.id;
    event.findOneAndDelete({_id:eventID}).then((result) => {
        res.redirect('/org/dashboard');
    }, (error) => {
        console.log(error);
        res.redirect('/org/dashboard');
    });
    // delete from agenda
    agenda.cancel({data:{id:eventID}}).then((err, numRemoved) => {
        if (err) {
            console.log(err);
        } else {
            console.log(numRemoved);
        }
    })
});

module.exports = router;
