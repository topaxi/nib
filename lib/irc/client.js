var net          = require('net')
  , tls          = require('tls')
  , EventEmitter = require('events').EventEmitter
  , r            = require('./response')

module.exports = Client
function Client(props) {
  for (var i in props) {
    this[i] = props[i]
  }

  this._events = new EventEmitter
}

Client.prototype.on = function(event, listener) {
  this._events.on(event, listener)
}

Client.prototype.once = function(event, listener) {
  this._events.once(event, listener)
}

Client.prototype.write = function(text) {
  console.log(text)

  if (this._socket) {
    this._socket.write(text +'\n')
  }
}

Client.prototype.connect = function(host, port, cb) {
  if (!port) port = 6667

  var self = this
    , s
    , reconnect = false

  function connect() {
    if (self.ssl) {
      if (!s.authorized) {
        console.log('SSL authorization failed:', s.authorizationError)
      }
    }

    if (cb) cb.call(self, s)
  }

  if (self.ssl) {
    s = self._socket = tls.connect(port, host, connect)
  }
  else {
    s = self._socket = new net.Socket()

    s.connect(port, host, connect)
  }

  // Set default timeout to 10min
  s.setTimeout(self.timeout || 1000 * 60 * 10)

  s.on('connect', function() {
    console.log('connected to %s:%d', host, port)
  })

  s.on('data', function(data) {
    data = data.toString().trim().split('\r\n')

    for (var i = 0, l = data.length; i < l; ++i) {
      self.message(data[i])
    }
  })

  self._events.on('ping', function(prefix, params) {
    s.write('PONG '+ params.slice(1) +'\n')
  })

  s.on('error', function(err) {
    console.log('socket error:', err)
  })

  s.on('timeout', function() { reconnect = true; s.destroy() })

  s.on('close', function() {
    // TODO: Should unbind all events which are assigned in the connect method
    console.log('irc socket closed')

    if (reconnect) {
      reconnect = false
      console.log('reconnecting to %s:%d...', host, port)
      self.connect(host, port, cb)
    }
  })

  s.on('end', function() {
    console.log('irc socket ended')
  })
}

Client.prototype.message = function(message) {
  var matches

  console.log(message)

  if (matches = /^(?:\:(.*?) )?(.*?) (.*?)$/.exec(message)) {
    var prefix  = matches[1]
      , command = matches[2].toLowerCase()
      , params  = matches[3]

    this._events.emit(command, prefix, params)
  }
}

Client.prototype.names = function(channels, cb) {
  var self  = this
    , names = {}

  self._events.on(r.RPL_NAMREPLY, namereply)

  self._events.once(r.RPL_ENDOFNAMES, function(prefix, params) {
    self._events.removeListener(r.RPL_NAMREPLY, namereply)

    if (cb) cb(names)
  })

  self.write('NAMES '+ channels)

  function namereply(prefix, params) {
    var matches

    if (matches = /(?:=|\*) (.*?) :(.*?)$/.exec(params)) {
      names[matches[1]] = matches[2].match(/([^ @+]+)/g)
    }
  }
}

Client.prototype.quit = function() {
  var s = this._socket

  console.log('QUIT')

  if (s && s.writable) {
    s.write('QUIT\n')
    s.destroy()
  }
}
