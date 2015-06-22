var FeedParser = require('feedparser')
  , request    = require('request')
  , fs         = require('fs')


function getRssFeed(name, url, filter, handler, saver)  {
  var req = request(url)
    , feedparser = new FeedParser();

  var items = []

  req.on('error', function (error) {
    // handle any request errors
  });
  req.on('response', function (res) {
    var stream = this;

    if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));

    stream.pipe(feedparser);
  });


  feedparser.on('error', function(error) {
    // always handle errors
  });
  feedparser.on('readable', function() {
    // This is where the action is!
    var stream = this
      , meta = this.meta // **NOTE** the "meta" is always available in the context of the feedparser instance
      , item;

    while (item = stream.read()) {
      items.push(item)
    }
  });

  feedparser.on('end', function() {
    var newItems = filter(name, items)

    for (var i in newItems) {
      handler(name, newItems[i].title, newItems[i].link)
    }

    if (newItems.length) {
    saver(name, newItems)
    }
  })
}


function feed(name, url, bot, options) {

  function handler(name, title, url) {
    bot.say(options && options.channels || bot.channels, name + ': ' + title + ' ' + url)
  }

  function filter(name, items) {
    var filename = bot.file(name + '_items.json')

    try {
      fs.statSync(filename)

      var oldItems = JSON.parse(fs.readFileSync(filename))
      var newItems = items.filter(function(item) {
        return oldItems.indexOf(item.guid) <= -1
      })

      return newItems
    }
    catch (e) {
      console.error(e)
    }

    return items
  }

  function saver(name, items) {
    console.log("Saving items")
    var filename = bot.file(name + '_items.json')

    var itemGuids = []
    for (var i in items) {
      itemGuids.push(items[i].guid)
    }

    var currentGuids = JSON.parse(fs.readFileSync(filename))

    fs.writeFile(filename, JSON.stringify(currentGuids.concat(itemGuids)), function(err) {
      if (err) return cb(err)

      console.log('saved stories to:', filename)

      if (typeof cb == 'function') cb()
    })

  }

  getRssFeed(name, url, filter, handler, saver)
}


module.exports = function(bot, options) {
  var interval = setInterval(function() {
    feed('hackernews', 'https://news.ycombinator.com/rss', bot, options)
  }, 1000 * 60)

  bot.on('quit', function() {
    clearInterval(interval)
  })
}
