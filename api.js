var utils = require('/lib/utils.js');

module.exports = [
	{
		description: 'Notification',
		method     : 'POST',
		path       : '/:source',
		requires_authorization: false,
		fn: function( callback, args ) {
            var eventtype = args.body.EventType;

            if (args.params.source == 'sonarr') {
                var serie = args.body.Series.Title;
                var episodes = args.body.Episodes;

                episodes.forEach( function(episode) {
                    var season = episode.SeasonNumber;
                    var episodenumber = episode.EpisodeNumber;
                    var title = episode.Title;

                    if (eventtype == 'Grab') {
                        Homey.manager('flow').triggerDevice('grab_episode', {serie: serie, season: season, episode: episodenumber, title: title});
                        Homey.log('Grab');
                        callback(null, true);
                    } else if (eventtype == 'Download' || eventtype == 'Test') {
                        Homey.manager('flow').triggerDevice('download_episode', {serie: serie, season: season, episode: episodenumber, title: title});
                        callback(null, true);
                    } else {
                        Homey.log(args);
                        callback('Eventtype not supported', false);
                    }

                });
            } else if (args.params.source == 'radarr') {
                var title = args.body.Movie.Title;

                if (eventtype = 'Grab') {
                    Homey.manager('flow').triggerDevice('grab_movie', {title: title});
                    callback(null, true);
                } else if (eventtype = 'Download' || eventtype == 'Test') {
                    Homey.manager('flow').triggerDevice('download_movie', {title: title});
                    callback(null, true);
                } else {
                    Homey.log('Eventtype not supported');
                    callback('Eventtype not supported', false);
                }
            } else {
                Homey.log(args);
                callback('No valid source posted', false);
            }
		}
	}
]
