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
        excuses = excuses.concat(data.split('\n').map(function(val) {
          val = val.trim()

          if (val) return val
        }))
      })
    })
    .on('error', function(err) { console.log(err) })

    bot.irc.on('privmsg', function(prefix, params) {
      var channel = params.split(' ')[0]
        , msg     = params.split(':')[1]
        , excuse

      if (~msg.indexOf('problem') ||
          ~msg.indexOf('fail')    ||
          ~msg.indexOf('down')    ||
          ~msg.indexOf('offline') ||
          ~msg.indexOf('kaputt')  ||
          ~msg.indexOf('help')) {
        excuse = getRandomBOFH()

        if (excuse) bot.say(channel, excuse)
      }
    })
  }
  , function(from, to, nick) {
    var excuse = getRandomBOFH()

    if (excuse) this.say(from, to, getRandomBOFH())
  }
)

function getRandomBOFH() {
  return excuses[~~(Math.random() * (excuses.length+1))]
}
