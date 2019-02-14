const mongoose = require('mongoose');
require('mongoose-type-email');

const userSchema = new mongoose.Schema({
    type: String,
    firstname: String,
    lastname: String,
    zID: Number,
    password: String,
    email: mongoose.SchemaTypes.Email
})

const orgSchema = new mongoose.Schema({
    type: String,
    name: String,
    username: String,
    password: String,
    email: mongoose.SchemaTypes.Email
})

const eventSchema = new mongoose.Schema({
    type: String,
    name: String,
    startDate: Date,
    startTime: String,
    endDate: Date,
    endTime: String,
    recurring: String,
    daySelection: String,
    recurrFrom: String,
    recurrTo: String,
    code: Number,
    org: orgSchema,
    signed: [userSchema]
})

const user = mongoose.model('user', userSchema);
const org = mongoose.model('org', orgSchema);
const event = mongoose.model('event', eventSchema);

module.exports.user = user;
module.exports.org = org;
module.exports.event = event;
