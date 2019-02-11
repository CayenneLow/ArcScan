const mongoose = require('mongoose');
require('mongoose-type-email');

const userSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    zID: Number,
    email: mongoose.SchemaTypes.Email
})

const orgSchema = new mongoose.Schema({
    name: String,
    email: mongoose.SchemaTypes.Email
})

const eventSchema = new mongoose.Schema({
    name: String,
    date: Date,
    code: Number,
    signed: [userSchema]
})

const user = mongoose.model('user', userSchema);
const org = mongoose.model('org', orgSchema);
const event = mongoose.model('event', eventSchema);

module.exports.user = user;
module.exports.org = org;
module.exports.event = event;
