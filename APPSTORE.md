# Connect Sonarr and Radarr with Homey
Connect [Sonarr](https://github.com/Sonarr/Sonarr) and [Radarr](https://github.com/Radarr/Radarr) with [Homey](https://www.athom.com/) and receive updates about grabbed and finished downloads.

## Configure webhooks in Sonarr and Radarr
For Homey to be able to receive updates from Sonarr and Radarr these applications need to send notifications on events like finished downloads. This is achieved by registering a webhook in Sonarr and/or Radarr. Below is a short instruction on how to register this webhook.

## Supported Cards
### Sonarr
* Default flow cards for light capabilities class

### Sonarr
* [ACTION] Episode grabbed (tokens for serie, season, episode and title)
* [ACTION] Episode downloaded (tokens for serie, season, episode and title)

### Radarr
* [ACTION] Episode grabbed (tokens for serie, season, episode and title)
* [ACTION] Episode downloaded (tokens for serie, season, episode and title)

## Donate
Donating is completely optional.
[![Donate](https://www.paypalobjects.com/webstatic/en_US/i/btn/png/btn_donate_92x26.png)](https://paypal.me/jghaanstra)

## Changelog
### 2017-06-03 -- v1.0.0
* Initial version
