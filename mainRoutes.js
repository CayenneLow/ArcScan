const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({extended: true});
const key = require('./config/keys.js');

// routes
const authRoutes = require('./routes/authRoutes.js');
const stuRoutes = require('./routes/stuRoutes.js').router;
const orgRoutes = require('./routes/orgRoutes.js');

// database connection
var mongoose = require('mongoose');
mongoose.connect(`mongodb://${key.mongodb.username}:${key.mongodb.password}@ds331135.mlab.com:31135/arcscan`,{useNewUrlParser:true});

module.exports = function(app) {
    app.get('/', (req, res) => { 
        res.set({
            'Content-Type': 'text/html; charset=utf-8',
            'Access-Control-Allow-Origin' : '*'
        });
        // redirects based on who's logged in
        if (req.user) { 
            if (req.user.type === "org") {
                res.redirect('/org/dashboard');
            } else if (req.user.type === "user") {
                let name = req.user.firstname + " " + req.user.lastname;
                res.redirect('/student/input?found=true&event=false&duplicate=false');
            }
        } else {
            res.render('index');
        }
    });

    app.use('/student', stuRoutes);

    app.use('/org', orgRoutes);

    app.use('/auth', authRoutes);

};
