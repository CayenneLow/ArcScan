let express = require('express');
let app = express();
let routes = require('./routes.js');

// set up template engine
app.set('view engine', 'ejs');

// static files
app.use(express.static('./public'));

routes(app);

// listen to port
app.listen(3000);
