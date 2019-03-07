function convertToCron(dateString){
    let string = new Date(dateString);
    let minute = string.getMinutes();
    let hour = string.getHours();
    let dayMonth = string.getDate();
    let month = string.getMonth() + 1;
    let dayWeek = string.getDay();
    
    let cron = `${minute} ${hour} ${dayMonth} ${month} ${dayWeek}`
    return cron;
}

function convertDayToNum(dayString) {
    let num;
    switch (dayString) {
        case 'Monday':
            num = 1;
            break;
        case 'Tuesday':
            num = 2;
            break;
        case 'Wednesday':
            num = 3;
            break;
        case 'Thursday':
            num = 4;
            break;
        case 'Friday':
            num = 5;
            break;
        case 'Saturday':
            num = 6;
            break;
        case 'Sunday':
            num = 7;
            break;
    };
    return num;
}

function convertNumToDay(dayNum) {
    console.log(dayNum);
    console.log(typeof dayNum);
    let string;
    switch(dayNum) {
        case 0:
            string = 'Sunday';
            break;
        case 1:
            string = 'Monday';
            break;
        case 2:
            string = 'Tuesday';
            break;
        case 3:
            string = 'Wednesday';
            break;
        case 4:
            string = 'Thursday';
            break;
        case 5:
            string = 'Friday';
            break;
        case 6:
            string = 'Saturday';
            break;
        default:
            string = 'Invalid Number';
            break;
    }
    return string;
}

module.exports = {
    convertToCron: convertToCron,
    convertDayToNum: convertDayToNum,
    convertNumToDay: convertNumToDay
}
