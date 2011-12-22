var Commands = require('../lib/commands')
  , https    = require('https')
  , URL      = 'https://developer.mozilla.org/en/CSS'
  , cache    = {}

Commands.add('cssref'
  , 'Lookup the CSS reference @ http://developer.mozilla.org/'
  , function(from, to, search) {
    search = search ? search.trim() : ''

    var self = this
      , bot  = self._bot
      , path = search.trim()

    if (!search) return say(URL +'/CSS_Reference')

    var url  = URL +'/'+ path
      , op   = { 'host': 'developer.mozilla.org'
               , 'path': '/en/CSS/'+ path
               }

    if (cache[path]) return say(cache[path])

    https.request(op, function(res) {
      if (res.statusCode != 200) {
        url = 'Property "'+ search +'" not found!'
      }

      say(cache[path] = url)
    }).end()

    function say(text) {
      self.say(from, to, from +': '+ text)
    }
  }
)
