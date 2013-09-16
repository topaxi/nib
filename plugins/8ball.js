var Command   = require('../lib/commands').Command
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

module.exports = Command.extend({
    name: '8ball'
  , description: 'Helps you with finding decisions,'
  , init: function(bot) {
       this.triggers = [
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

      this.privmsg = this.privmsg.bind(this)

      bot.irc.on('privmsg', this.privmsg)
    }
  , handler: function(from, to) {
    this._bot.reply(from, to, decide())
  }
  , privmsg: function(from, to, msg) {
    if (this.triggers.some(function(re) { return msg.match(re) })) {
      this.handler(from, to)
    }
  }
  , cleanup: function(bot) {
    bot.irc.off('privmsg', this.privmsg)
  }
})
