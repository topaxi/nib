var Commands = require('../lib/commands')
  , https    = require('https')
  , URL      = 'https://developer.mozilla.org/en/JavaScript/Reference'
  , cache    = {}

Commands.add('jsref'
  , 'Lookup the JavaScript reference @ http://developer.mozilla.org/'
  , function(from, to, search) {
    search = search ? search.trim() : ''

    var self    = this
      , bot     = self._bot
      , lsearch = search.trim()

    if (!search) return say(URL)

    var parts = lsearch.split('.')
      , index = lGlobal_Objects.indexOf(parts[0].toLowerCase())

    if (!~index) {
      return say('Object "'+ search +'" not found!')
    }
    else if (!parts[1]) {
      return say(URL +'/Global_Objects/'+ Global_Objects[index])
    }

    var path = Global_Objects[index] +'/'+ parts[1]
      , url  = URL +'/Global_Objects/'+ path
      , op   = { 'host': 'developer.mozilla.org'
               , 'path': '/en/JavaScript/Reference/Global_Objects/'+ path
               }

    if (cache[path]) return say(cache[path])

    https.request(op, function(res) {
      if (res.statusCode != 200) {
        url = 'Object "'+ search +'" not found!'
      }

      say(cache[path] = url)
    }).end()

    function say(text) {
      self.say(from, to, from +': '+ text)
    }
  }
)

var Global_Objects = [ /* Constructors */
                       'Array'
                     , 'Boolean'
                     , 'Date'
                     , 'Function'
                     //, 'Iterator'
                     , 'Number'
                     ,' Object'
                     , 'RegExp'
                     , 'String'
                       /* E4X Constructors */
                     //, 'Namespace'
                     //, 'QName'
                     //, 'XML'
                     //, 'XMLList'
                       /* Typed Array Constructors */
                     , 'ArrayBuffer'
                     , 'Float32Array'
                     , 'Float64Array'
                     , 'Int16Array'
                     , 'Int32Array'
                     , 'Int8Array'
                     , 'Uint16Array'
                     , 'Uint32Array'
                     , 'Uint8Array'
                     //, 'Uint8ClampedArray'
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
                     , 'JSON'
                     , 'Math'
                     , 'NaN'
                     , 'undefined'
                     ]

// Create lower case map
var lGlobal_Objects = Global_Objects.map(function(val) {
  return val.toLowerCase()
})
