var fs     = require('fs')
  , path   = require('path')
  , mkdirp = require('mkdirp')

function get(url, callback) {
  var http    = url.startsWith('https') ? require('https') : require('http')
    , request = http.get(url, callback)

  request.on('error', console.error)
}

if (!String.prototype.startsWith) {
  String.prototype.startsWith = function(s) {
    return !this.indexOf(s)
  }
}

module.exports = function(bot, options) {
  if (!options.dest) {
    throw new Error('No piclog destination set!')
  }

  function allowedToLog(to) {
    return to.startsWith('#') && ~options.channels.indexOf(to)
  }

  function getURL(msg) {
    var r = /https?:\/\/[^\s]+/.exec(msg)

    return r && r[0]
  }

  bot.irc.on('privmsg', function(from, to, msg) {
    var url

    function dest() {
      return options.dest +'/'+ to +'/'+ dir() +'/'+ file() +'_by_'+ from
    }

    if (allowedToLog(to) && (url = getURL(msg))) {
      get(url, function(res) {
        if (res.headers['content-type'].startsWith('image/')) {
          mkdirp(path.dirname(dest()), function(err) {
            if (err) return console.error(err)

            res.pipe(fs.createWriteStream(dest()))
          })
        }
      })
    }
  })
}

function dir() {
  var d = new Date

  return d.getFullYear() +''+ (d.getMonth() + 1)
}

function file() {
  return Date.now()
}
