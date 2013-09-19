var Command  = require('../lib/commands').Command
  , https    = require('https')
  , BASEPATH = '/en-US/docs/Web/JavaScript/Reference'
  , DOMAIN   = 'developer.mozilla.org'
  , cache    = {}

function makeURL(path) {
  return 'https://'+ DOMAIN + path
}

module.exports = Command.extend({
    name: 'jsref'
  , info: 'Lookup JavaScript references'
  , description: 'Lookup the JavaScript reference @ http://developer.mozilla.org/'
  , handler: function(from, to, search) {
    search = search ? search.trim() : ''

    var self    = this
      , lsearch = search

    if (!search) return say(makeURL(BASEPATH))

    var parts = lsearch.split('.')
      , index = lGlobal_Objects.indexOf(parts[0].toLowerCase())

    if (!~index) {
      return say('Object "'+ search +'" not found!')
    }
    else if (!parts[1]) {
      return say(URL +'/Global_Objects/'+ Global_Objects[index])
    }

    var path = BASEPATH + '/Global_Objects/'+ Global_Objects[index] +'/'+ parts[1]
      , url  = makeURL(path)
      , op   = { 'host': DOMAIN
               , 'path': path
               }

    if (cache[path]) return say(cache[path])

    https.request(op, function(res) {
      if (res.statusCode != 200) {
        url = 'Object "'+ search +'" not found!'
      }

      say(cache[path] = url)
    }).end()

    function say(text) {
      self._bot.reply(from, to, from +': '+ text)
    }
  }
})

var Global_Objects = [ /* Constructors */
                       'Array'
                     , 'Boolean'
                     , 'Date'
                     , 'Function'
                     //, 'Iterator'
                     , 'Number'
                     , 'Object'
                     , 'RegExp'
                     , 'String'
                     , 'Proxy'
                     , 'ParallelArray'
                       /* E4X Constructors */
                     //, 'Namespace'
                     //, 'QName'
                     //, 'XML'
                     //, 'XMLList'
                       /* Typed Array Constructors */
                     , 'ArrayBuffer'
                     , 'DataView'
                     , 'Float32Array'
                     , 'Float64Array'
                     , 'Int16Array'
                     , 'Int32Array'
                     , 'Int8Array'
                     , 'Uint16Array'
                     , 'Uint32Array'
                     , 'Uint8Array'
                     //, 'Uint8ClampedArray'
                       /* Internationalization constructors */
                     , 'Collator'
                     , 'DateTimeFormat'
                     , 'NumberFormat'
                       /* Errors */
                     , 'Error'
                     , 'EvalError'
                     //, 'InternalError'
                     , 'RangeError'
                     , 'ReferenceError'
                     //, 'StopIteration'
                     , 'SyntaxError'
                     , 'TypeError'
                     , 'URIError'
                       /* Non-constructor functions */
                     , 'decodeURI'
                     , 'decodeURIComponent'
                     , 'encodeURI'
                     , 'encodeURIComponent'
                     , 'eval'
                     , 'isFinite'
                     , 'isNaN'
                     , 'parseFloat'
                     , 'parseInt'
                     //, 'uneval'
                       /* Other */
                     , 'Infinity'
                     , 'Intl'
                     , 'JSON'
                     , 'Math'
                     , 'NaN'
                     , 'undefined'
                     , 'null'
                     ]

// Create lower case map
var lGlobal_Objects = Global_Objects.map(function(val) {
  return val.toLowerCase()
})
