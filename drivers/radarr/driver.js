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
    	callback (null, true);
    },
    pair: function (socket) {
        socket.on('disconnect', function() {
            Homey.log ("User aborted pairing, or pairing is finished");
        });

        socket.on('test-connection', function( data, callback ) {
            //TODO: make connection test
            callback(null, "test succesfully");
        });

        socket.on('add_device', function( device_data, callback ){
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
    }
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
                    apikey: settings.apikey
                }
            }
            radarrs[device_data.id].settings = settings;
        })
    })
}
