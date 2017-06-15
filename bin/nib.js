#!/usr/bin/env node

var Nib    = require('../index').Nib
  , config = { 'host':    'localhost'
             , 'port':    6667
             , 'ssl':     false
             , 'channel': '#test'
             , 'nick':    'nib'
             , 'timeout': 1000 * 60 * 10
             , 'plugins': [ 'seen'
                          ]
             }

var n = new Nib(config)

process.on('SIGINT', function() {
  n.quit()
})
