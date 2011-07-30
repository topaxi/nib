#!/usr/bin/env node

var Proxy  = require('node-proxy')
  , http   = require('http')
  , query  = require('querystring')
  , noop   = function() { }
  , lastfm = module.exports = {}
  , as     = { host: 'ws.audioscrobbler.com', port: 80 }
  , apikey

function call(className, method, options, callback) {
  if (!options.api_key) options.api_key = apikey

  var method = className +'.'+ method
    , path = '/2.0/?method='+ method +'&'+ query.stringify(options)

  http.get({ host: as.host, port: as.port, path: path }, function(res) {
    var data = ''

    res.on('data', function(chunk) {
      data += chunk
    })

    res.on('end', function() {
      if (~data.indexOf('<lfm status="ok">')) {
        callback.call(lastfm[className], null, data)
      }
      else {
        var err = /<error code="(\d+)">(.*?)<\/error>/.exec(data)
        callback.call(lastfm[className], new Error(err[2]), null)
      }
    })
  }).on('error', function(e) {
    callback.call(lastfm[className], e, data)
  })
}

lastfm.create = function(className) {
  return Proxy.create({
    get: function(proxy, propName) {
      return function() {
        return call(className, propName, arguments[0], arguments[1])
      }
    }
  })
}

lastfm.setAPIKey = function(value) {
  apikey = value
}

var classes = [
    'Album'
  , 'Artist'
  , 'Auth'
  , 'Chart'
  , 'Event'
  , 'Geo'
  , 'Group'
  , 'Library'
  , 'Playlist'
  , 'Radio'
  , 'Tag'
  , 'Tasteometer'
  , 'Track'
  , 'User'
  , 'Venue'
]

for(var i = 0, l = classes.length; i < l; i++) {
  var className = classes[i]

  lastfm[className] = lastfm.create(className.toLowerCase())
}
