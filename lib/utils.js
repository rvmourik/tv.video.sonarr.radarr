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

exports.addMedia = function (args, type, callback) {
    switch(type) {
        case 'series':
            var question = __('What series do you want to add?');
            var notfound = __('Series not found, please try again');
            var added = __('The following series has been added');
            break;
        case 'movie':
            var question = __('What movie do you want to add?');
            var notfound = __('Movie not found, please try again');
            var added = __('The following movie has been added');
            break;
    }

    Homey.manager('speech-input').ask(question, function(error, result) {
        if (error) {
            Homey.manager('speech-output').say(__('Something went wrong') + ' ' + error);
            callback(error, null);
        } else if (result == '') {
            Homey.manager('speech-output').say(notfound);
            callback(null, true);
        } else {
            Homey.log(result);
            searchMedia(args, type, result).then(data => {
                return addMedia(args, type, data);
            }).then(data => {
                Homey.manager('speech-output').say(added + ' ' + data)
                callback(null, true);
            }).catch(error => {
                if(error == 'no results') {
                    Homey.manager('speech-output').say(notfound);
                    callback(null, true);
                } else {
                    Homey.manager('speech-output').say(error)
                    callback(error, false);
                }
            })
        }
    });
}

exports.getMediaInfo = function(args, endpoint, id) {
    return new Promise(function (resolve, reject) {
        var address     = args.address;
        var port        = args.port;
        var apikey      = args.apikey;

        if (!id) {
            reject("Missing id, cannot perform API request");
        }

        var options = {
            url: "http://"+ address +":"+ port +"/api/"+ endpoint +"/"+ id,
            method: 'GET',
            body: null,
            headers: {
                'X-Api-Key': apikey
            },
            timeout: 5000
        };

        request(options, function (error, response, body) {
            var result = JSON.parse(body);

            if (error) {
                return reject(error);
            } else if (isEmpty(result)) {
                return reject('no media info found');
            } else {
                return resolve(result);
            }
        });
    });
};

exports.getImageData = function(args, result) {
    return new Promise(function (resolve) {
        if (!result.hasOwnProperty('imageUrl')) {
            return resolve(result);
        }

        var address     = args.address;
        var port        = args.port;
        var apikey      = args.apikey;

        var options = {
            url: "http://"+ address +":"+ port + result.imageUrl,
            method: 'GET',
            body: null,
            headers: {
                'X-Api-Key': apikey
            },
            timeout: 5000,
            encoding: null
        };

        request(options, function (error, response, body) {
            var image = '';

            if (response.statusCode == 200) {
                image = new Buffer(body).toString('base64');
            }

            if (image) {
                result.image = image;
            }

            return resolve(result);
        });
    });
};

function searchMedia(args, type, searchquery) {
    return new Promise(function (resolve, reject) {
        var filteredMedia = encodeURIComponent(searchquery.trim())
        var address = args.device.address;
        var port    = args.device.port;
        var apikey  = args.device.apikey;

        switch(type) {
            case 'series':
                var endpoint = type;
                break;
            case 'movie':
                var endpoint = 'movies';
                break;
        }

        Homey.log("http://"+ address +":"+ port +"/api/"+ endpoint +"/lookup?term="+ filteredMedia +"");

        var options = {
            url: "http://"+ address +":"+ port +"/api/"+ endpoint +"/lookup?term="+ filteredMedia +"",
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

function addMedia(args, type, body, callback) {
    return new Promise(function (resolve, reject) {
        var address     = args.device.address;
        var port        = args.device.port;
        var apikey      = args.device.apikey;
        var rootfolder  = args.device.rootfolder;
        var title       = body[0].title;
        var path        = ""+ args.device.rootfolder +"/"+ title +"/"

        switch(type) {
            case 'series':
                var commands = {
                    "tvdbId": body[0].tvdbId,
                    "title": body[0].title,
                    "qualityProfileId": args.quality.id,
                    "titleSlug": body[0].titleSlug,
                    "images": body[0].images,
                    "seasons": body[0].seasons,
                    "path": path
                }
                break;
            case 'movie':
                var commands = {
                    "title": body[0].title,
                    "qualityProfileId": args.quality.id,
                    "titleSlug": body[0].titleSlug,
                    "images": body[0].images,
                    "tmdbId": body[0].tmdbId,
                    "path": path
                }
                break;
        }

        var options = {
            url: "http://"+ address +":"+ port +"/api/"+ type +"",
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
