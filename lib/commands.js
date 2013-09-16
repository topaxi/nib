var defaults = [
    // The !say command
    { name: 'say'
    , description: 'Says the given text.'
    , handler: function(from, to, text) {
        this._bot.reply(from, to, text)
      }
    }
    // The !info command, depends on !say
    // Prints out all non-hidden commands
  , { name: 'info'
    , description: 'Prints this message.'
    , handler: function(from, to) {
        this._bot.reply(from, to, '\u001fnib - Node IRC Bot, topaxi made me!')
        this._bot.reply(from, to, 'Available commands:')

        for (var i in this._bot.commands.commands) {
          var command = this._bot.commands.commands[i]

          if (command.hidden) continue

          var msg = '\u0002!'+ i

          if (command.description) {
            msg += '\u000f - '+ command.description
          }

          this._bot.reply(from, to, msg)
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

  bot.on('command', function(command, from, to, text) {
    var c = self.commands[command]

    if (!c) return

    try {
      c.handler(from, to, text)
    }
    catch (e) {
      if (c.error) c.error(e)
    }
  })
}

Commands.prototype.add = function(c) {
  c._bot = this._bot

  if (c.init) c.init(this._bot)

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
