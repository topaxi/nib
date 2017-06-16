var Command = require('../lib/commands').Command

const http = require('http');
const querystring = require('querystring');

const hostname = 'transport.opendata.ch';
const stationPath = '/v1/stationboard';

module.exports = Command.extend({
  name: 'departure'
  , info: 'Timetable departures'
  , description:
    'Fetches the next scheduled departures from a public transport station.\n'
     + 'Syntax: departure <stationName> [limit]\n'
     + 'Use limit to read a max number of scheduled departure timestamps.\n'
     + 'Default value for limit is 7, max. is 20\n'
     + 'Results are printed line-by-line and sent using private messages.\n'
     + 'Note: stationName is not allowed to include any whitespace. Use\n'
     + 'something like \'Bern,Bärenplatz\' (not \'Bern Bärenplatz\') for\n.'
     + 'complex station names.'
  , handler: function(from, to, args) {
    var bot = this._bot

    if (!args) {
      bot.reply(from, from, 'stationName is mandatory!');
      return
    }
    var stationName = args.split(' ')[0]
    var limit = args.slice(stationName.length + 1)

    if (parseInt(limit) <= 0 || isNaN(parseInt(limit)))
      limit = 7
    if (limit > 20)
      limit = 20

    getDepartures(stationName, limit, function(err, timetable) {
      if (err) {
        bot.reply(from, from, 'Ooops: ' + err)
        return
      }

      printArray(bot, from, from, timetable, 0, 500)
    })
  }
})

printArray = function(bot, from, to, arr, start, delay) {
  if (start >= arr.length)
    return

  bot.reply(from, to, arr[start])
  start++
  if (start % 5 == 0 && delay < 1800)
    delay += (delay / 2);
  setTimeout(function() {
    printArray(bot, from, to, arr, start, delay)
  }, delay)
}

query = function(host, path, argsObject, callback) {
  if (!host) callback(new Error('host must be set!'))
  if (!path) callback(new Error('path must be set!'))
  if (!argsObject) callback(new Error('argsObject must be set!'))

  var url = path
  url += ('?' + querystring.stringify(argsObject))

  var data = ''
  var opts = { hostname: host, path: url, method: 'GET', port: 80 }
  var req = http.request(opts, function(resp) {
    resp.on('data', function(chunk) {
      data += chunk
    });
    resp.on('end', function() {
      try {
        var o = JSON.parse(data);
        callback(null, o)
      }
      catch (err) {
        callback(new Error('Failed to parse data as json data: ' + err))
      }
    });
  });
  req.on('error', function(err) {
    callback(err)
  });
  req.end();
}

getDepartures = function(stationName, limit, callback) {
  if (!stationName)
    callback(new Error('stationName must be set!'))

  var args = { station: stationName }
  if (limit)
    args.limit = limit

  query(hostname, stationPath, args, function(err, data) {

    if (err) {
      callback(err);
      return
    }

    var timetable = []

    if (!data.station) {
      timetable.push('No matching station for \'' + stationName + '\' found')
      callback(null, timetable)
      return
    }

    try {
      var exactStationName = data.station.name
      if (!data.stationboard || data.stationboard.length == 0) {
        timetable.push('No departures found for station \''
          + exactStationName + '\'')
      }
      else {
        timetable.push('Next scheduled courses from ' + exactStationName + ':')
        for (var i = 0; i < data.stationboard.length; i++) {
          var journey = data.stationboard[i]
          var dep = new Date(journey.stop.departure)
          var msg = journey.name + ' to ' + journey.to + ' at '
            + dep.toLocaleTimeString()
          if (journey.stop.platform)
            msg += ' from platform ' + journey.stop.platform
          timetable.push(msg)
        }
      }
      callback(null, timetable)
    }
    catch (err) {
      callback(new Error('Failed to parse returned data: ' + err))
    }
  });
}
