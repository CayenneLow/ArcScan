const router = require('express').Router();
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({extended: true});
const eventRoutes = require('./eventRoutes.js');
const moment = require('moment');

// Database
const db = require('../models/database.js');
const event = db.event;
const user = db.user;
const org = db.org;

router.use('/event', eventRoutes);

router.get('/orgLogin', (req,res) => {
    let error = false;
    if (req.query.error) {
        error = true;
    }
    res.render('orgLogin', { 
        error: error, 
        client:req.user,
        username: req.query.username
    });
})


router.get('/orgSignUp', (req,res) => {
    res.render('orgSignUp', {error: req.query.error});
})

router.get('/dashboard', (req,res) => {
    if (req.user && req.user.type === 'org'){
        let t0 = Date.now();
        // querying for events associated to org
        event.find({'org._id':req.user.id.toString()}).then((events) => {
            if (events.length > 0) {
                events.forEach((event) => {
                    event.printDate = moment(event.startDateTime).format('dddd MMMM Do YYYY, h:mm a')
                });
                res.render('orgDashboard', {events:events, user:req.user});
                let t1 = Date.now();
                console.log(`Listed events in ${t1-t0} milliseconds`);
            } else {
                res.render('orgDashboard', {events:events, user:req.user});
            }
        }, (error) => {console.log(error)});
    } else {
        res.redirect('/org/orgLogin');
    }
});

module.exports = router;
