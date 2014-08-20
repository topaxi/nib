var fs      = require('fs')
  , url     = require('url')
  , path    = require('path')
  , mkdirp  = require('mkdirp')
  , request = require('request')
  , cheerio = require('cheerio')

var selector = { '9gag.com':   '.badge-item-img'
               , 'imgur.com':  '#image img'
               }

function downloadImage(uri, file) {
  request.head(uri, function(err, res, body){
    if (err) return console.error(err)

    if (res.headers['content-type'].contains('image/') ||
        res.headers['content-type'].contains('video/')) {
      mkdirp(path.dirname(file), function(err) {
        if (err) return console.error(err)

        request(uri).pipe(fs.createWriteStream(file))
      })
    }
    else if (res.headers['content-type'].contains('text/html')) {
      var urlObj = url.parse(uri)
        , sel    = selector[urlObj.host]

      if (sel) request(uri, function(err, res, body) {
        if (err || res.statusCode != 200) return

        var $   = cheerio.load(body)
          , $el = $(sel)
          , uri = $el.attr('src')

        if (uri) {
          if (uri.startsWith('//')) uri = 'http:'+ uri

          downloadImage(uri, file)
        }
      })
    }
  })
}

if (!String.prototype.contains) {
  String.prototype.contains = function(s) {
    return !!~this.indexOf(s)
  }
}

if (!String.prototype.startsWith) {
  String.prototype.startsWith = function(s) {
    return this.indexOf(s) === 0
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
