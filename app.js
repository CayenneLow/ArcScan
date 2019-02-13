const passport = require('passport');
const express = require('express');
const routes = require('./routes.js');
const key = require('./config/keys');
const bodyParser = require('body-parser').urlencoded({extended:true});
const cookieSession = require('cookie-session');

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

// listen to port
app.listen(3000);
