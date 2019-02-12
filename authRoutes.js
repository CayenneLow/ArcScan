const router = require('express').Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const db = require('./models/database.js');

const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({extended: true});

passport.use(new LocalStrategy( {usernameField: 'zID'},
  function(username, password, done) {
    console.log("hi");
    db.user.findOne({ zID: username },function (err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      if (user.password != password) { return done(null, false); }
      return done(null, user);
    });
  }
));

passport.serializeUser((user,cb) => {
    cb(null, user.id);
});

router.use(passport.initialize());
router.use(passport.session());

router.post('/login', passport.authenticate('local', {
    failureRedirect:'/student'
    }), (req,res) => {
    res.send("hi");
});

router.post('/signup', urlencodedParser, (req,res) => {
    res.send(req.body);
})



module.exports = router;
