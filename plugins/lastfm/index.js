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

      var lnick  = /user="(.*?)"/.exec(data)
        , track  = /<name>(.*?)<\/name>/.exec(data)
        , artist = /<artist.*?>(.*?)<\/artist>/.exec(data)

      if (!nick || (!artist && !track)) {
        return say(nick +' was not found on last.fm')
      }

      nick   = lnick[1]
      track  = track[1].replace(/&amp;/g, '&')
      artist = artist[1].replace(/&amp;/g, '&')

      if (~data.indexOf('nowplaying="true"')) {
        say(nick +' is currently listening to:')
      }
      else {
        say(nick +' last played track was:')
      }

      say(artist +' - '+ track)
    })

    function say(text) {
      self.say(from, to, text)
    }
  }
)
