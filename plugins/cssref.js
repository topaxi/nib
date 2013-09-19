var Command  = require('../lib/commands').Command
  , https    = require('https')
  , BASEPATH = '/en-US/docs/Web/CSS/'
  , DOMAIN   = 'developer.mozilla.org'
  , cache    = {}

function makeURL(path) {
  return 'https://'+ DOMAIN + path
}

module.exports = Command.extend({
    name: 'cssref'
  , info: 'Lookup CSS references'
  , description: 'Lookup the CSS reference @ http://developer.mozilla.org/'
  , handler: function(from, to, search) {
    search = search ? search.trim() : ''

    var self = this
      , path = search

    if (!search) return say(makeURL('/CSS_Reference'))

    var url  = makeURL(BASEPATH + path)
      , op   = { 'host': DOMAIN
               , 'path': BASEPATH + path
               }

    if (cache[path]) return say(cache[path])

    https.request(op, function(res) {
      if (res.statusCode != 200) {
        url = 'Property "'+ search +'" not found!'
      }

      say(cache[path] = url)
    }).end()

    function say(text) {
      self._bot.reply(from, to, from +': '+ text)
    }
  }
})
