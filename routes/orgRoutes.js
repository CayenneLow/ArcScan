const router = require('express').Router();
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({extended: true});
const eventRoutes = require('./eventRoutes.js');

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
    res.render('orgLogin', { error: error, client:req.user});
})


router.get('/orgSignUp', (req,res) => {
    res.render('orgSignUp', {error: req.query.error});
})

router.get('/dashboard', (req,res) => {
    if (req.user && req.user.type === 'org'){
        // temporary solution
        // find all events
        let t0 = Date.now();
        let eventArray = [];
        event.find({}).then((events)=> {
            events.forEach((event) => {
               eventArray.push(event); 
            })
            if (req.user){
                eventArray = eventArray.filter(event => event.org.id == req.user.id.toString());
            } else {
                eventArray = [];
            }
            res.render('orgDashboard', {events:eventArray, user:req.user});
        });
        let t1 = Date.now();
        console.log(`${t1-t0} milliseconds`);

        /*
        event.find({org: {_id:orgID}}).then((events) => {
            console.log(events);
            let eventArray = [];
            events.forEach((event) => {
                eventArray.push({id: event.id, name: event.name});
            });
            res.render('organization', {events:eventArray});
        }, (error) => {console.log(error)});
        */
    } else {
        res.redirect('/org/orgLogin');
    }
});

module.exports = router;
