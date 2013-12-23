var net          = require('net')
  , tls          = require('tls')
  , EventEmitter = require('events').EventEmitter
  , irc          = require('./irc')
  , Commands     = require('./commands').Commands

module.exports = Nib
function Nib(props) {
  this._init(props)
}

Nib.prototype = {
  _init: function(props) {
    var self = this
      , i

    props = props || {}
    props.user = 'nib 0 * NodeIrcBot - https://github.com/topaxi/nib'

    self.plugins = []

    for (i in props) {
      self[i] = props[i]
    }

    if (!self.channels && self.channel) {
      self.channels = [self.channel]

      delete self.channel
    }

    self._events = new EventEmitter
    self.irc     = new irc.Client({ 'host':               self.host
                                  , 'port':               self.port
                                  , 'ssl':                self.ssl
                                  , 'rejectUnauthorized': self.rejectUnauthorized
                                  , 'timeout':            self.timeout
                                  , 'password':           self.password
                                  })

    self.loadPlugins()

    self.irc.on('privmsg', function(from, to, msg) {
      var matches = /^!(.*?)(?: (.*?))?$/.exec(msg)

      if (matches) {
        self._events.emit('command', matches[1], from, to, matches[2])
      }
    })

    self.irc.on('mode', function(prefix, params) {
      var from    = prefix.split('!')[0]
        , matches = /^(.*?) (\+|\-)(.*?) (.*?)$/.exec(params)

      if (matches) {
        var modes = matches[3].split('')
          , users = matches[4].split(' ')

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

    self.irc.connect(function(socket) {
      self.irc.nick(self.nick)
      self.irc.user(self.user)

      self.irc.once('mode', function() {
        self.irc.join(self.channels)
      })

      self.on('quit', function() {
        self.irc.quit()
      })
    })
  },
  loadPlugins: function() {
    this.commands = new Commands(this)

    for (var i in this.plugins) {
      var pluginName = this.plugins[i]
        , options    = null
        , plugin

      if (Array.isArray(pluginName)) {
        options    = pluginName[1]
        pluginName = pluginName[0]
      }

      plugin = require('../plugins/'+ pluginName)

      if (typeof plugin == 'function') {
        plugin(this, options)
      }
      else {
        this.commands.add(plugin, options)
      }

      console.log('Loaded plugin', pluginName)

      if (options) {
        console.log('With options:', options)
      }
    }

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
  // Reply for private msg and channel msg
  reply: function(from, to, text) {
    this.say(to == this.nick ? from : to, text)
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
