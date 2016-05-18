/* jshint asi:true */

var Command = require('../lib/commands').Command
  , request = require('request')
  , cheerio = require('cheerio')

var AARE_API_URL = 'https://aaremarzili.ch/rest/open/wasserdatencurrent'

function getTemp(callback) {
  request(AARE_API_URL, function(err, res, body) {
    if (err) {
      callback(err)

      return
    }

    if (res.statusCode !== 200 ||
        res.headers['content-type'].indexOf('application/json') === -1) {
      return
    }

    var aareCurrent = JSON.parse(body)
    var temp = aareCurrent.measureValueTemperature
    var tempBefore = aareCurrent.measureValueTemperature

    var direction = ''
    if (tempBefore < temp) {
      direction = 'up'
    }
    else if (tempBefore > temp) {
      direction = 'down'
    }
    else {
      direction = 'stable'
    }

    callback(null, { temp: temp, direction: direction })
  })
}

module.exports = Command.extend( {
    name: 'aare'
  , info: 'Aare temperature'
  , description: 'Shows the temperature of the river aare in berne'
  , handler:  function(from, channel) {
    var bot = this._bot

    getTemp(function(err, info) {
      if (err) {
        return
      }

      if (info.direction === 'up') {
        var predict = 'u si wird schins wermer'
      }
      else if (info.direction === 'down') {
        var predict = 'aber si wird schins cheuter'
      }
      else {
        var predict = 'u si blibt schins glich'
      }

      bot.reply(from, channel,
        'D\'aare isch im Momänt öppe ' + info.temp + ' warm ' + predict
      )
    })
  }
})

// vim: set et sts=2 sw=2:
