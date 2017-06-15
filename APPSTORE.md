# Connect Sonarr and Radarr with Homey
Connect [Sonarr](https://github.com/Sonarr/Sonarr) and/or [Radarr](https://github.com/Radarr/Radarr) with Homey and receive updates about grabbed and finished downloads and upcoming episodes and movies.

## Instructions
For Homey to be able to receive updates from Sonarr and Radarr these applications need to send notifications to Homey on events like finished downloads. This is achieved by registering a webhook in Sonarr and/or Radarr. Below is a short instruction on how to register this webhook.
* Log into your Sonarr / Radarr installation and go to "Settings > Connect".
* Click on the plus button and click on the Webhook notification in the Add Notification popup
* Enter the details as followed:
    * Name: Homey (or something similar)
    * On Grab: Yes
    * On Download: Yes
    * On Upgrade: No
    * On Rename: No
    * Filter Series Tags: Empty
    * URL for Sonarr: http(s)://yourip-or-homey-url/api/app/tv.video.sonarr.radarr/sonarr/ where you add the local IP of Homey (if on the same network as Sonarr) or the external cloud URL of Homey
    * URL for Radarr: http(s)://yourip-or-homey-url/api/app/tv.video.sonarr.radarr/radarr/ where you add the local IP of Homey (if on the same network as Radarr) or the external cloud URL of Homey
    * Method: POST

## Supported Cards
### Sonarr
* [TRIGGER] Episode grabbed (tokens for serie, season, episode and title)
* [TRIGGER] Episode downloaded (tokens for serie, season, episode and title)
* [ACTION] Let Homey speak upcoming episodes from the Sonarr calendar within the selected weeks
* [ACTION] Let Homey speak currently downloading episodes
* [ACTION] Refresh series information from trakt and rescan disks.
* [ACTION] Add series to the Sonarr library through voice and with a selected quality profile.

### Radarr
* [TRIGGER] Episode grabbed (tokens for serie, season, episode and title)
* [TRIGGER] Episode downloaded (tokens for serie, season, episode and title)
* [ACTION] Let Homey speak upcoming movies from the Radarr calendar within the selected weeks
* [ACTION] Refresh movies information from TMDb and rescan disks.

## Donate
Donating is completely optional.
[![Donate](https://www.paypalobjects.com/webstatic/en_US/i/btn/png/btn_donate_92x26.png)](https://paypal.me/jghaanstra)

## Changelog
### 2017-06-16 -- v1.1.0
IMPORTANT: this release requires you to re-pair your Sonarr installation.
* Added check in API if incoming IP matches IP of Sonarr or Radarr device
* Fixed a type-o in the hint of the Sonarr calendar card
* Fixed a type-o in the hint of the Sonarr calendar card

### 2017-06-08 -- v1.0.0
* Initial version
