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
     + 'Syntax: departure <stationName> [time] [limit]\n'
     + 'time can be in the format hh:mm to fetch todays departures from.\n'
     + 'that time on, or a date-time in the format YYYY-MM-DDTHH:MM:SS.\n'
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

    var argsArr = args.split(' ');
    var stationName = args.split(' ')[0]

    // for a plain number assume its the limit
    // for anything else, try to parse as hh:mm
    // or using Date.parse()
    var limit = null;
    var time = null;
    var limitReg = new RegExp('^\\d+$')
    var timeReg = new RegExp('^(\\d\\d?):(\\d\\d?)$')
    for (var i = 1; i < argsArr.length && i < 3; i++) {
      if (limitReg.exec(argsArr[i])) {
        limit = argsArr[i];
      }
      else {
        var m = timeReg.exec(argsArr[i]);
        if (m) {
          time = new Date(Date.now());
          time.setUTCHours(m[1]);
          time.setUTCMinutes(m[2]);
          time.setUTCSeconds(0);
        }
        else {
          var tmp = Date.parse(argsArr[i]);
          if (tmp !== 'Invalide Date' && !isNaN(tmp))
            time = new Date(tmp);
        }
      }
    }

    if (!limit || limit < 0)
      limit = 7
    if (limit > 20)
      limit = 20

    getDepartures(stationName, limit, time, function(err, timetable) {
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

getDepartures = function(stationName, limit, time, callback) {
  if (!stationName)
    callback(new Error('stationName must be set!'))

  var args = { station: stationName }
  if (limit)
    args.limit = limit

  if (time) {
    // where is printf?
    var Y = time.getUTCFullYear();
    var M = time.getUTCMonth() + 1;
    var D = time.getUTCDate();
    var h = time.getUTCHours();
    var m = time.getUTCMinutes();
    var str = Y + '-' + (M < 10 ? '0' + M : M) + '-' + (D < 10 ? '0' + D : D)
        + ' ' + (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' : m)
    args.datetime = str;
  }

  query(hostname, stationPath, args, function (err, data) {
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
        if(time)
          timetable.push('Scheduled courses from ' + exactStationName + ' at ' + args.datetime + ':')
        else
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
