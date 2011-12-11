/*
 *Automatically tries to op joining people given in a oper-list.
 */
module.exports = function(bot) {
	  
  bot._oper = ['slup', 'topaxi']
  bot.irc.on('join', function(user) {
    var nick = user.split('!')[0]

    if (~bot._oper.indexOf(nick)) {
      bot.say('Welcome back master ' + nick)
      op(nick)
    } 
  })

  function op(nick) {
    bot.irc.write('MODE ' + bot.channel + ' +o ' + nick)
  }
}
