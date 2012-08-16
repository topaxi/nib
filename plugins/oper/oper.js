/**
 * Automatically tries to op joining people listed in a oper-list.
 */
module.exports = function(bot) {
  var opers = require('./opers.json')

  bot.irc.on('join', function(user, chan) {
    var nick = user.split('!')[0]
      , chan = chan.split(' ')[0]

    if (~opers.indexOf(nick)) op(nick, chan)
  })


  bot.on('channel mode', function(p, mode, to, channel, from) {
    if (p == '+' && mode == 'o' && to == bot.nick) {
      bot.irc.names([channel], function(names) {
        names[channel].filter(function(n) { return ~opers.indexOf(n) })
                      .forEach(function(n) { op(n, channel) })
      })
    }
  })

  function op(nick, channel) {
    bot.irc.write('MODE '+ channel +' +o '+ nick)
  }
}
