var path = require('path')

var defaults = [
    // The !say command
    { name: 'say'
    , info: 'Says the given text.'
    , handler: function(from, to, text) {
        this._bot.reply(from, to, text)
      }
    }
    // The !info command, depends on !say
    // Prints out all non-hidden commands
  , { name: 'info'
    , info: 'Prints this message.'
    , description: 'Prints a list of commands or the commands description.'
    , hidden: true
    , handler: function(from, to, name) {
        name = name ? name.trim() : ''

        var reply = function(msg) {
          msg.split('\n').forEach(function(line) {
            this.reply(from, to, line)
          }, this)
        }.bind(this._bot)

        if (name) {
          if (name[0] == '!') name = name.slice(1)

          var cmd = this.getCommand(name)
            , msg = '\u0002!'+ name +'\u000f'

          if (!cmd) {
            reply('I don\'t know '+ msg)
          }
          else if (cmd.description) {
            reply(msg +' '+ cmd.description)
          }
          else {
            reply(msg +' has no description, sorry :(')
          }

          return
        }

        reply('\u001fnib - Node IRC Bot, topaxi made me!')
        reply('Available commands:')

        for (var i in this._bot.commands.commands) {
          var command = this._bot.commands.commands[i]

          if (command.hidden) continue

          var msg = '\u0002!'+ i

          if (command.info) {
            msg += '\u000f - '+ command.info
          }

          reply(msg)
        }
      }
    }
]

// ============================================================================

module.exports.Command  = Command
module.exports.Commands = Commands

function Command() { }
Command.prototype.handler = noop
Command.prototype.error   = console.error

/**
 * Returns an unique filename for each nib instance, located in the plugin folder
 */
Command.prototype.file = function(filename) {
  var dirname = path.dirname(require('callsite')()[1].getFileName())

  return dirname +'/'+ this._bot.nick +'_'+ this._bot.host +'_'+ filename
}

Command.prototype.getCommand = function(name) {
  return this._bot.commands.commands[name]
}

Command.extend = function(properties) {
  var c = new this

  for (var i in properties) {
    c[i] = properties[i]
  }

  return c
}

function Commands(bot) {
  var self = this

  self.commands = Object.create(null)
  self._bot     = bot

  defaults.forEach(function(command) {
    this.add(Command.extend(command))
  }, self)

  bot.on('command', function(command, from, to, text, prefix) {
    var c = self.commands[command]

    if (!c) return

    try {
      c.handler(from, to, text || '', prefix)
    }
    catch (e) {
      if (c.error) c.error(e)
    }
  })
}

Commands.prototype.add = function(c, options) {
  c._bot = this._bot

  if (c.init) c.init(this._bot, options)

  this.commands[c.name] = c
}

Commands.prototype.remove = function(name) {
  var c = this.commands[name]

  if (c.cleanup) c.cleanup(this._bot)

  delete this.commands[name]

  return c
}

Commands.prototype.reload = function(name) {
  this.add(this.remove(name))
}

function noop() { }
