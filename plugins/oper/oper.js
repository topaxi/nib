/**
 * Automatically tries to op joining people listed in a oper-list.
 */
module.exports = function(bot) {
  var opers = require('./opers.json')

  bot.irc.on('join', function(user) {
    var nick = user.split('!')[0]

    if (~opers.indexOf(nick)) op(nick)
  })

  function op(nick) {
    bot.irc.write('MODE '+ bot.channel +' +o '+ nick)
  }
}
