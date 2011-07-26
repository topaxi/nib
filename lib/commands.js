command('info', 'Prints this message.', function(from, to) {
  this.say(from, to, 'ngib - Node Git IRC Bot')
  this.say(from, to, '=======================')
  this.say(from, to, 'Available commands:')

  for (var i in this) {
    if (typeof this[i] == 'function') {
      if (this[i].desc) {
        this.say(from, to, '!'+ i +' - '+ this[i].desc)
      }
      else {
        this.say(from, to, '!'+ i)
      }
    }
  }
})

command('say', 'Says the given text.', function(from, to, text) {
  this._bot.say(to == this._bot.nick ? from : to, text)
})

// ============================================================================

module.exports = Commands
function Commands(bot) {
  this._bot = bot
}

function command(name, desc, command) {
  Commands.prototype[name]      = command
  Commands.prototype[name].desc = desc
}

Commands.add = command
