#!/usr/bin/env node

var Nib    = require('../index').Nib
  , config = { 'host':    'localhost'
             , 'port':    6667
             , 'ssl':     false
             , 'channel': '#test'
             , 'nick':    'nib'
             , 'plugins': [ 'seen'
                          ]
             }

var n = new Nib(config)

process.on('SIGINT', function() {
  n.quit()
})
