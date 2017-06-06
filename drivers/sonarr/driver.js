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
    }
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
                    apikey: settings.apikey
                }
            }
            sonarrs[device_data.id].settings = settings;
        })
    })
}
