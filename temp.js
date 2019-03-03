let newCode = randomNumber();
event.findOne({code:newCode}).then((result) => {
    if (result != null) {
        let bufferCode;
        while(newCode === result.code) {
            console.log("Duplicate code: generating new code");
            bufferCode = randomNumber();
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
    newEvent.save().then(result => {
        let startDateTime = moment(result.startDateTime).format();
        let endDateTime = moment(result.endDateTime).format();
        if (req.body.recurring == 'on') {
            // if recurring, create a new event with same details and expire 
            // code of first event
            // cronTime is the day and time to start
            let cronTime = convertToCron(true, {
                day: result.daySelection,
                start: result.recurrFrom 
            });
            
            var j = schedule.scheduleJob({
                start: startDateTime,
                end: endDateTime,
                rule: cronTime
            }, () => {
                let newCode = randomNumber();
                event.findOne({code:newCode}).then((result) => {
                    if (result != null) {
                        let bufferCode;
                        while(newCode === result.code) {
                            console.log("Duplicate code: generating new code");
                            bufferCode = randomNumber();
                        }
                        return bufferCode;
                    } else {
                        return newCode;
                    }
                }).then((newCode) => {
                    let newEvent = new event({
                        type: "event",
                        name: result.name,
                        code: newCode,
                        org: result.org
                    });
                    newEvent.save();
                })
                // expire current event code
                event.findOneAndUpdate({_id:result.id},{$set: {code:''} }).then(result => {
                    console.log(`${result.name}'s code has expired`);
                })
            });
        } else {
            // all for scheduling
            let cronTime = convertToCron(false, {endDateTime: endDateTime});
            var j = schedule.scheduleJob({ 
                start: startDateTime, 
                end: endDateTime, 
                rule: cronTime 
            }, () => {
                // remove event code
                event.findOneAndUpdate({_id:result.id},{$set: {code:''} }).then(result => {
                    console.log(`${result.name}'s code has expired`);
                })
            });
        }
    });

    res.redirect('/org/dashboard');
});
