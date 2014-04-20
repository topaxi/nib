
/**
 * Simple plugin which writes "13:37" @ 13:37 into the channel
 */
module.exports = function(bot, options) {
  var interval = setInterval(function() {
    var d = new Date

    if (d.getHours() == 13 && d.getMinutes() == 37) {
      bot.say(options && options.channels || bot.channels, '13:37')
    }
  }, 1000 * 60)

  bot.on('quit', function() {
    clearInterval(interval)
  })
}
