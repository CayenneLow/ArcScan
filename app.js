const passport = require('passport');
const express = require('express');
const routes = require('./mainRoutes.js');
const key = require('./config/keys');
const bodyParser = require('body-parser').urlencoded({extended:true});
const cookieSession = require('cookie-session');
let connectionURL = `mongodb://${key.mongodb.username}:${key.mongodb.password}@ds331135.mlab.com:31135/arcscan`
const Agenda = require('agenda');
const agenda = new Agenda({db:{address: connectionURL, options:{useNewUrlParser: true}}});
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

// scheduling
(async function() {
    await agenda.start();
})();

// listen to port
app.listen(3000);
