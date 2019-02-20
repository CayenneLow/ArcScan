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

module.exports = convertToCron;
