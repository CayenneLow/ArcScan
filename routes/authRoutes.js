const router = require('express').Router();
const passport = require('passport'); const LocalStrategy = require('passport-local').Strategy; const db = require('../models/database.js'); 
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({extended: true});

passport.use(new LocalStrategy(
  function(username, password, done) { 
      if (!isNaN(username)) {
        db.user.findOne({ zID: username },function (err, user) {
          if (err) { return done(err); }
          if (!user) { return done(null, false); }
          if (user.password != password) { return done(null, false); }
          return done(null, user);
          });
      } else {
          db.org.findOne({username: username}, function (err, user) {
              if (err) {return done(err); }
              if (!user) { return done(null, false);}
              if (user.password != password) { return done(null, false); }
              return done(null, user);
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
    failureRedirect:'/student/student-fail'
    }), (req,res) => {
    console.log("Welcome back " + req.user.firstname);
    res.redirect('/student/input')
});

router.post('/stuSignUp', urlencodedParser, (req,res) => {
    const newUser = new db.user({
        type: "user",
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        zID: req.body.zID,
        password: req.body.password,
        email: req.body.email
    });
    
    db.user.findOne({zID:newUser.zID}).then((result)=>{
        if (result) {
            res.redirect('/student/stuSignUp/?error=true');
        } else {
            newUser.save().then(() => res.render('studentLogin',{client:req.user}),
                                (error) => {
                                    console.log(error);
                                    res.redirect('/student/stuSignUp');
                                });
        }
    })

});

router.post('/orgLogin', passport.authenticate('local', {
    failureRedirect:'/orgLogin'
    }), (req,res) => {
    console.log(req.user);
    res.redirect('/org/dashboard');
});

router.post('/orgSignUp', urlencodedParser, (req,res) => {
    const newOrg = new db.org({
        type: "org",
        name: req.body.name,
        username: req.body.username,
        password: req.body.password,
        email: req.body.email
    });

    newOrg.save().then(res.render('orgLogin',{client:req.user}));
});

router.get('/logout', (req,res)=> {
    req.logout();
    res.redirect('/');
})

module.exports = router;
