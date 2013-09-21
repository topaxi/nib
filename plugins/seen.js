var Command = require('../lib/commands').Command

module.exports = Command.extend({
    name: 'seen'
  , info: 'Channel NSA'
  , description: 'Outputs the date on which the given nick was last seen.'
  , init: function(bot) {
    this._seen   = {}
    this.setSeen = this.setSeen.bind(this)

    bot.irc.on('part',    this.setSeen)
    bot.irc.on('quit',    this.setSeen)
    bot.irc.on('join',    this.setSeen)
    bot.irc.on('privmsg', this.setSeen)
  }
  , cleanup: function(bot) {
    bot.irc.off('part',    this.setSeen)
    bot.irc.off('quit',    this.setSeen)
    bot.irc.off('join',    this.setSeen)
    bot.irc.off('privmsg', this.setSeen)
  }
  , setSeen: function(nick, chan) {
    this._seen[nick.toLowerCase()] = { 'nick':    nick
                                     , 'time':    new Date
                                       // chan may be the botnick in private messages...
                                     , 'channel': chan == this._bot.nick ? null : chan
                                     }
  }
  , handler: function(from, to, nick) {
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

      var seen = self._seen[lnick]

      if (seen) {
        if (names[lnick]) {
          say('"'+ nick +'" is in '+ names[lnick].join(', ').replace(/,\s([^,]+)$/, ' and $1') +' right now, idling since: '+ seen.time)
        }
        else {
          var msg = 'I have "'+ seen.nick +'" last seen on '+ seen.time

          if (seen.channel) {
            msg += ' in'+ seen.channel
          }

          say(msg)
        }
      }
      else {
        say('I haven\'t seen "'+ nick +'"')
      }
    })

    function say(text) {
      bot.reply(from, to, from +': '+ text)
    }
  }
})
