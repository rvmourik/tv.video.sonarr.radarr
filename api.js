var utils = require('/lib/utils');
const util = require('util');

module.exports = [
	{
		description: 'Notification',
		method     : 'POST',
		path       : '/:source',
		requires_authorization: false,
		fn: function( callback, args ) {
        	var ipv4 = args.req.remoteAddress.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g)[0];

            if (args.params.source == 'sonarr') {
                var sonarrs = Homey.manager('drivers').getDriver('sonarr').getSonarrs();

                Object.keys(sonarrs).forEach(function(key) {
            		if (sonarrs[key].data.address == ipv4) {

                        if (args.body.series !== 'undefined' && args.body.episodes !== 'undefined') {
                            var serie = args.body.series.title;
                            var episodes = args.body.episodes;
                            var eventtype = args.body.eventType;

                            episodes.forEach( function(episode) {
                                var season = addLeadingZero(episode.seasonNumber);
                                var episodenumber = addLeadingZero(episode.episodeNumber);
                                var title = episode.title;

                                if (eventtype == 'Grab') {
                                    Homey.manager('flow').triggerDevice('grab_episode', {serie: serie, season: season, episode: episodenumber, title: title});
                                    callback(null, true);
                                } else if (eventtype == 'Download' || eventtype == 'Test') {
                                    Homey.manager('flow').triggerDevice('download_episode', {serie: serie, season: season, episode: episodenumber, title: title});
                                    callback(null, true);
                                } else {
                                    Homey.log(args);
                                    callback('Eventtype not supported', false);
                                }

                            });
                        } else {
                            callback('Invalid response from Sonarr', false);
                        }
                    } else {
            			callback(null, 'Not authorised, incoming IP address ('+ ipv4 +') does not match Sonarr IP address ('+ sonarrs[key].data.address +')');
            		}
            	});
            } else if (args.params.source == 'radarr') {
                var radarrInstances = Homey.manager('drivers').getDriver('radarr').getRadarrs();
                var eventTriggers = {
                    'Grab': 'grab_movie',
                    'Download': 'download_movie',
                    'Test': 'download_movie'
                };

                Object.keys(radarrInstances).forEach(function(key) {
                    var instanceData = radarrInstances[key].data;

            		if (instanceData.address == ipv4) {

                        if (args.body.Movie !== 'undefined') {
                            var eventType = args.body.EventType;

                            if (typeof(eventTriggers[eventType]) == 'undefined') {
                                Homey.log('Eventtype not supported');
                                callback('Eventtype not supported', false);
                            }

                            var imdbBaseUrl = 'http://www.imdb.com/title/';

                            utils.getMediaInfo(instanceData, 'movie', args.body.Movie.Id).then(function(response) {
                                var result = {
                                    title: response.title,
                                    year: response.year,
                                    overview: '',
                                    rating: response.ratings.value,
                                    imdb_url: util.format('%s%s', imdbBaseUrl, response.imdbId),
                                    image: '',
                                    imageUrl: null
                                };

                                if (response.hasOwnProperty('overview')) {
                                    result.overview = response.overview;
                                }

                                for (var i = 0; i < response.images.length; i++) {

                                    if (!response.images[i].hasOwnProperty('coverType')
                                        || response.images[i].coverType != "poster"
                                    ) {
                                        continue;
                                    }

                                    result.imageUrl = response.images[i].url;
                                }

                                return utils.getImageData(instanceData, result);
                            }).then(function(result) {
                                Homey.log(result);

                                Homey.manager('flow').triggerDevice(eventTriggers[eventType], result);

                                callback(null, true);
                            }).catch(function(err) {
                                Homey.log(err);

                                callback('Invalid response from Radarr api', false);
                            });
                            //
                            // var title = movie.Title;
                            // // var year = null,
                            // //     imdbId = null,
                            // //     imdbUrl = null;
                            //
                            // // if (args.body.RemoteMovie !== 'undefined') {
                            // //     var remoteMovie = args.body.RemoteMovie;
                            // //
                            // //     imdbId = remoteMovie.ImdbId;
                            // //     year = remoteMovie.Year;
                            // //
                            // //     imdbUrl = util.format('%s%s', imdbBaseUrl, imdbId);
                            // // }
                            //
                            // if (eventtype == 'Grab') {
                            //     Homey.manager('flow').triggerDevice('grab_movie', {title: title});//, year: year, imdbId: imdbId, imdbUrl: imdbUrl});
                            //     callback(null, true);
                            // } else if (eventtype == 'Download' || eventtype == 'Test') {
                            //
                            //
                            //
                            //     Homey.manager('flow').triggerDevice('download_movie', {title: title});//, year: year, imdbId: imdbId, imdbUrl: imdbUrl});
                            //     callback(null, true);
                            // } else {
                            //     Homey.log('Eventtype not supported');
                            //     callback('Eventtype not supported', false);
                            // }
                        } else {
                            callback('Invalid response from Radarr', false);
                        }
                    } else {
                        callback( null, 'Not authorised, incoming IP address ('+ ipv4 +') does not match Radarr IP address ('+ radarrs[key].data.address +')' );
                    }
                });
            } else {
                Homey.log(args);
                callback('No valid source posted', false);
            }
		}
	}
]

function addLeadingZero(str) {
    var number = Number(str);
    if (number < 10) {
        return ("0" + number);
    } else {
        return number.toString();
    }
}
