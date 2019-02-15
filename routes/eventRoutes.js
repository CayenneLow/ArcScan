const router = require('express').Router();
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({extended: true});
let randomNumber = require('../functions/RNG.js');
let convertToCron = require('../functions/convertToCron.js');
let moment = require('moment');
let schedule = require('node-schedule');

// Database
const db = require('../models/database.js');
const event = db.event;
const user = db.user;
const org = db.org;

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
                });
                res.render('event', {event:currEvent, users:signedUsers});
            } else {
                res.redirect('/org/dashboard');
            }
        });
    }
});

router.get('/createEvent', (req, res) => {
    res.render('createEvent');
});

router.post('/createEvent', urlencodedParser, (req, res) => {
    let newCode = randomNumber();
    event.findOne({code:newCode}).then((result) => {
        if (result != null) {
            let bufferCode;
            while(newCode === result.code) {
                console.log("Duplicate code: generating new code");
                bufferCode = randomNumber();
            }
            return bufferCode;
        } else {
            return newCode;
        }
    }).then((newCode) => {
        // creates new Event and pushes to database
        let newEvent = new event({
            type: "event",
            name: req.body.name,
            code: newCode,
            org: req.user,
            startDateTime: req.body.startDateTime,
            endDateTime: req.body.endDateTime,
        });

        if (req.body.recurring == 'on') {
            newEvent.recurring = req.body.recurring;
            newEvent.daySelection = req.body.daySelection;
            newEvent.recurrFrom = req.body.recurrFrom;
            newEvent.recurrTo = req.body.recurrTo;
        }
        newEvent.save().then(result => {
            let startDateTime = moment(result.startDateTime).format();
            let endDateTime = moment(result.endDateTime).format();
            if (req.body.recurring == 'on') {
                // if recurring, create a new event with same details and expire 
                // code of first event
                // cronTime is the day and time to start
                let cronTime = convertToCron(true, {
                    day: result.daySelection,
                    start: result.recurrFrom 
                });
                
                var j = schedule.scheduleJob({
                    start: startDateTime,
                    end: endDateTime,
                    rule: cronTime
                }, () => {
                    let newCode = randomNumber();
                    event.findOne({code:newCode}).then((result) => {
                        if (result != null) {
                            let bufferCode;
                            while(newCode === result.code) {
                                console.log("Duplicate code: generating new code");
                                bufferCode = randomNumber();
                            }
                            return bufferCode;
                        } else {
                            return newCode;
                        }
                    }).then((newCode) => {
                        let newEvent = new event({
                            type: "event",
                            name: result.name,
                            code: newCode,
                            org: result.org
                        });
                        newEvent.save();
                    })
                    // expire current event code
                    event.findOneAndUpdate({_id:result.id},{$set: {code:''} }).then(result => {
                        console.log(`${result.name}'s code has expired`);
                    })
                });
            } else {
                // all for scheduling
                let cronTime = convertToCron(false, {endDateTime: endDateTime});
                var j = schedule.scheduleJob({ 
                    start: startDateTime, 
                    end: endDateTime, 
                    rule: cronTime 
                }, () => {
                    // remove event code
                    event.findOneAndUpdate({_id:result.id},{$set: {code:''} }).then(result => {
                        console.log(`${result.name}'s code has expired`);
                    })
                });
            }
        });

        res.redirect('/org/dashboard');
    });
})

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
