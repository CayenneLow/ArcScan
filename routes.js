var bodyParser = require('body-parser');
var {randomNumber} = require('./RNG.js');
var urlencodedParser = bodyParser.urlencoded({extended: false});


module.exports = function(app) {
    app.get('/', (req, res) => {
        res.render('index');
    });

    app.get('/student', (req,res) => {
        res.render('student', {found:true});
    });
    
    let events = [{id:1, name:'Hackathon', code:randomNumber()}, {id:2, name:'Barbeque', code:randomNumber()}];

    app.post('/student', urlencodedParser, (req, res) => {
        let returnEvent;
        let inputCode = req.body.inputCode;
        events.forEach(event => {
            if (event.code == inputCode) {
               returnEvent = event; 
            }
        }); 
        if(returnEvent != undefined){
            res.render('student-success', {event:returnEvent});
        } else {
            res.render('student', {found: false});
        }
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
        events.push({id:events.length+1, name:req.body.name, code:newCode});
        console.log(events);
        res.render('createEvent');
    })
};
