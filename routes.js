const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({extended: true});
const key = require('./config/keys.js');

// routes
const authRoutes = require('./routes/authRoutes.js');
const stuRoutes = require('./routes/stuRoutes.js');
const orgRoutes = require('./routes/orgRoutes.js');

// database
var mongoose = require('mongoose');
mongoose.connect(`mongodb://${key.mongodb.username}:${key.mongodb.password}@ds331135.mlab.com:31135/arcscan`,{useNewUrlParser:true});
// models
const database = require('./models/database.js'); 
const user = database.user;
const event = database.event;
const org = database.org;

module.exports = function(app) {
    app.get('/', (req, res) => { console.log("Currently logged in: " + req.user); 
        if (req.user) { 
            if (req.user.type === "org") {
                res.redirect('/org/dashboard');
            } else if (req.user.type === "user") {
                res.redirect('/student/input');
            }
        } else {
            res.render('index');
        }
    });

    app.use('/student', stuRoutes);

    app.use('/org', orgRoutes);

    app.use('/auth', authRoutes);

};
