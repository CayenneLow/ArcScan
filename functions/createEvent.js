let event = require('../models/database.js').event;
let genCode = require('../functions/RNG.js');

function createEvent(req) {
    event.findOne({code:genCode()}).then((result) => {
        if (result != null) {
            let bufferCode;
            while(newCode === result.code) {
                console.log("Duplicate code: generating new code");
                bufferCode = genCode();
            }
            return bufferCode;
        } else {
            return newCode;
        }
    }).then((newCode) => {
        // creates new Event and pushes to database
        let newEvent = new event({
            type: "event",
            name: req.body.name,
            code: newCode,
            org: req.user,
            startDateTime: req.body.startDateTime,
            endDateTime: req.body.endDateTime,
        });

        if (req.body.recurring == 'on') {
            newEvent.recurring = req.body.recurring;
            newEvent.daySelection = req.body.daySelection;
            newEvent.recurrFrom = req.body.recurrFrom;
            newEvent.recurrTo = req.body.recurrTo;
        }
        newEvent.save()
    });
}
