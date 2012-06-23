var lfm      = require('./lastfm')
  , Commands = require('../../lib/commands')

lfm.setAPIKey('967ce1901a718b229e7795a485666a1e')

Commands.add('listen'
  , 'Looks up the given last.fm user\'s currently playing track.'
  , function(from, to, nick) {
    var self = this
      , bot  = self._bot

    lfm.User.getRecentTracks({'user': nick, 'limit': 1}, function(err, data) {
      if (err) return say(err)

      var user   = data.recenttracks['@attr'].user
        , track  = data.recenttracks.track
        , artist, title

      if (!track) return say('Could not lookup latest track...')

      title  = track.name
      artist = track.artist['#text']

      if (!nick || (!artist && !title)) {
        return say(nick +' was not found on last.fm')
      }

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
      self.say(from, to, text)
    }
  }
)
