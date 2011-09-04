
/**
 * Simple plugin which writes "13:37" @ 13:37 into the channel
 */
module.exports = function(bot) {
  var interval = setInterval(function() {
    var d = new Date

    if (d.getHours() == 13 && d.getMinutes() == 37) {
      bot.say('13:37')
    }
  }, 1000 * 60)

  bot.on('quit', function() {
    clearInterval(interval)
  })
}
