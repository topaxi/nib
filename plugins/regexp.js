var Command = require('../lib/commands').Command

module.exports = Command.extend({
    name: 'regexp'
  , info: 'Execute JavaScript Regular Expressions'
  , description: 'Execute JavaScript Regular Expressions'
  , handler: function(from, to, text) {
    try {
      var self  = this
        , delim = text[0]
        , r     = RegExp(delim +'(.*?)'+ delim +'(\\w+)? (.*$)').exec(text)
        , regex = RegExp(r[1], r[2])

      say(JSON.stringify(regex.exec(r[3])))
    }
    catch (e) {
      say(e)
    }

    function say(text) {
      self._bot.reply(from, to, from +': '+ text)
    }
  }
})
