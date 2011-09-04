var net          = require('net')
  , tls          = require('tls')
  , EventEmitter = require('events').EventEmitter
  , irc          = require('./irc')
  , Commands     = require('./commands')

module.exports = Nib
function Nib(props) {
  this._init(props)
}

Nib.prototype = {
  _init: function(props) {
    var self = this
      , plugin, i

    props = props || {}
    props.user = 'nib 0 * NodeIrcBot - https://github.com/topaxi/nib'

    for (i in props) {
      self[i] = props[i]
    }

    self._events = new EventEmitter
    self.irc     = new irc.Client(props)

    if (self.plugins && self.plugins.length) {
      for (i in self.plugins) {
        plugin = require('../plugins/'+ self.plugins[i])

        if (typeof plugin == 'function') plugin(self)
      }
    }

    self.commands = new Commands(self)

    self.irc.on('privmsg', function(prefix, params) {
      var from    = prefix.split('!')[0]
        , matches = /^(.*?) :!(.*?)(?: (.*?))?$/.exec(params)

      if (matches) {
        self._events.emit('command', matches[2], from, matches[1], matches[3])
      }
    })

    self.irc.connect(self.host, self.port, function(socket) {
      self.irc.write('NICK '+ self.nick)
      self.irc.write('USER '+ self.user)
      self.irc.write('JOIN '+ self.channel)

      self.on('quit', function() {
        self.irc.quit()
      })
    })
  },
  on: function(event, listener) {
    this._events.on(event, listener)

    return this
  },
  say: function(to, text) {
    if (text === undefined) {
      text = to
      to   = undefined
    }

    this.irc.write('PRIVMSG '+ (to || this.channel) +' :'+ text)
  },
  quit: function() {
    this._events.emit('quit')
  }
}
