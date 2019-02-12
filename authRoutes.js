const router = require('express').Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const db = require('./models/database.js');

const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({extended: true});

passport.use(new LocalStrategy( {usernameField: 'zID'},
  function(username, password, done) {
    db.user.findOne({ zID: username },function (err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      if (user.password != password) { return done(null, false); }
      return done(null, user);
    });
  }
));

passport.serializeUser((user, cb) => {
    cb(null, user.id);
});

passport.deserializeUser((id,cb) => {
    db.user.findOne({id:id}, (err, user) => {
        if (err) {return cb(err);}
        cb(null, user);
    });
});

router.use(passport.initialize());

router.post('/login', passport.authenticate('local', {
    failureRedirect:'/student-fail'
    }), (req,res) => {
    res.send(req.user);
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



module.exports = router;
