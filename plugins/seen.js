var Commands = require('../lib/commands')

Commands.add('seen'
  , 'Outputs the date on which the given nick was last seen.'
  , function(bot) {
    bot._seen = {}
    bot.irc.on('part', setSeen)
    bot.irc.on('quit', setSeen)

    bot.irc.on('join', function(user) {
      var nick = user.split('!')[0]

      delete bot._seen[nick.toLowerCase()]
    })

    function setSeen(user) {
      var nick = user.split('!')[0]

      bot._seen[nick.toLowerCase()] = { 'nick':    nick
                                      , 'time':    new Date
                                      }
    }
  }
  , function(from, to, nick) {
    if (!nick || !nick.trim()) return

    var self  = this
      , bot   = self._bot
      , lnick = nick.toLowerCase()

    if (from.toLowerCase() == lnick) {
      return say('Y U NO SEE YOURSELF?')
    }
    else if (bot.nick.toLowerCase() == lnick) {
      return say('Behind you, a three headed monkey!')
    }

    bot.irc.names(bot.channel, function(names) {
      names = names[bot.channel].map(function(n) { return n.toLowerCase() })

      if (~names.indexOf(lnick)) {
        say('"'+ nick +'" is in '+ bot.channel +' right now!')
      }
      else if (bot._seen[lnick]) {
        var seen = bot._seen[lnick]

        say('I have "'+ seen.nick +'" last seen on '+ seen.time)
      }
      else {
        say('I haven\'t seen "'+ nick +'"')
      }
    })

    function say(text) {
      self.say(from, to, from +': '+ text)
    }
  }
)
