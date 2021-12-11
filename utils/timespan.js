function timespan (date2,date1){

    // console.log('global.endTime',global.endTime)
    // console.log('process.env.runid',process.env.runid)
    // var date1ForFormat = new Date(parseInt(process.env.runid)) 
    // var date2ForFormat = new Date(global.endTime.getTime())
    
   // const date1String =`${date1ForFormat.getDate()}/${date1ForFormat.getMonth()}/${date1ForFormat.getFullYear()} ${date1ForFormat.getHours()}:${date1ForFormat.getMinutes()}:${date1ForFormat.getSeconds()}`
   // const date2String =`${date2ForFormat.getDate()}/${date2ForFormat.getMonth()}/${date2ForFormat.getFullYear()} ${date2ForFormat.getHours()}:${date2ForFormat.getMinutes()}:${date2ForFormat.getSeconds()}`
   
    // var date1 = new Date(date1ForFormat)
    // var date2 = new Date(date2ForFormat)
    // console.log('date1String',date1String)
    // console.log('date2String',date2String)
    var diff = date2.getTime() - date1.getTime();

    var days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * (1000 * 60 * 60 * 24);

    var hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * (1000 * 60 * 60);

    var mins = Math.floor(diff / (1000 * 60));
    diff -= mins * (1000 * 60);

    var seconds = Math.floor(diff / (1000));
    diff -= seconds * (1000);

    console.log(days + " days, " + hours + " hours, " + mins + " minutes, " + seconds + " seconds");
    return {days,hours,mins,seconds}
}

module.exports={timespan}