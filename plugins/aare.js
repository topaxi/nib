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

    if (res.statusCode != 200 || res.headers['content-type'].indexOf('application/json') == -1) {
      console.log(err, res.statusCode)
      return
    }

    var aare_current = JSON.parse(body)
    var temp = aare_current.measureValueTemperature
    var temp_before = aare_current.measureValueTemperature

    console.log(temp)

    var direction = '';
    if (temp_before < temp) {
      direction = 'up';
    }
    else if (temp_before > temp) {
      direction = 'down';
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
        console.dir(info)

        if (info.direction == 'up') {
          var predict = "u si wird schins wermer";
        }
        else if (info.direction == 'down') {
          var predict = "aber si wird schins cheuter";
        }
        else {
          var predict = "u si blibt schins glich";
        }
        self._bot.say(channel, "D'aare isch im Momänt öppe " + info.temp + " warm " + predict)
      })
  }
})

// vim: set et sts=2 sw=2:
