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
        this.say(from, to, '\u001fnib - Node IRC Bot')
        this.say(from, to, 'Available commands:')

        this.commands.filter(function(c) { return !c.hidden }).forEach(function(command) {
          var msg = '\u0002!'+ i

          if (command.description) {
            msg += '\u000f - '+ commands.description
          }

          this.say(from, to, msg)
        }, this)
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

  defaults.forEach(function(command) {
    this.add(Command.extend(command))
  }, self)

  self._bot = bot

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
