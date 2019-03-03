const passport = require('passport');
const express = require('express');
const routes = require('./mainRoutes.js');
const key = require('./config/keys');
const bodyParser = require('body-parser').urlencoded({extended:true});
const cookieSession = require('cookie-session');
const tk = require('timekeeper');
// database
const db = require('./models/database.js');
const job = db.job;
const event = db.event;
const user = db.user;
const org = db.org;

const app = express();

// set up template engine
app.set('view engine', 'ejs');

// parser for login form
app.use(bodyParser);

// cookie
app.use(cookieSession({
    maxAge: 365 * 24 * 60 * 60 * 1000,
    keys: key.cookieKey.key
}));

// initialize passport
app.use(passport.initialize());
app.use(passport.session());

// static files
app.use(express.static('./public'));

routes(app);

/*
var time = new Date('March 10, 2019 16:41:45');
tk.travel(time);
console.log(new Date());
*/
// better errors
require('pretty-error').start();
// listen to port
app.listen(3000);
