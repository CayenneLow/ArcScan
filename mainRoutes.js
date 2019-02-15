const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({extended: true});
const key = require('./config/keys.js');

// routes
const authRoutes = require('./routes/authRoutes.js');
const stuRoutes = require('./routes/stuRoutes.js');
const orgRoutes = require('./routes/orgRoutes.js');

// database connection
var mongoose = require('mongoose');
mongoose.connect(`mongodb://${key.mongodb.username}:${key.mongodb.password}@ds331135.mlab.com:31135/arcscan`,{useNewUrlParser:true});
const jobModel = require('./models/database.js').job;

module.exports = function(app) {
    app.get('/', (req, res) => { 
        // redirects based on who's logged in
        if (req.user) { 
            if (req.user.type === "org") {
                console.log("Currently logged in:" + req.user.name);
                res.redirect('/org/dashboard');
            } else if (req.user.type === "user") {
                let name = req.user.firstname + " " + req.user.lastname;
                console.log("Currently logged in:" + name);
                res.redirect('/student/input?found=true&event=false&duplicate=false');
            }
        } else {
            console.log("Currently logged in:" + req.user);
            res.render('index');
        }
    });

    app.use('/student', stuRoutes);

    app.use('/org', orgRoutes);

    app.use('/auth', authRoutes);

};
