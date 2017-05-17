/* jshint asi:true */

var Command = require('../lib/commands').Command
  , request = require('request')

var AARE_API_URL = 'https://aaremarzili-api.herokuapp.com/rest/open/wasserdatencurrent'
var AARE_ORIGIN_URL = 'https://aaremarzili.ch/'
var AARE_RIVER_NAME = 'AAREMARZILIBERN'

function getTemp(callback) {
  var rqOptions = {
    url: AARE_API_URL,
    headers: {
      'Origin': AARE_ORIGIN_URL,
      'X-River': AARE_RIVER_NAME,
    }
  }
  request(rqOptions, function(err, res, body) {
    if (err) {
      callback(err)

      return
    }

    if (res.statusCode !== 200 ||
        res.headers['content-type'].indexOf('application/json') === -1) {
      callback(new Error('Response error'))
      return
    }

    callback(null, JSON.parse(body))
  })
}

module.exports = Command.extend({
    name: 'aare'
  , info: 'Aare temperature'
  , description: 'Shows the temperature of the river aare in berne'
  , handler:  function(from, channel) {
    var bot = this._bot

    getTemp(function(err, temp) {
      if (err) {
        return
      }

      var tempFuture = temp.measureValueTemperatureFuture
      var tempNow = temp.measureValueTemperature
      var predict

      if (tempFuture > tempNow) {
        predict = 'u si wird schins wermer'
      }
      else if (tempFuture < tempNow) {
        predict = 'aber si wird schins cheuter'
      }
      else {
        predict = 'u si blibt schins glich'
      }

      bot.reply(from, channel,
        'D\'aare isch im Momänt öppe ' + tempNow + '° warm ' + predict
      )
    })
  }
})

// vim: set et sts=2 sw=2:
