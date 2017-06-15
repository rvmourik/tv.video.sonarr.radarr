var request = require('request');

exports.rootFolder = function (data, callback) {
    var address = data.address;
    var port    = data.port;
    var apikey  = data.apikey;

    var options = {
        url: "http://"+ address +":"+ port +"/api/rootfolder",
        headers: {
            'X-Api-Key': apikey
        },
        timeout: 5000
    };

    request(options, function (error, response, body) {
        if (error) {
            callback(error, null);
        } else if (response.statusCode == 200) {
            callback(null, body);
        }
    });
}

exports.qualityProfile = function (args, callback) {
    var address = args.device.address;
    var port    = args.device.port;
    var apikey  = args.device.apikey;

    var options = {
        url: "http://"+ address +":"+ port +"/api/profile",
        headers: {
            'X-Api-Key': apikey
        },
        timeout: 5000
    };

    request(options, function (error, response, body) {
        if (error) {
            callback(error, null);
        } else if (response.statusCode == 200) {
            callback(null, body);
        }
    });
}

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

exports.askAndAddSeries = function (args, callback) {
    Homey.manager('speech-input').ask(__('What series do you want to add?'), function(error, result) {
        if (error) {
            Homey.manager('speech-output').say(__('Something went wrong') + ' ' + err);
            callback(error, null);
        } else if (result == '') {
            Homey.manager('speech-output').say(__('Series not found, please try again'));
            callback(null, true);
        } else {
            Homey.log(result);
            searchSeries(args, result).then(data => {
                return addSeries(args, data);
            }).then(data => {
                Homey.manager('speech-output').say(__('The following series has been added') + ' ' + data)
                callback(null, true);
            }).catch(error => {
                if(error == 'no results') {
                    Homey.manager('speech-output').say(__('Series not found, please try again'));
                    callback(null, true);
                } else {
                    Homey.manager('speech-output').say(error)
                    callback(error, false);
                }
            })
        }
    });
}

function searchSeries(args, series) {
    return new Promise(function (resolve, reject) {
        var filteredSeries = encodeURIComponent(series.trim())
        var address = args.device.address;
        var port    = args.device.port;
        var apikey  = args.device.apikey;

        var options = {
            url: "http://"+ address +":"+ port +"/api/series/lookup?term="+ filteredSeries +"",
            headers: {
                'X-Api-Key': apikey
            },
            timeout: 5000
        };

        request(options, function (error, response, body) {
            if (error) {
                return reject(error);
            } else if (response.statusCode == 200) {
                var result = JSON.parse(body);
                if (isEmpty(result)) {
                    return reject('no results');
                } else {
                    return resolve(result);
                }
            }
        });
    })
}

function addSeries(args, body, callback) {
    return new Promise(function (resolve, reject) {
        var address     = args.device.address;
        var port        = args.device.port;
        var apikey      = args.device.apikey;
        var rootfolder  = args.device.rootfolder;
        var path        = ""+ args.device.rootfolder +"/"+ body[0].title +"/"
        var commands = {
            "tvdbId": body[0].tvdbId,
            "title": body[0].title,
            "qualityProfileId": args.quality.id,
            "titleSlug": body[0].titleSlug,
            "images": body[0].images,
            "seasons": body[0].seasons,
            "path": path
        }
        var title = body[0].title;

        Homey.log(commands);

        var options = {
            url: "http://"+ address +":"+ port +"/api/series",
            method: 'POST',
            body: JSON.stringify(commands),
            headers: {
                'X-Api-Key': apikey
            },
            timeout: 5000
        };

        request(options, function (error, response, body) {
            if (error) {
                reject(error);
            } else {
                resolve(title);
            }
        });
    })
}

function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }
    return true;
}
