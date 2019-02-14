function convertToCron(date){
    let datetime = new Date(date);

    var mins=datetime.getMinutes();
    
    var hour=datetime.getHours();

    var dayofmonth=datetime.getDate();

    var month=datetime.getMonth() + 1;

    var dayofweek=datetime.getDay(); 

    var cron = mins + " " + hour + " " + dayofmonth + " " + month + " " + dayofweek;
    return cron;
}

module.exports = convertToCron;
