const router = require('express').Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const db = require('./models/database.js');

const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({extended: true});

passport.use(new LocalStrategy(
  function(username, password, done) {
      if (typeof username === "number") {
        db.user.findOne({ zID: username },function (err, user) {
          if (err) { return done(err); }
          if (!user) { return done(null, false); }
          if (user.password != password) { return done(null, false); }
          return done(null, user);
          });
      } else {
          db.org.findOne({username: username}, function (err, org) {
              if (err) {return done(err); }
              if (!org) { return done(null, false);}
              if (org.password != password) { return done(null, false); }
              return done(null, org);
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
        done(null, user);
    });
});

router.post('/login', passport.authenticate('local', {
    failureRedirect:'/student-fail'
    }), (req,res) => {
    res.redirect('/student')
});

router.post('/signup', urlencodedParser, (req,res) => {
    const newUser = new db.user({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        zID: req.body.zID,
        password: req.body.password,
        email: req.body.email
    });

    newUser.save().then(res.render('login',{user:newUser}));
});

router.post('/orglogin', passport.authenticate('local', {
    failureRedirect:'/orglogin'
    }), (req,res) => {
    res.redirect('/organization')
});

router.post('/orgsignup', urlencodedParser, (req,res) => {
    const newOrg = new db.org({
        name: req.body.name,
        username: req.body.username,
        password: req.body.password,
        email: req.body.email
    });

    newOrg.save().then(res.render('orglogin',{org:newOrg}));
});

router.get('/logout', (req,res)=> {
    req.logout();
    res.redirect('/');
})

module.exports = router;
