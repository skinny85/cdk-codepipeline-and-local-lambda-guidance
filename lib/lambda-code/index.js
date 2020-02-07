var date_fns = require('date-fns');
var date_tz = require('date-fns-tz');

exports.handler = (event, context, callback) => {
    const currentDate = date_tz.utcToZonedTime(new Date(), 'America/Los_Angeles');
    callback(null, {
        statusCode: '200',
        body: 'The time in Los Angeles is: ' + date_fns.format(currentDate, 'yyyy-MM-dd HH:mm:ss.SSS'),
    });
};
