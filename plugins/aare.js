/* jshint asi:true */

var Command = require('../lib/commands').Command
  , request = require('request')
  , cheerio = require('cheerio')

function getTemp(callback) {
  request('http://www.aaremarzili.info', function(err, res, body) {
    if (err) {
      console.err(res.headers)
      return console.error(err)
    }

    if (res.statusCode != 200 || res.headers['content-type'].indexOf('text/html') == -1)  {
      console.log(err, res.statusCode)
      return
    }

    var $ = cheerio.load(body)
    var temp = $('td.temperaturvalue').text().trim()

    console.log(temp)

    var direction = '';
    var dirImg = $('td.hintergrundblau img').attr('src')
    if (/up\.gif$/.exec(dirImg)) {
      direction = 'up';
    }
    else {
      direction = 'down';
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
        else {
          var predict = "aber si wird schins cheuter";
        }
        self._bot.say(channel, "D'aare isch im Momänt öppe " + info.temp + " warm " + predict)
      })
  }
})

// vim: set et sts=2 sw=2:
