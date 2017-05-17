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

    if (newItems.length != items.length) {
      // let's not spam the channel if we're reading
      // the feed for the first time

      for (var i in newItems) {
        handler(name, newItems[i].title, newItems[i].link)
      }
    }

    if (newItems.length > 0) {
      saver(name, newItems)
    }
  })
}


function feed(feed, bot) {

  function handler(name, title, url) {
    bot.say(feed.channels || bot.channels, feed.name + ': ' + title + ' ' + url)
  }

  function filter(name, items) {
    var filename = bot.file(name + '_items.json')

    if (!fs.existsSync(filename)) {
      return items
    }

    try {
      fs.statSync(filename)

      var oldItems = JSON.parse(fs.readFileSync(filename))

      var newItems = items.filter(function(item) {
        return oldItems.indexOf(item.guid) == -1
      })

      return newItems
    }
    catch (e) {
      console.error(e)
    }

    return items
  }

  function saver(name, items) {
    var filename = bot.file(name + '_items.json')

    var itemGuids = []

    for (var i in items) {
      itemGuids.push(items[i].guid)
    }

    var currentGuids = []
    if (fs.existsSync(filename)) {
      currentGuids = JSON.parse(fs.readFileSync(filename))
    }

    var result = currentGuids.concat(itemGuids)
    try {
      fs.writeFileSync(filename, JSON.stringify(result))
    }
    catch (e) {
      console.error(e)
    }

  }

  getRssFeed(feed.name, feed.url, filter, handler, saver)
}


module.exports = function(bot, options) {
  var feeds = options.feeds
  var stepper = 0

  var interval = setInterval(function() {
      var rssFeed = feeds[stepper]

      feed(rssFeed, bot)

      // rotate
      stepper = (stepper + 1) % feeds.length

  }, options.interval)

  bot.on('quit', function() {
    clearInterval(interval)
  })
}
