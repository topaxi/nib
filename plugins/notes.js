var Commands = require('../lib/commands')

Commands.add('leavenote'
  , 'Stores a note for a idleing user, until he returns.'
  , function(bot) {

    bot._notes = {}

    /* give note to user on join */
    bot.irc.on('join', function(user) {
      printAllNotes(user)
    })

    /* or if user writes to the channel */
    /* future version could maybe check idle status */
    bot.irc.on('privmsg', function(user, message) {
      printAllNotes(user)
    })

    function printAllNotes(user) {
      var nick = user.split('!')[0]
      if (bot._notes[nick] && bot._notes[nick].length > 0) {
        notes = bot._notes[nick]
        bot.say('people left notes for you '+ nick +':')
        for (noteIndex in notes) {
          note = notes[noteIndex]
          d = note.time
          timestamp = d.getDate() +'.'+ (d.getMonth() + 1) + '.'
                      +' '+ 
                      d.getHours() +':'+ d.getMinutes();

          bot.say('from '+ note.from +', added '+ timestamp +': '+ note.note)
        }
        bot._notes[nick] = []
      }
    }
  }
  , function(from, to, message) {

    var self = this
      , bot = self._bot
      , noteTo = message.split(' ')[0]
      , note = message.slice(noteTo.length + 1)

    if (note.length == 0) { 
      return say('No note given!')
    }

    if (bot._notes[noteTo]) {
      // already added a note
      bot._notes[noteTo].push({ 'from' : from
                              , 'nick' : noteTo
                              , 'note' : note
                              , 'time' : new Date
                              })
    }
    else {
      // first note
      bot._notes[noteTo] = [{ 'from' : from
                            , 'nick' : noteTo
                            , 'note' : note
                            , 'time' : new Date
                            }]
    } 
    
    function say(text) {
      self.say(from, to, from +': '+ text)
    }
  }
)
