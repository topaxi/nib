var lfm     = require('./lastfm')
  , Command = require('../../lib/commands').Command

lfm.setAPIKey('967ce1901a718b229e7795a485666a1e')

module.exports = Command.extend({
    name: 'listen'
  , info: 'Currently listening on last.fm'
  , description: 'Looks up the given last.fm user\'s currently playing track.'
  , handler: function(from, to, nick) {
    var bot = this._bot

    lfm.User.getRecentTracks({'user': nick, 'limit': 1}, function(err, data) {
      if (err) return say(err)

      var recent = data.recenttracks
        , user   = recent['@attr'] && recent['@attr'].user
        , track  = recent.track
        , artist, title

      if (!user) {
        return say(nick +' was not found on last.fm')
      }

      if (Array.isArray(track)) {
        track = track[0]
      }

      if (!track || !track.name || !track.artist) {
        return say('Could not lookup latest track...')
      }

      title  = track.name
      artist = track.artist['#text']

      if (track['@attr'] &&
          track['@attr']['nowplaying'] == 'true') {
        say(user +' is currently listening to:')
      }
      else {
        say(user +' last played track was:')
      }

      say(artist +' - '+ title)
    })

    function say(text) {
      bot.reply(from, to, text)
    }
  }
})
