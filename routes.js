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
        if (req.user) {
            if (req.user.type === "org") {
                res.redirect('/organization');
            } else if (req.user.type === "user") {
                res.redirect('/student');
            }
        } else {
            res.render('index');
        }
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
        res.render('student', {found:true, user:req.user});
    });

    app.post('/student', urlencodedParser, (req, res) => {
        let inputCode = req.body.inputCode;
        // query the event that has the code
        event.findOne({code:inputCode}).then(result => {
            if (result != null) {
            // Note for future: the ".then" is essential for update to work
                event.update({_id:result.id}, {$push : {signed:req.user}})
                .then(()=>console.log("Signed Up"),(reject)=>console.log(reject));
                res.render('student-success', {event:result.name});
            } else {
                res.render('student', {found: false, user: req.user});
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
            res.render('organization', {events:eventArray, user:req.user});
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
            let newEvent = new event({
                type: "event",
                name: req.body.name,
                date: Date(),
                code: newCode,
                org: req.user
            });

            newEvent.save().then((result) => console.log(result));;

            res.redirect('/organization');
        });
    })
};
