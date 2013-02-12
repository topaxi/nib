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

    if (!self.channels && self.channel) {
      self.channels = [self.channel]

      delete self.channel
    }

    self._events = new EventEmitter
    self.irc     = new irc.Client({ 'host':     props.host
                                  , 'port':     props.port
                                  , 'ssl':      props.ssl
                                  , 'timeout':  props.timeout
                                  , 'password': props.password
                                  })

    if (self.plugins && self.plugins.length) {
      for (i in self.plugins) {
        plugin = require('../plugins/'+ self.plugins[i])

        if (typeof plugin == 'function') {
          plugin(self)

          console.log('Loaded plugin ' + self.plugins[i])
        }
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

    self.irc.on('mode', function(prefix, params) {
      var from    = prefix.split('!')[0]
        , matches = /^(.*?) (\+|\-)(.*?) (.*?)$/.exec(params)

      if (matches) {
        var modes = matches[3].split('')
            users = matches[4].split(' ')

        modes.forEach(function(mode, user) {
          self._events.emit('channel mode'
                           , matches[2]
                           , mode
                           , users[user]
                           , matches[1]
                           , from)
        })

        return
      }
    })

    self.irc.connect(self.host, self.port, function(socket) {
      self.irc.nick(self.nick)
      self.irc.user(self.user)

      setTimeout(function() {
        self.irc.join(self.channels)
      }, 100)

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

    this.irc.privmsg(to || this.channels, text)
  },
  notice: function(to, text) {
    if (text === undefined) {
      text = to
      to   = undefined
    }

    this.irc.notice(to || this.channels, text)
  },
  quit: function() {
    this._events.emit('quit')
  }
}
