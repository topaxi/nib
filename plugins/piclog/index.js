var fs      = require('fs')
  , path    = require('path')
  , mkdirp  = require('mkdirp')
  , request = require('request')

function downloadImage(uri, file) {
  request.head(uri, function(err, res, body){
    if (err) return console.err(err)

    if (res.headers['content-type'].startsWith('image/')) {
      mkdirp(path.dirname(file), function(err) {
        if (err) return console.error(err)

        request(uri).pipe(fs.createWriteStream(file))
      })
    }
  })
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

  bot.irc.on('privmsg', function(from, channel, msg) {
    var url

    function dest() {
      return options.dest +'/'+ channel.slice(1) +'/'+ dir() +'/'+ file() +'_by_'+ from + path.extname(url)
    }

    if (allowedToLog(channel) && (url = getURL(msg))) {
      downloadImage(url, dest())
    }
  })
}

function dir() {
  var d = new Date

  return d.getFullYear() +''+ zeropad((d.getMonth() + 1), 2)
}

function file() {
  return Date.now()
}

function zeropad(n, d) {
  for (n = ''+ (n >>> 0); n.length < d;) n = '0'+ n; return n
}
