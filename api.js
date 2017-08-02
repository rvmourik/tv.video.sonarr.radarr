var utils = require('/lib/utils.js');

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
                var radarrs = Homey.manager('drivers').getDriver('radarr').getRadarrs();

                Object.keys(radarrs).forEach(function(key) {
            		if (radarrs[key].data.address == ipv4) {

                        if (args.body.Movie !== 'undefined') {
                            var title = args.body.Movie.Title;
                            var eventtype = args.body.EventType;

                            if (eventtype == 'Grab') {
                                Homey.manager('flow').triggerDevice('grab_movie', {title: title});
                                callback(null, true);
                            } else if (eventtype == 'Download' || eventtype == 'Test') {
                                Homey.manager('flow').triggerDevice('download_movie', {title: title});
                                callback(null, true);
                            } else {
                                Homey.log('Eventtype not supported');
                                callback('Eventtype not supported', false);
                            }
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
