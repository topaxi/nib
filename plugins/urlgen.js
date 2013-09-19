var Command = require('../lib/commands').Command

module.exports = Command.extend({
    name: 'urlgen'
  , info: 'Generates urls for different websites/web services'
  , description: 'Generates urls for different websites/web services\n'
                +'- we | english wikipedia\n'
                +'- wg | german wikipedia\n'
                +'-  g | google\n'
                +'- so | stackoverflow\n'
                +'- wa | wolframalpha\n'
                +'-  t | dict.cc\n'
                +'- yt | youtube\n'
                +'-  a | developer.android.com'
  , handler: function(from, to, search) {
    search = search ? search.trim() : ''

    if (search.length == 0) {
      return this._bot.notice(from, 'Please provide type and request!')
    }

    var searchType = search.split(' ')[0]
      , searchQuery = search.slice(searchType.length + 1)
      , searchUrl = urlgenServices[searchType.toLowerCase()]

    if (!searchUrl) {
      return this._bot.notice(from, 'No entry for requested service!')
    }
    else if (!searchQuery) {
      return this._bot.notice(from, 'No query given!')
    }

    var genUrl = searchUrl.replace('%s', encodeURIComponent(searchQuery))

    this._bot.reply(from, to, genUrl)
  }
})

var urlgenServices = { 'we' : 'http://en.wikipedia.org/wiki/Special:Search?search=%s&go=Article'
                     , 'wg' : 'http://de.wikipedia.org/wiki/Special:Search?search=%s&go=Artikel'
                     , 'g' : 'http://www.google.com/search?q=%s'
                     , 'so' : 'http://stackoverflow.com/search?q=%s'
                     , 'wa' : 'http://www.wolframalpha.com/input/?i=%s'
                     , 't' : 'http://www.dict.cc/?s=%s'
                     , 'yt' : 'http://www.youtube.com/results?search_query=%s'
                     , 'a' : 'http://developer.android.com/search.html#q=%s&t=0'
                     }
