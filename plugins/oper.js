var Commands = require('../lib/commands')

Commands.add('oper'
  , 'If bot is OP, OPs joining people listed in the oper-list.'
  , function(bot) {
    bot._oper = new Array('example', 'admin')
    bot.irc.on('join', function(user) {
      var nick = user.split('!')[0]

      if (~bot._oper.indexOf(nick)) {
	say('Welcome back, master ' + nick)
	op(nick)
      } 
    })

    function op(nick) {
      bot.irc.write('MODE ' + bot.channel + ' +o ' + nick)
    }

    function say(text) {
      bot.say(text)
    }
  }
 , function(from, to, nick) {
   /* not used */
  }
)
