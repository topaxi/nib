var Command = require('../../lib/commands').Command

/**
 * Automatically tries to op joining people listed in a oper-list.
 */
module.exports = Command.extend({
    name: 'op'
  , info: 'Channel oper'
  , description: 'Channel oper plugin\n'+
                 '- !op                  | Op yourself in the current channel\n'+
                 '- /msg me !op #channel | Op yourself in the given channel'
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
    var nick = user.split('!')[0]

    chan = chan.split(' ')[0].slice(1)

    this.op(chan, nick)
  }
  , onChannelMode: function(p, mode, to, chan, from) {
    if (p == '+' && mode == 'o' && to == this._bot.nick) {
      var opers = require('./opers.json')

      if (!opers[chan]) return

      this._bot.irc.names([chan], function(names) {
        names[chan].forEach(this.op.bind(this, chan))
      }.bind(this))
    }
  }
  , handler: function(from, to, msg) {
    this.op(to == this._bot.nick && msg.trim() || to, from)
  }
  , op: function(channel, nick) {
    var opers = require('./opers.json')

    if (opers[channel] && ~opers[channel].indexOf(nick)) {
      this._bot.irc.write('MODE '+ channel +' +o '+ nick)
    }
  }
})
