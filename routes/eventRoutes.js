const router = require('express').Router();
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({extended: true});
let randomNumber = require('../RNG.js')

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
            let currEvent = {name:result.name, code:result.code};
            let signedUsers = [];
            result.signed.forEach((user) => {
                signedUsers.push(user);
            });
            res.render('event', {event:currEvent, users:signedUsers});
        });
    }
});

router.get('/createEvent', (req, res) => {
    res.render('createEvent');
});

router.post('/createEvent', urlencodedParser, (req, res) => {
    console.log(req.body);
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
            date: Date(),
            code: newCode,
            org: req.user
        });

        newEvent.save();

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
