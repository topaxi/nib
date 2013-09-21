var Command = require('../../lib/commands').Command

/**
 * Automatically tries to op joining people listed in a oper-list.
 */
module.exports = Command.extend({
    name: 'op'
  , info: 'Channel oper'
  , description: 'Channel oper plugin\n'
                 +'- !op                  | Op yourself in the current channel\n'
                 +'- /msg me !op #channel | Op yourself in the given channel'
  , init: function(bot, options) {
    this.onJoin        = this.onJoin.bind(this)
    this.onChannelMode = this.onChannelMode.bind(this)

    bot.irc.on('join', this.onJoin)
    bot.on('channel mode', this.onChannelMode)
  }
  , cleanup: function(bot) {
    bot.off('channel mode', this.onChannelMode)
    bot.irc.off('join', this.onJoin)
  }
  , onJoin: function(user, chan) {
    var opers = require('./opers.json')
      , nick = user.split('!')[0]
      , chan = chan.split(' ')[0].slice(1)

    if (opers[chan] && ~opers[chan].indexOf(nick)) {
      this.op(nick, chan)
    }
  }
  , onChannelMode: function(p, mode, to, chan, from) {
    if (p == '+' && mode == 'o' && to == this._bot.nick) {
      var opers = require('./opers.json')

      if (!opers[chan]) return

      this._bot.irc.names([chan], function(names) {
        if (!names[chan].length) return

        names[chan].filter(function(n) { return ~opers[chan].indexOf(n) })
                   .forEach(function(n) { this.op(n, chan) }, this)
      }.bind(this))
    }
  }
  , handler: function(from, to, msg) {
    msg = msg.trim()

    if (to == this._bot.nick && msg) {
      if (~this._bot.channels.indexOf(msg)) {
        this.op(from, msg)
      }
    }
    else {
      this.op(from, to)
    }
  }
  , op: function(nick, channel) {
    this._bot.irc.write('MODE '+ channel +' +o '+ nick)
  }
})
