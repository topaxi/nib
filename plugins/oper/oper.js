/**
 * Automatically tries to op joining people listed in a oper-list.
 */
module.exports = function(bot) {
  var opers = require('./opers.json')

  bot.irc.on('join', function(user) {
    var nick = user.split('!')[0]

    if (~opers.indexOf(nick)) op(nick)
  })


  bot.on('channel mode', function(p, mode, to, channel, from) {
    if (p == '+' && mode == 'o' && to == bot.nick && channel == bot.channel) {
      bot.irc.names([channel], function(names) {
        names[channel].filter(function(n) { return ~opers.indexOf(n) })
                      .forEach(op)
      })
    }
  })

  function op(nick) {
    bot.irc.write('MODE '+ bot.channel +' +o '+ nick)
  }
}
