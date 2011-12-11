/*
 *Automatically tries to op joining people listed in a oper-list.
 */
module.exports = function(bot) {
  bot._oper = require('./opers.json')  
  bot.irc.on('join', function(user) {
    var nick = user.split('!')[0]

    if (~bot._oper.indexOf(nick)) {
      op(nick)
    } 
  })

  function op(nick) {
    bot.irc.write('MODE ' + bot.channel + ' +o ' + nick)
  }
}
