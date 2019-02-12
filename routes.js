const bodyParser = require('body-parser');
const {randomNumber} = require('./RNG.js');
const urlencodedParser = bodyParser.urlencoded({extended: true});
const key = require('./config/keys.js');
const authRoutes = require('./authRoutes.js');


// database
var mongoose = require('mongoose');
mongoose.connect(`mongodb://${key.mongodb.username}:${key.mongodb.password}@ds331135.mlab.com:31135/arcscan`,{useNewUrlParser:true});
// models
const database = require('./models/database.js'); 
const user = database.user;
const event = database.event;
const org = database.org;

const testUser = new user({
    firstname: 'Khye',
    lastname: 'Low',
    password: 'abc',
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

    // student routes
    app.get('/student', (req,res) => {
        let emptyUser = {zID: "", password:""};
        res.render('login', {user:emptyUser});
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

    app.get('/student-fail', (req, res) => {
        res.render('student-fail');
    });
    ////////////////////

    app.get('/signup', (req,res) => {
        res.render('signup');
    });

    app.use('/auth', authRoutes);

    app.get('/organization', (req,res) => {
        // find all events
        event.find({}).then((events) => {
            let eventArray = [];
            events.forEach((event) => {
                eventArray.push({id: event.id, name: event.name});
            });
            res.render('organization', {events:eventArray});
        })
    });

    app.get('/event/:id', (req,res) => {
        // need name and code
        event.findOne({_id: req.params.id.toString()}).then((result) => {
            let currEvent = {name:result.name, code:result.code};
            res.render('event', {event:currEvent});
        })
    });
    
    app.get('/createEvent', (req, res) => {
        res.render('createEvent');
    });
    
    app.post('/createEvent', urlencodedParser, (req, res) => {
        let newCode = randomNumber();
        event.findOne({code:newCode}).then((result) => {
            if (result != null) {
                let bufferCode;
                while(newCode === result.code) {
                    console.log("generating new code...");
                    bufferCode = randomNumber();
                }
                return bufferCode;
            } else {
                return newCode;
            }
        }).then((newCode) => {
            // creates new Event and pushes to database
            const newEvent = new event({
                name: req.body.name,
                date: Date(),
                code: newCode,
                signed: testUser
            });

            newEvent.save();

            res.redirect('/organization');
        });
    })
};
