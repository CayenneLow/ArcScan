const mongoose = require('mongoose');
require('mongoose-type-email');
require('mongoose-function')(mongoose);

const userSchema = new mongoose.Schema({
    type: String,
    firstname: String,
    lastname: String,
    zID: Number,
    password: String,
    arc: String,
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
    startDateTime: String,
    endDateTime: String,
    recurring: String,
    recurrEnd: String,
    code: Number,
    org: orgSchema,
    signed: [userSchema]
})

const jobSchema = new mongoose.Schema({
    startTime: Date,
    endTime: Date,
    rule: String,
    action: Function,
    pending: Boolean
})

const user = mongoose.model('user', userSchema);
const org = mongoose.model('org', orgSchema);
const event = mongoose.model('event', eventSchema);
const job = mongoose.model('job', jobSchema);

module.exports.user = user;
module.exports.org = org;
module.exports.event = event;
module.exports.job = job;
