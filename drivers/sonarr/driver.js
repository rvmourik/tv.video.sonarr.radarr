"use strict";

var utils = require('/lib/utils.js');
var sonarrs = {};

/* SELF */
var self = {
    init: function (devices_data, callback) {
        devices_data.forEach(function(device_data) {
            initDevice(device_data);
    	});
        Homey.log('Driver Sonarr initialized ...');
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
        delete sonarrs[device_data.id];
        callback( null, true );
    },
    settings: function (device_data, newSettingsObj, oldSettingsObj, changedKeysArr, callback) {
        try {
            changedKeysArr.forEach(function (key) {
                sonarrs[device_data.id].data[key] = newSettingsObj[key];
                sonarrs[device_data.id].settings[key] = newSettingsObj[key]
            })
            callback(null, true)
        } catch (error) {
            callback(error)
        }
    },
    getSonarrs: function() {
        return sonarrs;
    },
}

module.exports = self

/* HELPER FUNCTIONS */
function initDevice(device_data) {
    Homey.manager('drivers').getDriver('sonarr').getName(device_data, function (err, name) {
        module.exports.getSettings(device_data, function( err, settings ) {
            sonarrs[device_data.id] = {
                name: name,
                data: {
                    id: device_data.id,
                    address: settings.address,
                    port: settings.port,
                    apikey: settings.apikey,
                    rootfolder: settings.rootfolder
                }
            }
            sonarrs[device_data.id].settings = settings;
        })
    })
}

Homey.manager('flow').on('action.sonarr_add.quality.autocomplete', function(callback, args) {
    var qualityProfiles = [];
    utils.qualityProfile(args.args, function(error, result) {
        if(error) {
            callback(error, null);
        } else {
            var profiles = JSON.parse(result);
            if (profiles.length > 0) {
                profiles.forEach( function(profile) {
                    var qualityProfile = {};
                    qualityProfile.icon = '/app/tv.video.sonarr.radarr/drivers/sonarr/assets/download.svg';
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
Homey.manager('flow').on('action.sonarr_calendar', function( callback, args ) {
    utils.calendar(args, function( err, result ) {
        if(err) {
            callback(err, false);
        } else {
            var episodes = JSON.parse(result);
            if (episodes.length > 0) {
                Homey.manager('speech-output').say(__("Future episode are"));

                episodes.forEach( function(episode) {
                    var serie = episode.series.title;
                    var season = episode.seasonNumber;
                    var episodenumber = episode.episodeNumber;
                    var title = episode.title;
                    var airdate = episode.airDate;

                    Homey.manager('speech-output').say(__(", season episode titled with airdate", { "serie": serie, "season": season, "episode": episodenumber, "title": title, "airdate": airdate }));
                });
            } else {
                Homey.manager('speech-output').say(__("No episodes found"));
            }
            callback(null, true);
        }
    });
});

Homey.manager('flow').on('action.sonarr_queue', function( callback, args ) {
    utils.queue(args, function( err, result ) {
        if(err) {
            callback(err, false);
        } else {
            var downloads = JSON.parse(result);
            if (downloads.length > 0) {
                Homey.manager('speech-output').say(__("Current downloads are"));

                downloads.forEach( function(download) {
                    var serie = download.series.title;
                    var season = download.episode.seasonNumber;
                    var episodenumber = download.episode.episodeNumber;
                    var title = download.episode.title;
                    var airdate = download.episode.airDate;

                    Homey.manager('speech-output').say(__(", season episode titled with airdate", { "serie": serie, "season": season, "episode": episodenumber, "title": title, "airdate": airdate }));
                });
            } else {
                Homey.manager('speech-output').say(__("No current downloads"));
            }
            callback(null, true);
        }
    });
});

Homey.manager('flow').on('action.sonarr_refresh', function(callback, args) {
    var commands = '{"name": "RefreshSeries"}';
    utils.command(args, commands, function( err, result ) {
        if(err) {
            callback(err, false);
        } else {
            callback(null, true);
        }
    });
});

Homey.manager('flow').on('action.sonarr_add', function(callback, args) {
    utils.addMedia(args, 'series', function(error, result) {
        if(error) {
            callback(error, false);
        } else {
            callback(null, true);
        }
    });
});
