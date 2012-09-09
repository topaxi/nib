var Commands  = require('../lib/commands')
  , responses = [
      'It is certain'
    , 'It is decidedly so'
    , 'Without a doubt'
    , 'Yes – definitely'
    , 'You may rely on it'
    , 'As I see it, yes'
    , 'Most likely'
    , 'Outlook good'
    , 'Yes'
    , 'Signs point to yes'
    , 'Reply hazy, try again'
    , 'Ask again later'
    , 'Better not tell you now'
    , 'Cannot predict now'
    , 'Concentrate and ask again'
    , 'Don\'t count on it'
    , 'My reply is no'
    , 'My sources say no'
    , 'Outlook not so good'
    , 'Very doubtful'
  ]



function decide() {
  return responses[~~(Math.random() * (responses.length+1))]
}

Commands.add('8ball'
  , 'Helps you with finding decisions,'
  , function(bot) {
       var triggers = [
            /^söui.*\?$/i
            , /^should i.*\?$/i
            , /^will.*\?$/i
            , /^is.*\?$/i
            , /^not sure if.*$/i
            , /^are you sure.*\?$/i
            , /^sicher\?$/i
            , /^sure\?$/i
            , new RegExp('^' + bot.nick + ':.*\\?$', 'i')
            , new RegExp('^' + bot.nick + ',.*\\?$', 'i')
          ]
        , decoder = /^([^\s]+) :(.*)/
      bot.irc.on('privmsg', function(prefix, params) {
        var match     = params.match(decoder)
          , channel   = match[1]
          , msg       = match[2]
          , triggered = false

        triggers.forEach(function(re) {
          if(triggered) {
            return
          }
          if (msg.match(re)) {
            bot.say(channel, decide())
          }
        })
      })
    }
  , function(from, to, nick) {
    var response = decide()
    this.say(from, to, response)
  }
)

