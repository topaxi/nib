var Commands = require('../lib/commands')

Commands.add('seen'
  , 'Outputs the date on which the given nick was last seen.'
  , function(bot) {
    bot._seen = {}
    bot.irc.on('part',    setSeen)
    bot.irc.on('quit',    setSeen)
    bot.irc.on('join',    setSeen)
    bot.irc.on('privmsg', setSeen)

    function setSeen(user, params) {
      var nick = user  .split('!')[0]
        , chan = params.split(' ')[0]

      bot._seen[nick.toLowerCase()] = { 'nick':    nick
                                      , 'time':    new Date
                                      , 'channel': chan
                                      }
    }
  }
  , function(from, to, nick) {
    if (!nick || !nick.trim()) return

    var self  = this
      , bot   = self._bot
      , lnick = nick.toLowerCase()

    /*if (from.toLowerCase() == lnick) {
      return say('Y U NO SEE YOURSELF?')
    }
    else */if (bot.nick.toLowerCase() == lnick) {
      return say('Behind you, a three headed monkey!')
    }

    bot.irc.names(bot.channels, function(_names) {
      var names = {}
      bot.channels.forEach(function(chan) {
        _names[chan] && _names[chan].forEach(function(n) {
          n = n.toLowerCase()

          if (names[n]) names[n].push(chan)
          else          names[n] = [chan]
        })
      })

      var seen = bot._seen[lnick]

      if (seen) {
        if (names[lnick]) {
          say('"'+ nick +'" is in '+ names[lnick].join(', ').replace(/,\s([^,]+)$/, ' and $1') +' right now, idling since: '+ seen.time)
        }
        else {
          say('I have "'+ seen.nick +'" last seen on '+ seen.time +' in'+ seen.channel)
        }
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
