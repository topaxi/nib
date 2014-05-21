var http    = require('http')
  , Command = require('../lib/commands').Command

module.exports = Command.extend({
    name: 'kspr'
  , info: 'Useful computer problem excuses'
  , description: 'Gives you an useful excuse for various computer problems, '
               + 'taken from http://pgl.yoyo.org/bofh/excuses.txt :)'
  , triggerWords: [ 'apple'
                  , 'windows'
                  , 'verkauf'
                  , 'verkaufen'
                  , 'kaufen'
                  , 'kauf'
                  , 'business'
                  , 'markt'
                  , 'deal'
                  ]
  , init: function(bot) {
      var self = this

      self.privmsg = self.privmsg.bind(self)
      self.excuses = [ 'Due dilligence erhöhen'
                       'Einander den Ball zuspielen'
                       'Mehr Synergien erschaffen'
                       'Mehr Business aquirieren'
                       'Weniger Wintel-Umgebungen verkaufen'
                       ''
                     ]

 
      .on('error', function(err) {
        bot.commands.remove('kspr')

        self.error(err)
      })
    }
  , privmsg: function(from, to, msg) {
      if (this.triggerWords.some(function(word) { return ~msg.indexOf(word) })) {
        this.handler(from, to)
      }
    }
  , cleanup: function(bot) {
      bot.irc.off('privmsg', this.privmsg)
    }
  , handler: function(from, to) {
      var excuse = this.getRandomKSPR()

      this._bot.reply(from, to, excuse)
    }
  , getRandomKSPR: function() {
      return this.excuses[~~(Math.random() * (this.excuses.length+1))]
    }
})
