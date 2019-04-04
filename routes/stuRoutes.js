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
                zID:'',
                event:result.id
            });
        });
    } else {
        res.render('studentLogin', {
            error:error, 
            client:req.user,
            qr:qr,
            zID: req.query.zID,
            event:null
        });
    }
});

router.get('/stuSignUp', (req,res) => {
    res.render('studentSignUp', {error: req.query.error});
});

router.get('/profile/:id', async (req,res) => {
    let userID = req.params.id;
    let userResult;
    if (req.query.arc == 'true') {
        userResult = await user.findOneAndUpdate({_id : userID}, {$set:{arc:'on'}}, {new: true});
    } else if (req.query.arc == 'false'){
        userResult = await user.findOneAndUpdate({_id : userID}, {$set:{arc:'off'}}, {new: true});
    } else {
        userResult = await user.findOne({_id:userID});
    }
    res.render('stuProfile', {user: userResult});
}); 

router.get('/input', (req,res) => {
    // make sure only logged in users can access
    if (req.user && req.user.type === 'user'){
        let passIn = {
            event: req.query.event,
            found: req.query.found,
            duplicate: req.query.duplicate,
            user:req.user,
            location:req.query.location
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
            signUpUser(result, req.user, res, req);
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
                signUpUser(result, req.user, res, req);
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
async function signUpUser(eventObj, user, res, req){
    // check for duplicate signup
    let comparisonArray = eventObj.signed.map((sign) => {
        // first construct an array of all signed ids
       return sign.id;
    }).filter(id => {
        return id == user.id;
    });
    
    if(comparisonArray.length < 1) {
        let ended = eventObj.code == null ? true : false;
        if (!ended && checkLoc(req, eventObj)) {
            // Note for future: the ".then" is essential for update to work
            event.update({_id:eventObj.id}, {$push : {signed:user}})
                .then(()=> {
                    console.log("Signed Up")
                },(reject)=> {
                    console.log(reject);
                });
            res.redirect('/student/input?found=true&event=' + eventObj.name);
        } else {
            if (ended) {
                res.redirect('/student/input?found=true&event=ended');
            } else {
                // location error
                res.redirect('/student/input?found=true&location=false');
            }
        }
    } else {
        res.redirect('/student/input?found=true&event=false&duplicate=true')
    }
}

function checkLoc(req, eventObj) {
    let long = Number(req.body.long);
    let lat = Number(req.body.lat);
    let offset = 0.0000089; 
    // obtained from: https://stackoverflow.com/questions/7477003/calculating-new-longitude-latitude-from-old-n-meters
    // long
    let upBoundLong = 50 * offset + eventObj.long;
    let lowBoundLong = 50 * offset - eventObj.long;
    // lat
    let upBoundLat = 50 * offset + eventObj.lat;
    let lowBoundLat = 50 * offset - eventObj.lat;

    // check
    if (long >= lowBoundLong && long <= upBoundLong) {
        if (lat >= lowBoundLat && lat <= upBoundLat) {
            return true;
        }
    }
    return false;
}

module.exports.router = router;
module.exports.signUpUser = signUpUser;
