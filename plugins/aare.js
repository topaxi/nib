/* jshint asi:true */

var Command = require('../lib/commands').Command
  , request = require('request')
  , cheerio = require('cheerio')

function getTemp(callback) {
  request('https://aaremarzili.ch/rest/open/wasserdatencurrent', function(err, res, body) {
    if (err) {
      console.err(res.headers)
      return console.error(err)
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

    callback( {temp: temp, direction: direction})
  })
}

module.exports = Command.extend( {
    name: 'aare'
  , info: 'Aare temperature'
  , description: 'Shows the temperature of the river aare in berne'
  , handler:  function(from, channel, msg) {
    var self = this

      getTemp(function(info) {
        if (info.direction === 'up') {
          var predict = 'u si wird schins wermer'
        }
        else if (info.direction === 'down') {
          var predict = 'aber si wird schins cheuter'
        }
        else {
          var predict = 'u si blibt schins glich'
        }
        self._bot.say(channel, 'D\'aare isch im Momänt öppe ' + info.temp + ' warm ' + predict)
      })
  }
})

// vim: set et sts=2 sw=2:
