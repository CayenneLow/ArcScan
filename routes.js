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




module.exports = function(app) {
    app.get('/', (req, res) => {
        console.log("Currently logged in: " + req.user);
        res.render('index');
    });

    app.get('/login', (req, res) => {
        let emptyUser = {zID: "", password:""};
        res.render('login', {user:emptyUser});
    })

    app.get('/orglogin', (req,res) => {
        let emptyOrg = {username: "", password:""};
        res.render('orglogin', {org:emptyOrg});
    })

    // student routes
    app.get('/student', (req,res) => {
        res.render('student', {found:true});
    });

    app.post('/student', urlencodedParser, (req, res) => {
        let inputCode = req.body.inputCode;
        // query the event that has the code
        event.findOne({code:inputCode}).then(result => {
            if (result != null) {
            // Note for future: the ".then" is essential for update to work
                event.update({_id:result.id}, {$push : {signed:req.user}})
                .then(()=>console.log("Logged"),(reject)=>console.log(reject));
                res.render('student-success', {event:result.name});
            } else {
                res.render('student', {found: false});
            }
        });
    });

    app.get('/student-fail', (req, res) => {
        res.render('student-fail');
    });
    ////////////////////

    app.get('/signup', (req,res) => {
        res.render('signup');
    });

    app.get('/orgsignup', (req,res) => {
        res.render('orgsignup');
    })

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
            console.log(req.user);
        res.render('createEvent');
    });
    
    app.post('/createEvent', urlencodedParser, (req, res) => {
            console.log(req.user);
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
            const signOrg = new org({
                name: req.user.name,
                username: req.user.username,
                password: req.user.password,
                email: req.user.email
            })
            // creates new Event and pushes to database
            let newEvent = new event({
                name: req.body.name,
                date: Date(),
                code: newCode,
                org: signOrg
            });

            newEvent.save();

            res.redirect('/organization');
        });
    })
};
