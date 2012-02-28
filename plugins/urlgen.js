var Commands = require('../lib/commands')
  , https    = require('https')
  , URL      = 'https://developer.mozilla.org/en/JavaScript/Reference'
  , cache    = {}

Commands.add('urlgen'
  , 'Generates urls for different websites/web services'
  , function(from, to, search) {
    search = search ? search.trim() : ''
    if (search.length == 0) {
      return this._bot.notice(from, 'Please provide type and request!')
    }

    var self    = this
      , bot     = self._bot
      , searchType = search.split(' ')[0]
      , searchQuery = search.slice(searchType.length + 1)
      , searchUrl = urlgen_Services[searchType.toLowerCase()]

    if (!searchUrl) {
      return bot.notice(from, 'No entry for requested service!')
    } else if (!searchQuery) {
      return bot.notice(from, 'No query given!')
    }

    var genUrl = searchUrl.replace('%s', encodeURIComponent(searchQuery))

    self.say(from, to, genUrl)
  }
)

var urlgen_Services = { 'we' : 'http://en.wikipedia.org/wiki/Special:Search?search=%s&go=Article'
                      , 'wg' : 'http://de.wikipedia.org/wiki/Special:Search?search=%s&go=Artikel'
                      , 'g' : 'http://www.google.com/search?q=%s'
                      , 'so' : 'http://stackoverflow.com/search?q=%s'
                      , 'wa' : 'http://www.wolframalpha.com/input/?i=%s'
                      , 't' : 'http://www.dict.cc/?s=%s'
                      , 'yt' : 'http://www.youtube.com/results?search_query=%s'
                      , 'a' : 'http://developer.android.com/search.html#q=%s&t=0'
                      }
