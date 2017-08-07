var utils = require('/lib/utils');
const util = require('util');

module.exports = [
	{
		description: 'Notification',
		method     : 'POST',
		path       : '/:source',
		requires_authorization: false,
		fn: function( callback, args ) {
            var settings = {
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
            };
        	var ipv4 = args.req.remoteAddress.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g)[0];

        	var type = args.params.source;
            var instances = [];
            var additionalResultOptions = {};

            var eventType = args.body.EventType;
            var processList = [];

            if (['sonarr', 'radarr'].indexOf(type) == -1) {
                callback('Invalid type specified', false);

                return;
            }

            if (typeof(settings[type].event_types[eventType]) == 'undefined') {
                Homey.log('Eventtype not supported');

                callback('Eventtype not supported', false);

                return;
            }

            if (type == 'sonarr') {
                instances = Homey.manager('drivers').getDriver('sonarr').getSonarrs();

                if (args.body.episodes !== 'undefined') {
                    callback('Invalid response from Sonarr', false);

                    return;
                }

                additionalResultOptions = {
                    serie: args.body.series.title
                };

                args.body.episodes.forEach(function(episode) {
                    processList.push(episode.Id);
                });
            } else if (type == 'radarr') {
                instances = Homey.manager('drivers').getDriver('radarr').getRadarrs();

                if (args.body.Movie !== 'undefined') {
                    callback('Invalid response from Radarr', false);

                    return;
                }

                processList.push(args.body.Movie.Id);
            }


            Object.keys(instances).forEach(function(key) {
                var instanceData = instances[key].data;

                if (instanceData.address != ipv4) {
                    callback( null, 'Not authorised, incoming IP address ('+ ipv4 +') does not match Radarr IP address ('+ instanceData.address +')' );

                    return;
                }

                processList.forEach(function(id) {
                    Homey.log(id);
                   // processWebHookData(instanceData, type, eventType, id, additionalResultOptions);
                });
            });


            // if (args.params.source == 'sonarr') {
            //     var sonarrs = Homey.manager('drivers').getDriver('sonarr').getSonarrs();
            //
            //     Object.keys(sonarrs).forEach(function(key) {
            // 		if (sonarrs[key].data.address == ipv4) {
            //
            //             if (args.body.series !== 'undefined' && args.body.episodes !== 'undefined') {
            //                 var serie = args.body.series.title;
            //                 var episodes = args.body.episodes;
            //                 var eventtype = args.body.eventType;
            //
            //                 episodes.forEach( function(episode) {
            //                     var season = addLeadingZero(episode.seasonNumber);
            //                     var episodenumber = addLeadingZero(episode.episodeNumber);
            //                     var title = episode.title;
            //
            //                     if (eventtype == 'Grab') {
            //                         Homey.manager('flow').triggerDevice('grab_episode', {serie: serie, season: season, episode: episodenumber, title: title});
            //                         callback(null, true);
            //                     } else if (eventtype == 'Download' || eventtype == 'Test') {
            //                         Homey.manager('flow').triggerDevice('download_episode', {serie: serie, season: season, episode: episodenumber, title: title});
            //                         callback(null, true);
            //                     } else {
            //                         Homey.log(args);
            //                         callback('Eventtype not supported', false);
            //                     }
            //
            //                 });
            //             } else {
            //                 callback('Invalid response from Sonarr', false);
            //             }
            //         } else {
            // 			callback(null, 'Not authorised, incoming IP address ('+ ipv4 +') does not match Sonarr IP address ('+ sonarrs[key].data.address +')');
            // 		}
            // 	});
            // } else if (args.params.source == 'radarr') {
            //
            // } else {
            //     Homey.log(args);
            //
            //     callback('No valid source posted', false);
            // }
		}
	}
]

function processWebHookData(instance, type, eventType, id, additionalResultOptions) {
    var imdbBaseUrl = 'http://www.imdb.com/title/';

    utils.getMediaInfo(instance, settings[type].endpoint, id).then(function(response) {
        var result = {
            title: response.title,
            year: response.year,
            overview: '',
            image: '',
            image_url: null
        };

        if (response.hasOwnProperty('overview')) {
            result.overview = response.overview;
        }

        if (type == 'sonarr') {
            result.season = addLeadingZero(response.seasonNumber);
            result.episode = addLeadingZero(response.episodeNumber);
        } else if (type == 'radarr') {
            result.rating = response.ratings.value;
            result.imdb_url = util.format('%s%s', imdbBaseUrl, response.imdbId);

            for (var i = 0; i < response.images.length; i++) {

                if (!response.images[i].hasOwnProperty('coverType')
                    || (response.images[i].hasOwnProperty('coverType') && response.images[i].coverType != "poster")
                ) {
                    continue;
                }

                result.imageUrl = response.images[i].url;
            }
        }

        result = util._extend(result, additionalResultOptions);

        Homey.log(result);

        return;

        return utils.getImageData(instanceData, result);
    }).then(function(result) {
        Homey.manager('flow').triggerDevice(settings[type][eventType], result);

        callback(null, true);
    }).catch(function(err) {
        Homey.log(err);

        callback('Invalid response from Radarr api', false);
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
