var Commands = require('../../lib/commands')
  , fs       = require('fs')

Commands.add('leavenote'
  , 'Stores a note for a idleing user, until he returns.'
  , function(bot) {
    readNotes(bot)

    // Give note to user on join
    bot.irc.on('join', printAllNotes)

    // Or if user writes to the channel
    // future version could maybe check idle status
    bot.irc.on('privmsg', printAllNotes)

    function printAllNotes(user) {
      var nick  = user.split('!')[0]
        , notes = bot._notes[nick]

      if (notes && notes.length > 0) {
        bot.say(nick, 'people left notes for you:')

        notes.forEach(function(note) {
          var d         = new Date(note.time)
            , timestamp = d.getDate() +'.'+ (d.getMonth() + 1) + '.'
                          +' '+
                          d.getHours() +':'+ d.getMinutes()

          bot.say(nick,
            'from '+ note.from +', added '+ timestamp +': '+ note.note)

          bot.notice(note.from, 'Note to '+ nick +' delivered!')
        })

        delete bot._notes[nick]

        saveNotes(bot)
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

    saveNotes(bot)

    bot.notice(from, 'Added note for '+ noteTo)
  }
)

function readNotes(bot) {
  var filename = __dirname +'/'+ bot.nick +'_'+ bot.host +'.notes'

  try {
    fs.statSync(filename)

    bot._notes = JSON.parse(fs.readFileSync(filename))
  }
  catch (e) {
    bot._notes = {}
  }
}

function saveNotes(bot, cb) {
  var filename = __dirname +'/'+ bot.nick +'_'+ bot.host +'.notes'

  fs.writeFile(filename, JSON.stringify(bot._notes), function(err) {
    if (err) return cb(err)

    console.log('saved notes to:', filename)

    if (typeof cb == 'function') cb()
  })
}
