"use strict";

var utils = require('/lib/utils.js');
var radarrs = {};

/* SELF */
var self = {
    init: function (devices_data, callback) {
        devices_data.forEach(function(device_data) {
            initDevice(device_data);
    	});
        Homey.log('Driver Radarr initialized ...');
    	callback();
    },
    pair: function (socket) {
        socket.on('disconnect', function() {
            Homey.log ("User aborted pairing, or pairing is finished");
        });

        socket.on('test-connection', function(data, callback ) {
            utils.rootFolder(data, function(error, result) {
                if(error) {
                    callback(error, null);
                } else {
                    callback(null, result);
                }
            });
        });

        socket.on('add_device', function(device_data, callback) {
            initDevice( device_data );
            callback( null, true );
        });
    },
    deleted: function (device_data, callback) {
        delete radarrs[device_data.id];
        callback( null, true );
    },
    settings: function (device_data, newSettingsObj, oldSettingsObj, changedKeysArr, callback) {
        try {
            changedKeysArr.forEach(function (key) {
                radarrs[device_data.id].data[key] = newSettingsObj[key];
                radarrs[device_data.id].settings[key] = newSettingsObj[key]
            })
            callback(null, true)
        } catch (error) {
            callback(error)
        }
    },
    getRadarrs: function() {
        return radarrs;
    },
}

module.exports = self

/* HELPER FUNCTIONS */
function initDevice(device_data) {
    Homey.manager('drivers').getDriver('radarr').getName(device_data, function (err, name) {
        module.exports.getSettings(device_data, function( err, settings ) {
            radarrs[device_data.id] = {
                name: name,
                data: {
                    id: device_data.id,
                    address: settings.address,
                    port: settings.port,
                    apikey: settings.apikey,
                    rootfolder: settings.rootfolder
                }
            }
            radarrs[device_data.id].settings = settings;
        })
    })
}

Homey.manager('flow').on('action.radarr_add.quality.autocomplete', function(callback, args) {
    var qualityProfiles = [];
    utils.qualityProfile(args.args, function(error, result) {
        if(error) {
            callback(error, null);
        } else {
            var profiles = JSON.parse(result);
            if (profiles.length > 0) {
                profiles.forEach( function(profile) {
                    var qualityProfile = {};
                    qualityProfile.icon = '/app/tv.video.sonarr.radarr/drivers/radarr/assets/download.svg';
                    qualityProfile.name = profile.name;
                    qualityProfile.id = profile.cutoff.id;
                    qualityProfiles.push(qualityProfile);
                });
            }
            callback(null, qualityProfiles);
        }
    });
});

// FLOW ACTION HANDLERS
Homey.manager('flow').on('action.radarr_calendar', function( callback, args ) {
    utils.calendar(args, function( err, result ) {
        if(err) {
            callback(err, false);
        } else {
            var movies = JSON.parse(result);
            if (movies.length > 0) {
                Homey.manager('speech-output').say(__("Future movies are"));

                movies.forEach( function(movie) {
                    var title = movie.title;
                    var cinemadate = movie.inCinemas;
                    var cinemadateFiltered = cinemadate.substring(0,10);
                    var releasedate = movie.physicalRelease;
                    var releasedateFiltered = releasedate.substring(0,10);

                    Homey.manager('speech-output').say(__(", in cinemas on and released on", { "title": title, "cinema": cinemadateFiltered, "release": releasedateFiltered }));
                });
            } else {
                Homey.manager('speech-output').say(__("No movies found"));
            }
            callback(null, true);
        }
    });
});

Homey.manager('flow').on('action.radarr_refresh', function(callback, args) {
    var commands = '{"name": "RefreshMovie"}';
    utils.command(args, commands, function( err, result ) {
        if(err) {
            callback(err, false);
        } else {
            callback(null, true);
        }
    });
});

Homey.manager('flow').on('action.radarr_add', function(callback, args) {
    utils.addMedia(args, 'movie', function(error, result) {
        if(error) {
            callback(error, false);
        } else {
            callback(null, true);
        }
    });
});
