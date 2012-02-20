var Commands = require('../lib/commands')

Commands.add('leavenote'
  , 'Stores a note for a idleing user, until he returns.'
  , function(bot) {
    bot._notes = {}

    // Give note to user on join
    bot.irc.on('join', printAllNotes)

    // Or if user writes to the channel
    // future version could maybe check idle status
    bot.irc.on('privmsg', printAllNotes)

    function printAllNotes(user) {
      var nick  = user.split('!')[0]
        , notes = bot._notes[nick]

      if (notes && notes.length > 0) {
        bot.notice(nick, 'people left notes for you:')

        notes.forEach(function(note) {
          var d         = note.time
            , timestamp = d.getDate() +'.'+ (d.getMonth() + 1) + '.'
                          +' '+
                          d.getHours() +':'+ d.getMinutes()

          bot.notice(nick,
            'from '+ note.from +', added '+ timestamp +': '+ note.note)
        })

        bot._notes[nick] = []
      }
    }
  }
  , function(from, to, message) {
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

    if (bot._notes[noteTo]) {
      bot._notes[noteTo].push(note)
    }
    else {
      bot._notes[noteTo] = [note]
    }

    bot.notice(from, 'Added note for '+ noteTo)
  }
)
