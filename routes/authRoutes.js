const router = require('express').Router();
const passport = require('passport'); const LocalStrategy = require('passport-local').Strategy; 
const db = require('../models/database.js'); 
const events = db.event;
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({extended: true});
const {signUpUser} = require('./stuRoutes.js'); 

// password encryption
const bcrypt = require('bcrypt');
const saltRounds = 10;

passport.use(new LocalStrategy(
  function(username, password, done) { 
      if (!isNaN(username)) {
        db.user.findOne({ zID: username },function (err, user) {
          if (err) { return done(err); }
          if (!user) { return done(null, false); }

          // user.password is the hash from db
          bcrypt.compare(password, user.password).then(function(res) {
              if (res == false) {
                return done(null,false);
              } else {
                  return done(null, user);
              }
          });

        });
      } else {
          db.org.findOne({username: username}, function (err, user) {
              if (err) {return done(err); }
              if (!user) { return done(null, false);}
              
              // user.password is the hash from db
              bcrypt.compare(password, user.password).then(function(res) {
                  if (res == false) {
                    return done(null,false);
                  } else {
                      return done(null, user);
                  }
              });

          });
      }
  }
));
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id,done) => {
    db.user.findById(id, (err, user) => {
        if (err) {return done(err);}
        else if (!user) {
            // if no user, look in organizers
            db.org.findById(id, (err, org) => {
                if (err) {return done(err)};
                done(null, org);
            })
        } else if (user) {
            done(null, user);
        }
    });
}); 

router.post('/stuLogin', passport.authenticate('local', {
    failureRedirect:'/student/stuLogin?error=true'
    }), (req,res) => {
        if (req.body.qr) {
            events.findOne({_id:req.body.event}).then(result => {
                signUpUser(result, req.user, res);
            });
        } else {
            res.redirect('/student/input?found=true&event=false');
        }
});

router.post('/stuSignUp', urlencodedParser, async (req,res) => {
    if (req.body.zID[0] == 'z' || req.body.zID[0] == 'Z') {
       req.body.zID = req.body.zID.slice(1);
    }
    console.log(req.body.zID);
  let userResult = await db.user.findOne({zID:req.body.zID});
  if (userResult) {
      res.redirect('/student/stuSignUp/?error=zID');
  } else {
    userResult = await db.user.findOne({email:req.body.email});
    if (userResult) {
      res.redirect('/student/stuSignUp/?error=email');
    } else {
      let orgResult = await db.org.findOne({email:req.body.email});
      if (orgResult) {
        res.redirect('/student/stuSignUp/?error=email');
      } else {
        let hash = await bcrypt.hash(req.body.password, saltRounds);
        const newUser = new db.user({
                                      type: "user",
                                      firstname: req.body.firstname,
                                      lastname: req.body.lastname,
                                      zID: req.body.zID,
                                      password: hash,
                                      arc: req.body.arc,
                                      email: req.body.email
                                  });
        newUser.save().then((success) => res.redirect('/student/stuLogin?zID='+newUser.zID),
                                  (error) => {
                                                console.log(error);
                                                  res.redirect('/student/stuSignUp');
                                              });
      }
    }
  }
});

router.post('/orgLogin', passport.authenticate('local', {
                           failureRedirect:'/org/orgLogin?error=true'
                         }), (req,res) => {
                           res.redirect('/org/dashboard');
});

router.post('/orgSignUp', urlencodedParser, async (req,res) => {
  let orgResult = await db.org.findOne({username:req.body.username});
  if (orgResult) {
      res.redirect('/org/orgSignUp/?error=username');
  } else {
    orgResult = await db.org.findOne({email:req.body.email});
    if (orgResult) {
      res.redirect('/org/orgSignUp/?error=email');
    } else {
      let userResult = await db.user.findOne({email:req.body.email});
      if (userResult) {
        res.redirect('/org/orgSignUp/?error=email');
      } else {
        let hash = await bcrypt.hash(req.body.password, saltRounds);
        const newOrg = new db.org({
                                      type: "org",
                                      name: req.body.name,
                                      username: req.body.username,
                                      password: hash,
                                      email: req.body.email
                                  });
              newOrg.save().then(res.redirect('/org/orgLogin?username='+newOrg.username));
      }
    }
  }
});

router.get('/logout', (req,res)=> {
    req.logout();
    res.redirect('/');
})

module.exports = router;
