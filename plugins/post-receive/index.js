var http        = require('http')
  , querystring = require('querystring')

module.exports = function(bot) {
  var server = http.createServer(function(request, respone) {
    if (request.headers['x-github-event'] != 'push') return

    var data = ''

    request.on('data', function(chunk) { data += chunk })
    request.on('end',  function() {
      var r = JSON.parse(querystring.parse(data).payload)

      bot.say([ r.pusher.name
              , ' pushed to '
              , r.repository.name
              , ' branch '
              , r.ref.match(/[^\/]+$/)[0]
              , ':'
              ].join(''))

      bot.say(r.compare)

      for (var i = 0, l = r.commits.length; i < l; ++i) {
        var commit = r.commits[i]

        bot.say([ '- '
                , commit.author.username
                , ': '
                , commit.message.replace(/\n+/g, ' ')
                ].join(''))
      }
    })
  })

  server.listen(31337)

  bot.on('quit', function() { server.close() })
}
