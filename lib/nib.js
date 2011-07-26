#!/usr/bin/env node

var net      = require('net')
  , Commands = require('./commands')

module.exports = Nib
function Nib(props) {
  for (var i in props) {
    this[i] = props[i]
  }

  this.user = 'nib 0 * NodeIrcBot'
  this.connect()

  this.commands = new Commands(this)
}

Nib.prototype = {
  connect: function() {
    var self   = this
      , s      = self._irc = new net.Socket()

    s.connect(self.port, self.host, function() {
      self.write('NICK '+ self.nick)
      self.write('USER '+ self.user)
      self.write('JOIN '+ self.channel)
    })

    s.on('data', function(data) {
      data = data.toString().trim()

      var matches

      console.log(data)

      if (matches = /^PING :(.*)$/.exec(data)) {
        self.write('PONG '+ matches[1])
      }
      else if(matches = /^:(.*?)!.*?PRIVMSG (.*?) :!(.*?)(?: (.*))?$/.exec(data)) {
        var from      = matches[1]
          , to        = matches[2]
          , command   = matches[3]
          , parameter = matches[4]

        if (typeof self.commands[command] == 'function') {
          self.commands[command](from, to, parameter)
        }
      }
    })

    s.on('error', function(data) {
      console.log(data)
    })
  },
  say: function(to, text) {
    if (text === undefined) {
      text = to
      to   = undefined
    }

    this.write('PRIVMSG '+ (to || this.channel) +' :'+ text)
  },
  write: function(text) {
    console.log(text)

    if (this._irc) {
      this._irc.write(text +'\n')
    }
  },
  quit: function() {
    console.log('QUIT')

    if (this._irc && this._irc.writable) {
      this._irc.write('QUIT\n')
      this._irc.destroy()
    }
  }
}
