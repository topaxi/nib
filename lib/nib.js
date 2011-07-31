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

    props = props || {}
    props.user = 'nib 0 * NodeIrcBot - https://github.com/topaxi/nib'

    for (var i in props) {
      self[i] = props[i]
    }

    self._events  = new EventEmitter
    self.irc      = new irc.Client(props)
    self.commands = new Commands(self)

    self.irc.on('privmsg', function(prefix, params) {
      var from    = prefix.split('!')[0]
        , matches = /^(.*?) :!(.*?)(?: (.*?))?$/.exec(params)

      if (matches) {
        self._events.emit('command', matches[2], from, matches[1], matches[3])
      }
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
    this.irc.quit()
  }
}
