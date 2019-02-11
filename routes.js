var bodyParser = require('body-parser');
var {randomNumber} = require('./RNG.js');
var urlencodedParser = bodyParser.urlencoded({extended: false});

// database
var mongoose = require('mongoose');
mongoose.connect('mongodb://admin:Admin123@ds331135.mlab.com:31135/arcscan',{useNewUrlParser:true});
// models
const database = require('./models/database.js'); 
const user = database.user;
const event = database.event;
const org = database.org;

const testUser = new user({
    firstname: 'Khye',
    lastname: 'Low',
    zID: 5173671,
    email: 'lowkhyeean@gmail.com'
})

/*
const newEvent = new event({
    name: 'Barbeque',
    date: Date(),
    signed: newUser
});

newEvent.save();
*/

module.exports = function(app) {
    app.get('/', (req, res) => {
        res.render('index');
    });

    app.get('/student', (req,res) => {
        res.render('student', {found:true});
    });
    
    app.post('/student', urlencodedParser, (req, res) => {
        let inputCode = req.body.inputCode;
        // query the event that has the code
        event.findOne({code:inputCode}).then(result => {
            if (result != null) {
                res.render('student-success', {event:result.name});
            } else {
                res.render('student', {found: false});
            }
        })
    });

    app.get('/organization', (req,res) => {
        res.render('organization', {events:events});
    });

    app.get('/event/:id', (req,res) => {
        let id = req.params.id - 1;
        res.render('event', {event: events[id]});
    });
    
    app.get('/createEvent', (req, res) => {
        res.render('createEvent');
    });
    
    app.post('/createEvent', urlencodedParser, (req, res) => {
        let newCode = randomNumber();

        // creates new Event and pushes to database
        const newEvent = new event({
            name: req.body.name,
            date: Date(),
            code: newCode,
            signed: testUser
        });

        newEvent.save();

        res.render('createEvent');
    })
};
