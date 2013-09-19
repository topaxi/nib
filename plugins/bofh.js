var http    = require('http')
  , Command = require('../lib/commands').Command

module.exports = Command.extend({
    name: 'bofh'
  , info: 'Useful computer problem excuses'
  , description: 'Gives you an useful excuse for various computer problems, '
               + 'taken from http://pgl.yoyo.org/bofh/excuses.txt :)'
  , triggerWords: [ 'problem'
                  , 'fail'
                  , 'down'
                  , 'offline'
                  , 'kaputt'
                  , 'help'
                  ]
  , init: function(bot) {
      var self = this

      self.privmsg = self.privmsg.bind(self)
      self.excuses = []

      http.get({ 'host': 'pgl.yoyo.org'
               , 'port': 80
               , 'path': '/bofh/excuses.txt' }, function(res) {
        var data = ''

        res.on('data', function(chunk) { data += chunk })
        res.on('end', function() {
          self.excuses = self.excuses.concat(data.split('\n').map(function(val) {
            val = val.trim()

            if (val) return val
          }))

          if (!self.excuses.length) {
            return bot.commands.remove('bofh')
          }

          bot.irc.on('privmsg', self.privmsg)
        })
      })
      .on('error', function(err) {
        bot.commands.remove('bofh')

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
      var excuse = this.getRandomBOFH()

      this._bot.reply(from, to, excuse)
    }
  , getRandomBOFH: function() {
      return this.excuses[~~(Math.random() * (this.excuses.length+1))]
    }
})
