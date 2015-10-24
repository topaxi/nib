/* jshint asi:true */

var request = require('request')
  , cheerio = require('cheerio')

function getPage(url, callback) {
  request(url, function(err, res, body) {
    if (err) {
      console.err(res.headers)
      return console.error(err)
    }

    if (res.statusCode != 200 || res.headers['content-type'].indexOf('text/html') == -1)  {
      console.log(err, res.statusCode)
      return
    }

    callback(body)
  })
}

function extractImgurTitle(match, callback) {
  getPage(match, function(body) {
    var $ = cheerio.load(body)
    var title = $('#image-title').text().trim()

    callback(title)
  })
}

function extractYoutubeTitle(match, callback) {
  getPage(match, function(body) {
    var $ = cheerio.load(body)
    var title = $('#eow-title').text().trim()

    callback(title)
  })
}

module.exports = function(bot, options) {
  bot.irc.on('privmsg', function(from, channel, msg) {
    if (/^\s*!/.exec(msg)) {
      return
    }

    var imgur = /https?:\/\/(?:www\.)?imgur\.com\/gallery\/[^\s]+/.exec(msg)

    if (imgur) {
      return extractImgurTitle(imgur[0], function(title) {
        bot.say(channel, 'Imgur: ' + title)
      })
    }
    
    var youtube = /https?:\/\/(?:www\.)?i(?:youtube.com|youtu.be)\/(?:v\/|embed\/|watch(?:\?v=|\/))?[a-zA-Z0-9-]+/.exec(msg)
    if (youtube) {
      return extractYoutubeTitle(youtube[0], function(title) {
        bot.say(channel, 'Youtube: ' + title)
      })
    }

  })
}

// vim: set et sts=2 sw=2:
