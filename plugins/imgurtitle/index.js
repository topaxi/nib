/* jshint asi:true */

var url     = require('url')
  , request = require('request')
  , cheerio = require('cheerio')

function extractTitle(match, bot) {
  request(match, function(err, res, body) {
    console.dir(res.headers)
    if (err) {
      return console.error(err)
    }

    if (res.statusCode != 200 || res.headers['content-type'].indexOf('text/html') == -1)  {
      console.log(err, res.statusCode)
      return
    }

    var $ = cheerio.load(body)
    var title = $('h2#image-title').text()

    console.log(title)
    bot.say("Imgur: " + title)
  })
}

module.exports = function(bot, options) {
  bot.irc.on('privmsg', function(from, channel, msg) {
    var match = /https?:\/\/(?:www\.)?imgur\.com\/gallery\/[^\s]+/.exec(msg)

    if (match) {
      extractTitle(match[0], bot)
    }
  })
}

// vim: set et sts=2 sw=2:
