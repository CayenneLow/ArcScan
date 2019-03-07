const router = require('express').Router();
const bodyParser = require('body-parser'); const urlencodedParser = bodyParser.urlencoded({extended: true});

// Database
const db = require('../models/database.js');
const event = db.event;
const user = db.user;
const org = db.org;

router.get('/stuLogin', (req, res) => {
    let error = false;
    if (req.query.error) {
        error = true;
    }
    let qr = false;
    if (req.query.qr) {
        qr = true;
        event.findOne({_id:req.query.event}).then(result => {
            res.render('studentLogin', {
                error:error, 
                client:req.user,
                qr:qr, 
                event:result.id
            });
        });
    } else {
        res.render('studentLogin', {
            error:error, 
            client:req.user,
            qr:qr,
            event:null
        });
    }
});

router.get('/stuSignUp', (req,res) => {
    res.render('studentSignUp', {error: req.query.error});
});

router.get('/input', (req,res) => {
    // make sure only logged in users can access
    if (req.user && req.user.type === 'user'){
        let passIn = {
            event: req.query.event,
            found: req.query.found,
            duplicate: req.query.duplicate,
            user:req.user
        };
        res.render('studentInput', passIn);
    } else {
        res.redirect('/student/stuLogin');
    }
});

router.post('/input', urlencodedParser, (req, res) => {
    let inputCode = req.body.inputCode;
    // query the event that has the code
    event.findOne({code:inputCode}).then(result => {
        if (result != null) {
            signUpUser(result, req.user, res);
        } else {
            res.redirect('/student/input?found=false&event=false&duplicate=true');
        }
    });
});

router.get('/qrinput', (req,res) => {
    let eventID = req.query.eventID;
    if (req.user && req.user.type === 'user') {
        event.findOne({_id:eventID}).then(result => {
            console.log(result);
            if (result != null) {
                signUpUser(result, req.user, res);
            } else {
                res.redirect('/student/input?found=false&event=false&duplicate=true');
            }
        })
    } else {
        res.redirect('/student/stuLogin?qr=true&event='+eventID);
    }
});


// event: event object
// user: req.user object
async function signUpUser(eventObj, user, res){
    // check for duplicate signup
    let comparisonArray = eventObj.signed.map((sign) => {
        // first construct an array of all signed ids
       return sign.id;
    }).filter(id => {
        return id == user.id;
    });
    
    if(comparisonArray.length < 1) {
        // Note for future: the ".then" is essential for update to work
        let ended = eventObj.code == null ? true : false;
        if (!ended) {
            event.update({_id:eventObj.id}, {$push : {signed:user}})
                .then(()=> {
                    console.log("Signed Up")
                },(reject)=> {
                    console.log(reject);
                });
            res.redirect('/student/input?found=true&event=' + eventObj.name);
        } else {
            res.redirect('/student/input?found=true&event=ended');
        }
    } else {
        res.redirect('/student/input?found=true&event=false&duplicate=true')
    }
}
module.exports.router = router;
module.exports.signUpUser = signUpUser;
