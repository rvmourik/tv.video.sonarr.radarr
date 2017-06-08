var request = require('request');

exports.calendar = function (args, callback) {
    var address = args.device.address;
    var port    = args.device.port;
    var apikey  = args.device.apikey;
    var range   = args.range * 7;

    var current = new Date();
    var currentday = current.getDate();
    var currentmonth = current.getMonth() + 1;
    var currentyear = current.getFullYear();
    var currentdate = currentyear + '-' + (currentmonth<=9 ? '0' + currentmonth : currentmonth) + '-' + (currentday <= 9 ? '0' + currentday : currentday);

    var until = new Date();
    until.setDate(until.getDate() + range);
    var untilday = until.getDate();
    var untilmonth = until.getMonth() + 1;
    var untilyear = until.getFullYear();
    var untilyear = until.getFullYear();
    var untildate = untilyear + '-' + (untilmonth<=9 ? '0' + untilmonth : untilmonth) + '-' + (untilday <= 9 ? '0' + untilday : untilday);

    var options = {
        url: "http://"+ address +":"+ port +"/api/calendar?start="+ currentdate +"&end="+ untildate +"",
        headers: {
            'X-Api-Key': apikey
        },
        timeout: 5000
    };

    request(options, function (error, response, body) {
        if (error) {
            callback(error, false);
        } else if (response.statusCode == 200) {
            callback(null, body);
        }
    });
}

exports.queue = function (args, callback) {
    var address = args.device.address;
    var port    = args.device.port;
    var apikey  = args.device.apikey;

    var options = {
        url: "http://"+ address +":"+ port +"/api/queue",
        headers: {
            'X-Api-Key': apikey
        },
        timeout: 5000
    };

    request(options, function (error, response, body) {
        if (error) {
            callback(error, false);
        } else if (response.statusCode == 200) {
            callback(null, body);
        }
    });
}

exports.command = function (args, commands, callback) {
    var address = args.device.address;
    var port    = args.device.port;
    var apikey  = args.device.apikey;

    var options = {
        url: "http://"+ address +":"+ port +"/api/command",
        method: 'POST',
        body: commands,
        headers: {
            'X-Api-Key': apikey
        },
        timeout: 5000
    };

    request(options, function (error, response, body) {
        if (error) {
            callback(error, false);
        } else {
            callback(null, true);
        }
    });
}
