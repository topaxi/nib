var Commands = require('../lib/commands')
  , http     = require('http')
  , excuses  = []

Commands.add('bofh'
  , 'Gives you an useful excuse for various computer problems,'
   +' taken from http://pgl.yoyo.org/bofh/excuses.txt :)'
  , function(bot) {
    http.get({ 'host': 'pgl.yoyo.org'
             , 'port': 80
             , 'path': '/bofh/excuses.txt'}, function(res) {
      var data = ''

      res.on('data', function(chunk) { data += chunk })
      res.on('end', function() {
        excuses.concat(data.split('\n').map(function(val) {
          val = val.trim()

          if (val) return val
        }))
      })
    })
    .on('error', function(err) { console.log(err) })

    bot.irc.on('privmsg', function(prefix, params) {
      var from = prefix.split('!')[0]

      if (~params.indexOf('problem') ||
          ~params.indexOf('fail')    ||
          ~params.indexOf('down')    ||
          ~params.indexOf('offline') ||
          ~params.indexOf('kaputt')  ||
          ~params.indexOf('help')) {
        say(bot.commands, from, '')
      }
    })
  }
  , function(from, to, nick) {
    say(this, to)
  }
)

function say(bot, from) {
  var excuse = excuses[~~(Math.random() * (excuses.length+1))]

  if (excuse) bot.say(from, excuse)
}
