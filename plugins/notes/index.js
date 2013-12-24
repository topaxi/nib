var Command = require('../../lib/commands').Command
  , fs      = require('fs')

module.exports = Command.extend({
    name: 'leavenote'
  , info: 'Stores a note for a idleing user.'
  , description: 'Stores a note for an offline or idleing user, '
                +'until he returns.'
  , init: function(bot) {
    this.printAllNotes = this.printAllNotes.bind(this)
    this.readNotes()

    // Give note to user on join
    bot.irc.on('join', this.printAllNotes)

    // Or if user writes to the channel
    // future version could maybe check idle status
    bot.irc.on('privmsg', this.printAllNotes)
  }
  , cleanup: function(bot) {
    bot.irc.off('join', this.printAllNotes)
    bot.irc.off('privmsg', this.printAllNotes)
  }
  , handler: function(from, to, message) {
    if (!message) {
      return this._bot.notice(from, 'No message given!')
    }

    var self   = this
      , bot    = self._bot
      , noteTo = message.split(' ')[0]
      , note   = message.slice(noteTo.length + 1)

    if (!note.length) {
      return bot.notice(from, 'No note given!')
    }

    note = { 'from' : from
           , 'nick' : noteTo
           , 'note' : note
           , 'time' : new Date
           }

    if (this._notes[noteTo]) {
      this._notes[noteTo].push(note)
    }
    else {
      this._notes[noteTo] = [note]
    }

    this.saveNotes()

    bot.notice(from, 'Added note for '+ noteTo)
  }
  , readNotes: function() {
    var filename = this._bot.file('notes.json')

    try {
      fs.statSync(filename)

      this._notes = JSON.parse(fs.readFileSync(filename))
    }
    catch (e) {
      console.error(e)
      this._notes = {}
    }
  }
  , saveNotes: function(cb) {
    var filename = this._bot.file('notes.json')

    fs.writeFile(filename, JSON.stringify(this._notes), function(err) {
      if (err) return cb(err)

      console.log('saved notes to:', filename)

      if (typeof cb == 'function') cb()
    })
  }
  , printAllNotes: function(user) {
    var nick  = user.split('!')[0]
      , notes = this._notes[nick]

    if (notes && notes.length > 0) {
      this._bot.say(nick, 'people left notes for you:')

      notes.forEach(function(note) {
        var d         = new Date(note.time)
          , timestamp = d.getDate() +'.'+ (d.getMonth() + 1) + '.'
                        +' '+
                        d.getHours() +':'+ d.getMinutes()

        this._bot.say(nick,
          'from '+ note.from +', added '+ timestamp +': '+ note.note)

        this._bot.notice(note.from, 'Note to '+ nick +' delivered!')
      }, this)

      delete this._notes[nick]

      this.saveNotes()
    }
  }
})
