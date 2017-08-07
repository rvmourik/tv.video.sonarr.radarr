var utils = require('/lib/utils.js');
const util = require('util');

module.exports = [
    {
        description: 'Notification',
        method: 'POST',
        path: '/:source',
        requires_authorization: false,
        fn: function (callback, args) {
            var data = {
                'ipv4': args.req.remoteAddress.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g)[0],
                'args' : args,
                'settings': {
                    'sonarr': {
                        'endpoint': 'episode',
                        'event_types': {
                            'Grab': 'grab_episode',
                            'Download': 'download_episode',
                            'Test': 'download_episode'
                        }
                    },
                    'radarr': {
                        'endpoint': 'movie',
                        'event_types': {
                            'Grab': 'grab_movie',
                            'Download': 'download_movie',
                            'Test': 'download_movie'
                        }
                    }
                },
                'type': null,
                'eventType': null,
                'instances': null,
                'additionalResultOptions': {},
                'processList': []
            };

            checkPreconditions(data)
                .then(prepare)
                .all(process)
                .then(function() {
                    Homey.log('alles is succesvol doorlopen');
                    callback(null, true);
                })
                .catch(function (error) {
                    Homey.log(error);

                    callback(error, false);
                });
        }
    }
];

function checkPreconditions(data) {
    return new Promise(function (resolve, reject) {
        if (['sonarr', 'radarr'].indexOf(data.args.params.source) == -1) {
            reject('Invalid type specified');
        }

        if (!data.settings[data.args.params.source].event_types.hasOwnProperty(data.args.body.EventType)) {
            reject('Eventtype not supported');
        }

        data.type = data.args.params.source;
        data.eventType = data.args.body.EventType;

        resolve(data);
    });
}

function prepare(data) {
    return new Promise(function (resolve, reject) {
        if (data.type == 'sonarr') {
            data.instances = Homey.manager('drivers').getDriver('sonarr').getSonarrs();

            if (data.args.body.hasOwnProperty('episodes')) {
                reject('Invalid response from Sonarr');
            }

            data.additionalResultOptions = {
                serie: data.args.body.series.title
            };

            data.args.body.episodes.forEach(function(episode) {
                data.processList.push(episode.Id);
            });
        } else if (data.type == 'radarr') {
            data.instances = Homey.manager('drivers').getDriver('radarr').getRadarrs();

            if (!data.args.body.hasOwnProperty('Movie')) {
                reject('Invalid response from Radarr');
            }

            data.processList.push(data.args.body.Movie.Id);
        }

        Object.keys(data.instances).forEach(function(key) {
            var instanceData = data.instances[key].data;

            if (instanceData.address != data.ipv4) {
                reject('Not authorised, incoming IP address ('+ data.ipv4 +') does not match Radarr IP address ('+ instanceData.address +')' );
            }
        });

        resolve(data);
    });
}

function process(data) {
    return new Promise(function (resolve, reject) {
        Object.keys(data.instances).forEach(function(key) {
            var instanceData = data.instances[key].data;

            if (instanceData.address != data.ipv4) {
                reject('Not authorised, incoming IP address ('+ ipv4 +') does not match Radarr IP address ('+ instanceData.address +')' );
            }

            data.processList.forEach(function(id) {
                // processWebHookData(instanceData, type, eventType, id, additionalResultOptions);
            });
        });

        resolve();
    });
}

function addLeadingZero(str) {
    var number = Number(str);
    if (number < 10) {
        return ("0" + number);
    } else {
        return number.toString();
    }
}