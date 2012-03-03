/**
 * Automatically tries to op joining people listed in a oper-list.
 */
module.exports = function(bot) {
  var opers = require('./opers.json')

  bot.irc.on('join', function(user) {
    var nick = user.split('!')[0]

    if (~opers.indexOf(nick)) op(nick)
  })

  bot.irc.on('mode', function(from, b) {
    b = b.split(' ')

    if (b[0] == bot.channel && b[1] == '+o' && b[2] == bot.nick) {
      bot.irc.names([bot.channel], function(names) {
        names[bot.channel].filter(function(n) { return ~opers.indexOf(n) })
                          .forEach(op)
      })
    }
  })

  function op(nick) {
    bot.irc.write('MODE '+ bot.channel +' +o '+ nick)
  }
}
