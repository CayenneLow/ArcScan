const router = require('express').Router();
const passport = require('passport'); const LocalStrategy = require('passport-local').Strategy; const db = require('../models/database.js'); 
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({extended: true});

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
    res.redirect('/student/input?found=true&event=false');
});

router.post('/stuSignUp', urlencodedParser, (req,res) => {

    db.user.findOne({zID:req.body.zID}).then((result)=>{
        if (result) {
            res.redirect('/student/stuSignUp/?error=zID');
        } else {
            db.user.findOne({email:req.body.email}).then((result => {
                if(result) {
                    res.redirect('/student/stuSignUp/?error=email');
                } else {
                    db.org.findOne({email:req.body.email}).then((result => {
                        if (result) {
                            res.redirect('/student/stuSignUp/?error=email');
                        } else {
                            bcrypt.hash(req.body.password, saltRounds).then(hash => {
                                // store hash in db
                                const newUser = new db.user({
                                    type: "user",
                                    firstname: req.body.firstname,
                                    lastname: req.body.lastname,
                                    zID: req.body.zID,
                                    password: hash,
                                    email: req.body.email
                                });
                                newUser.save().then((success) => res.render('studentLogin',{client:req.user}),
                                                    (error) => {
                                                        console.log(error);
                                                        res.redirect('/student/stuSignUp');
                                                    });
                            });

                        }
                    }));
                }
            }));
        }
    });
});

router.post('/orgLogin', passport.authenticate('local', {
                           failureRedirect:'/orgLogin'
                         }), (req,res) => {
                           res.redirect('/org/dashboard');
});

router.post('/orgSignUp', urlencodedParser, (req,res) => {
    db.org.findOne({username:req.body.username}).then((result) => {
        if (result) {
            res.redirect('/org/orgSignUp/?error=username');
        } else {
            db.org.findOne({email:req.body.email}).then((result) => {
                if (result) {
                    res.redirect('/org/orgSignUp/?error=email');
                } else {
                    db.user.findOne({email:req.body.email}).then((result) => {
                        if (result) {
                            res.redirect('/org/orgSignUp/?error=email');
                        } else {
                            bcrypt.hash(req.body.password, saltRounds).then(hash => {
                                const newOrg = new db.org({
                                    type: "org",
                                    name: req.body.name,
                                    username: req.body.username,
                                    password: hash,
                                    email: req.body.email
                                });
                                newOrg.save().then(res.render('orgLogin',{client:req.user}));
                            });
                        }
                    });
                }
            });
        }
    });

});

router.get('/logout', (req,res)=> {
    req.logout();
    res.redirect('/');
})

module.exports = router;
