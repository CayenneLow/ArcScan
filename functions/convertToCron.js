function convertToCron(recurr, dateobj){
    let mins, hour, dayofmonth, month, dayofweek; 
    if (recurr) {
      let day = convertDayToNum(dateobj.day);
      let starttime = dateobj.time;
      let timeArr = starttime.split(':');
    
      mins = timeArr[1];
      hour = timeArr[0];
      dayofmonth = new schedule.Range(1,31);
      month = new schedule.Range(1,12);
      dayofweek = day;;
    } else {
      datetime = new Date(dateobj.endDateTime);
      mins=datetime.getMinutes();
      hour=datetime.getHours();
      dayofmonth=datetime.getDate();
      month=datetime.getMonth() + 1;
      dayofweek=datetime.getDay(); 
    }
    return (mins + " " + hour + " " + dayofmonth + " " + month + " " + dayofweek);
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
