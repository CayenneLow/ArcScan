const router = require('express').Router();
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({extended: true});

// Database
const db = require('../models/database.js');
const event = db.event;
const user = db.user;
const org = db.org;

router.get('/stuLogin', (req, res) => {
    res.render('studentLogin', {client:req.user});
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
        // Note for future: the ".then" is essential for update to work
            event.update({_id:result.id}, {$push : {signed:req.user}})
            .then(()=>console.log("Signed Up"),(reject)=>console.log(reject));
            res.redirect('/student/input?found=true&event=' + result.name);
        } else {
            res.redirect('/student/input?found=false&event=false');
        }
    });
});

router.get('/student-fail', (req, res) => {
    res.render('student-fail');
});

module.exports = router;
