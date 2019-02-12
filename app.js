const passport = require('passport');
const express = require('express');
const app = express();
//const cookieSession = require('cookie-session');
const routes = require('./routes.js');
const key = require('./config/keys');
const bodyParser = require('body-parser').urlencoded({extended:true});

// set up template engine
app.set('view engine', 'ejs');

// parser for login form
app.use(bodyParser);

// cookie
/*
app.use(cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    key: [key.cookieKey.key]
}));
*/

// static files
app.use(express.static('./public'));

routes(app);

// listen to port
app.listen(3000);
