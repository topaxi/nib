var net          = require('net')
  , tls          = require('tls')
  , EventEmitter = require('events').EventEmitter

module.exports = Client
function Client(props) {
  for (var i in props) {
    this[i] = props[i]
  }

  this._events = new EventEmitter

  if (this.host) this.connect(this.host, this.port)
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

Client.prototype.connect = function(host, port) {
  if (!port) port = 6667

  var self = this
    , s

  function connect() {
    if (self.ssl) {
      if (!s.authorized) {
        console.log('SSL authorization failed:', s.authorizationError)
      }
    }

    self.write('NICK '+ self.nick)
    self.write('USER '+ self.user)
    self.write('JOIN '+ self.channel)
  }

  if (self.ssl) {
    s = self._socket = tls.connect(port, host, connect)
  }
  else {
    s = self._socket = new net.Socket()

    s.connect(port, host, connect)
  }

  s.on('data', function(data) {
    data = data.toString().trim()

    var matches

    console.log(data)

    if (matches = /^(?:\:(.*?) )?(.*?) (.*?)$/.exec(data)) {
      var prefix  = matches[1]
        , command = matches[2].toLowerCase()
        , params  = matches[3]

      self._events.emit(command, prefix, params)
    }
  })

  self._events.on('ping', function(prefix, params) {
    self.write('PONG '+ params.slice(1))
  })

  s.on('error', function(data) {
    console.log(data)
  })
}

Client.prototype.quit = function() {
  var s = this._socket

  console.log('QUIT')

  if (s && s.writable) {
    s.write('QUIT\n')
    s.destroy()
  }
}
