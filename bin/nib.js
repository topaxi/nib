#!/usr/bin/env node

var Nib    = require('../index').Nib
  , config = { 'host':    'irc.freenode.org'
             , 'port':    6667
             , 'ssl':     false
             , 'channel': '#bern'
             , 'nick':    'nibller'
             , 'timeout': 1000 * 60 * 10
             , 'plugins': [ 'timetable'
                          ]
             }

var n = new Nib(config)

process.on('SIGINT', function() {
  n.quit()
})
